import { usePlayer } from '@/contexts/PlayerContext';
import { formatTime } from '@/lib/youtube';
import { isLikedSong, addLikedSong, removeLikedSong } from '@/lib/storage';
import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  ListMusic,
  ChevronUp,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { QueueDrawer } from '@/components/QueueDrawer';

interface PlayerBarProps {
  onMobileExpand?: (expanded: boolean) => void;
}

export function PlayerBar({ onMobileExpand }: PlayerBarProps) {
  const {
    currentSong,
    isPlaying,
    duration,
    currentTime,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    queue,
    togglePlay,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    playNext,
    playPrevious,
  } = usePlayer();

  const [isLiked, setIsLiked] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [mobileExpanded, setMobileExpandedState] = useState(false);
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);

  const setMobileExpanded = (val: boolean) => {
    setMobileExpandedState(val);
    onMobileExpand?.(val);
  };

  useEffect(() => {
    if (currentSong) {
      setIsLiked(isLikedSong(currentSong.id));
    }
  }, [currentSong]);

  const handleLike = () => {
    if (!currentSong) return;
    if (isLiked) {
      removeLikedSong(currentSong.id);
    } else {
      addLikedSong(currentSong);
    }
    setIsLiked(!isLiked);
    window.dispatchEvent(new Event('likedSongsUpdated'));
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <>
      <QueueDrawer open={queueOpen} onClose={() => setQueueOpen(false)} />

      {/* Desktop Player */}
      <div className="fixed bottom-0 left-0 right-0 z-50 hidden h-20 border-t border-border bg-card md:block">
        <div className="flex h-full items-center px-4">
          {/* Current Song Info */}
          <div className="flex w-64 items-center gap-3">
            {currentSong ? (
              <>
                <img
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="h-14 w-14 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {currentSong.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {currentSong.channelTitle}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={handleLike}
                >
                  <Heart
                    className={cn('h-4 w-4', isLiked && 'fill-primary text-primary')}
                  />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex h-14 w-14 items-center justify-center rounded bg-muted">
                  <ListMusic className="h-6 w-6" />
                </div>
                <span className="text-sm">No song playing</span>
              </div>
            )}
          </div>

          {/* Player Controls */}
          <div className="flex flex-1 flex-col items-center gap-1 px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', isShuffled && 'text-primary')}
                onClick={toggleShuffle}
              >
                <Shuffle className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={playPrevious}>
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                variant="default"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={togglePlay}
                disabled={!currentSong}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
              </Button>

              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={playNext}>
                <SkipForward className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', repeatMode !== 'off' && 'text-primary')}
                onClick={cycleRepeat}
              >
                {repeatMode === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex w-full max-w-xl items-center gap-2">
              <span className="w-10 text-right text-xs text-muted-foreground">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[progress]}
                max={100}
                step={0.1}
                className="flex-1"
                onValueChange={([value]) => seekTo((value / 100) * duration)}
              />
              <span className="w-10 text-xs text-muted-foreground">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume & Queue */}
          <div className="flex w-64 items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn('relative h-8 w-8', queueOpen && 'text-primary')}
              onClick={() => setQueueOpen(!queueOpen)}
            >
              <ListMusic className="h-4 w-4" />
              {queue.length > 1 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {queue.length}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
              <VolumeIcon className="h-4 w-4" />
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              className="w-24"
              onValueChange={([value]) => setVolume(value)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Player - Compact */}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden transition-all duration-300',
        mobileExpanded ? 'h-auto' : 'h-16'
      )}>
        {/* Mini player row */}
        <div
          className="flex h-16 items-center gap-3 px-3"
          onClick={() => currentSong && setMobileExpanded(!mobileExpanded)}
        >
          {currentSong ? (
            <>
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="h-10 w-10 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {currentSong.title}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {currentSong.channelTitle}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); handleLike(); }}
              >
                <Heart className={cn('h-4 w-4', isLiked && 'fill-primary text-primary')} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
              </Button>
              {!mobileExpanded && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={(e) => { e.stopPropagation(); setMobileExpanded(!mobileExpanded); }}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                <ListMusic className="h-5 w-5" />
              </div>
              <span className="text-sm">No song playing</span>
            </div>
          )}
        </div>

        {/* Progress bar (thin, always visible when song playing) */}
        {currentSong && !mobileExpanded && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Expanded mobile controls */}
        {mobileExpanded && currentSong && (
          <div className="animate-fade-in space-y-4 px-4 pb-6">
            {/* Seekbar */}
            <div className="flex items-center gap-2">
              <span className="w-9 text-right text-[11px] text-muted-foreground">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[progress]}
                max={100}
                step={0.1}
                className="flex-1"
                onValueChange={([value]) => seekTo((value / 100) * duration)}
              />
              <span className="w-9 text-[11px] text-muted-foreground">
                {formatTime(duration)}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-5">
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', isShuffled && 'text-primary')}
                onClick={toggleShuffle}
              >
                <Shuffle className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={playPrevious}>
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                variant="default"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 pl-0.5" />}
              </Button>

              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={playNext}>
                <SkipForward className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', repeatMode !== 'off' && 'text-primary')}
                onClick={cycleRepeat}
              >
                {repeatMode === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
              </Button>
            </div>

            {/* Extra actions */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={cn('gap-2', queueOpen && 'text-primary')}
                onClick={() => setQueueOpen(!queueOpen)}
              >
                <ListMusic className="h-4 w-4" />
                Queue {queue.length > 1 && `(${queue.length})`}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setShowPlaylistPicker(true)}
              >
                <Plus className="h-4 w-4" />
                Add to Playlist
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMobileExpanded(false)}
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
