import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

import { YouTubeVideo, searchYouTube } from '@/lib/youtube';
import { addToRecentlyPlayed } from '@/lib/storage';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface PlayerContextType {
  currentSong: YouTubeVideo | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: YouTubeVideo[];
  playSong: (song: YouTubeVideo, relatedSongs?: YouTubeVideo[]) => void;
  playQueue: (songs: YouTubeVideo[], startIndex?: number) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (song: YouTubeVideo) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<YouTubeVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [queue, setQueue] = useState<YouTubeVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isReady, setIsReady] = useState(false);
  const [playerCreated, setPlayerCreated] = useState(false);

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timeUpdateRef = useRef<number>();
  const queueRef = useRef(queue);
  const currentIndexRef = useRef(currentIndex);
  const repeatModeRef = useRef(repeatMode);

  // Keep refs in sync
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setIsReady(true);
    };
  }, []);

  const handleSongEnd = useCallback(() => {
    const rm = repeatModeRef.current;
    const q = queueRef.current;
    const ci = currentIndexRef.current;

    if (rm === 'one') {
      playerRef.current?.seekTo(0);
      playerRef.current?.playVideo();
    } else if (ci < q.length - 1) {
      const nextIdx = ci + 1;
      setCurrentIndex(nextIdx);
      setCurrentSong(q[nextIdx]);
    } else if (rm === 'all' && q.length > 0) {
      setCurrentIndex(0);
      setCurrentSong(q[0]);
    } else {
      setIsPlaying(false);
    }
  }, []);

  // Create player once, then reuse with loadVideoById
  useEffect(() => {
    if (!isReady || playerCreated) return;

    // Create container
    if (!containerRef.current) {
      containerRef.current = document.createElement('div');
      containerRef.current.id = 'youtube-player-container';
      containerRef.current.className = 'youtube-audio-only';
      document.body.appendChild(containerRef.current);

      const playerDiv = document.createElement('div');
      playerDiv.id = 'youtube-player';
      containerRef.current.appendChild(playerDiv);
    }

    playerRef.current = new window.YT.Player('youtube-player', {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: () => {
          setPlayerCreated(true);
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            setDuration(event.target.getDuration());
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === window.YT.PlayerState.ENDED) {
            handleSongEnd();
          }
        },
      },
    });
  }, [isReady, playerCreated, handleSongEnd]);

  // Load video when song changes (reuse player)
  useEffect(() => {
    if (!playerCreated || !currentSong || !playerRef.current) return;

    playerRef.current.loadVideoById(currentSong.id);
    playerRef.current.setVolume(isMuted ? 0 : volume);
    setCurrentTime(0);
    setDuration(0);
    addToRecentlyPlayed(currentSong);

    // Dispatch storage event for liked songs page to pick up recently played
    window.dispatchEvent(new Event('storage'));
  }, [playerCreated, currentSong?.id]);

  // Update current time via polling (more reliable than rAF for YT)
  useEffect(() => {
    if (!isPlaying) {
      if (timeUpdateRef.current) clearInterval(timeUpdateRef.current);
      return;
    }

    timeUpdateRef.current = window.setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
      if (playerRef.current?.getDuration) {
        const d = playerRef.current.getDuration();
        if (d > 0) setDuration(d);
      }
    }, 250);

    return () => {
      if (timeUpdateRef.current) clearInterval(timeUpdateRef.current);
    };
  }, [isPlaying]);

  // Auto-queue similar songs based on the song's mood/genre
  const fetchAndQueueRelated = useCallback(async (song: YouTubeVideo) => {
    try {
      // Extract artist name (channel title), clean it
      const artist = song.channelTitle
        .replace(/[-–]?\s*(Topic|VEVO|Official|Music|Records|Channel)$/gi, '')
        .trim();

      // Clean song title to extract genre/mood keywords
      const cleanTitle = song.title
        .replace(/\(.*?\)/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/official|video|audio|lyrics|hd|full|song|ft\.?|feat\.?/gi, '')
        .replace(/[|•·]/g, ' ')
        .trim();

      // Use multiple diverse queries to get variety
      const queries = [
        `${artist} top songs`,
        `songs like ${cleanTitle.split(' ').slice(0, 3).join(' ')} mix`,
        `${artist} similar artists music`,
      ];

      // Pick 2 random queries to avoid repetition across sessions
      const selectedQueries = queries.sort(() => Math.random() - 0.5).slice(0, 2);

      const allResults: YouTubeVideo[] = [];
      const seenTitles = new Set<string>();
      const seenIds = new Set<string>([song.id]);

      // Helper to normalize titles for dedup (removes noise, lowercase)
      const normalizeTitle = (title: string) =>
        title
          .toLowerCase()
          .replace(/\(.*?\)/g, '')
          .replace(/\[.*?\]/g, '')
          .replace(/official|video|audio|lyrics|hd|full|song|ft\.?|feat\.?/gi, '')
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

      for (const query of selectedQueries) {
        try {
          const data = await searchYouTube(query);
          for (const item of data.items) {
            const normalized = normalizeTitle(item.title);
            // Skip if same video, or if title is too similar (same song different upload)
            if (seenIds.has(item.id)) continue;
            if (seenTitles.has(normalized)) continue;
            // Skip if the normalized title is very close to the original song
            const originalNorm = normalizeTitle(song.title);
            if (normalized === originalNorm) continue;
            // Check for >70% word overlap (likely same song)
            const normWords = new Set(normalized.split(' ').filter(w => w.length > 2));
            const origWords = new Set(originalNorm.split(' ').filter(w => w.length > 2));
            if (origWords.size > 0) {
              const overlap = [...normWords].filter(w => origWords.has(w)).length;
              if (overlap / Math.max(origWords.size, 1) > 0.7) continue;
            }

            seenIds.add(item.id);
            seenTitles.add(normalized);
            allResults.push(item);
          }
        } catch {
          // Continue with other queries
        }
      }

      // Shuffle results for variety
      const shuffled = allResults.sort(() => Math.random() - 0.5).slice(0, 20);

      if (shuffled.length > 0) {
        setQueue(prev => {
          if (prev.length === 1 && prev[0].id === song.id) {
            return [song, ...shuffled];
          }
          return prev;
        });
      }
    } catch {
      // Silently fail - related songs are optional
    }
  }, []);

  const playSong = useCallback((song: YouTubeVideo, relatedSongs?: YouTubeVideo[]) => {
    if (relatedSongs && relatedSongs.length > 0) {
      // Find index of this song in the related list
      const idx = relatedSongs.findIndex(s => s.id === song.id);
      setQueue(relatedSongs);
      setCurrentIndex(idx >= 0 ? idx : 0);
    } else {
      setQueue([song]);
      setCurrentIndex(0);
      // Auto-fetch similar songs for the queue
      fetchAndQueueRelated(song);
    }
    setCurrentSong(song);
  }, [fetchAndQueueRelated]);

  const playQueue = useCallback((songs: YouTubeVideo[], startIndex = 0) => {
    if (songs.length === 0) return;
    let finalSongs = songs;
    let finalIndex = startIndex;
    if (isShuffled) {
      // Keep the selected song first, shuffle the rest
      const selected = songs[startIndex];
      const rest = songs.filter((_, i) => i !== startIndex).sort(() => Math.random() - 0.5);
      finalSongs = [selected, ...rest];
      finalIndex = 0;
    }
    setQueue(finalSongs);
    setCurrentIndex(finalIndex);
    setCurrentSong(finalSongs[finalIndex]);
  }, [isShuffled]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const seekTo = useCallback((time: number) => {
    playerRef.current?.seekTo(time, true);
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    setIsMuted(vol === 0);
    playerRef.current?.setVolume(vol);
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      playerRef.current?.setVolume(volume);
      setIsMuted(false);
    } else {
      playerRef.current?.setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => {
      const newShuffled = !prev;
      if (newShuffled && queue.length > 1 && currentSong) {
        // Shuffle queue keeping current song in place
        const currentId = currentSong.id;
        const others = queue.filter(s => s.id !== currentId).sort(() => Math.random() - 0.5);
        const newQueue = [currentSong, ...others];
        setQueue(newQueue);
        setCurrentIndex(0);
      }
      return newShuffled;
    });
  }, [queue, currentSong]);

  const cycleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    const nextIndex = (currentIndex + 1) % queue.length;
    setCurrentIndex(nextIndex);
    setCurrentSong(queue[nextIndex]);
  }, [queue, currentIndex]);

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;
    if (currentTime > 3) {
      seekTo(0);
      return;
    }
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentSong(queue[prevIndex]);
  }, [queue, currentIndex, currentTime, seekTo]);

  const addToQueue = useCallback((song: YouTubeVideo) => {
    setQueue(prev => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
    // Adjust currentIndex if needed
    setCurrentIndex(prev => {
      if (index < prev) return prev - 1;
      return prev;
    });
  }, []);

  const clearQueue = useCallback(() => {
    if (currentSong) {
      setQueue([currentSong]);
      setCurrentIndex(0);
    } else {
      setQueue([]);
      setCurrentIndex(-1);
    }
  }, [currentSong]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        duration,
        currentTime,
        volume,
        isMuted,
        isShuffled,
        repeatMode,
        queue,
        playSong,
        playQueue,
        togglePlay,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeat,
        playNext,
        playPrevious,
        addToQueue,
        removeFromQueue,
        clearQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
