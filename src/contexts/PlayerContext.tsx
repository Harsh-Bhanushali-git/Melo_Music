import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { YouTubeVideo } from '@/lib/youtube';
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
  playSong: (song: YouTubeVideo) => void;
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

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timeUpdateRef = useRef<number>();

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT) {
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

  // Create player when ready and song changes
  useEffect(() => {
    if (!isReady || !currentSong) return;

    // Create container if it doesn't exist
    if (!containerRef.current) {
      containerRef.current = document.createElement('div');
      containerRef.current.id = 'youtube-player-container';
      containerRef.current.className = 'youtube-audio-only';
      document.body.appendChild(containerRef.current);

      const playerDiv = document.createElement('div');
      playerDiv.id = 'youtube-player';
      containerRef.current.appendChild(playerDiv);
    }

    // Destroy existing player
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    // Create new player
    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: currentSong.id,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event: any) => {
          event.target.setVolume(isMuted ? 0 : volume);
          setDuration(event.target.getDuration());
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

    addToRecentlyPlayed(currentSong);

    return () => {
      if (timeUpdateRef.current) {
        cancelAnimationFrame(timeUpdateRef.current);
      }
    };
  }, [isReady, currentSong?.id]);

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
      timeUpdateRef.current = requestAnimationFrame(updateTime);
    };

    if (isPlaying) {
      timeUpdateRef.current = requestAnimationFrame(updateTime);
    }

    return () => {
      if (timeUpdateRef.current) {
        cancelAnimationFrame(timeUpdateRef.current);
      }
    };
  }, [isPlaying]);

  const handleSongEnd = useCallback(() => {
    if (repeatMode === 'one') {
      playerRef.current?.seekTo(0);
      playerRef.current?.playVideo();
    } else if (currentIndex < queue.length - 1) {
      playNext();
    } else if (repeatMode === 'all' && queue.length > 0) {
      setCurrentIndex(0);
      setCurrentSong(queue[0]);
    } else {
      setIsPlaying(false);
    }
  }, [repeatMode, currentIndex, queue]);

  const playSong = useCallback((song: YouTubeVideo) => {
    setQueue([song]);
    setCurrentIndex(0);
    setCurrentSong(song);
  }, []);

  const playQueue = useCallback((songs: YouTubeVideo[], startIndex = 0) => {
    if (songs.length === 0) return;
    const shuffledSongs = isShuffled ? [...songs].sort(() => Math.random() - 0.5) : songs;
    setQueue(shuffledSongs);
    setCurrentIndex(startIndex);
    setCurrentSong(shuffledSongs[startIndex]);
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
    setIsShuffled(prev => !prev);
  }, []);

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
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
