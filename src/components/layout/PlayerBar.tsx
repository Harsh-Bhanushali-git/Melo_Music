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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    duration,
    currentTime,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
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
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-20 border-t border-border bg-card">
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

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={playPrevious}
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={togglePlay}
              disabled={!currentSong}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 pl-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={playNext}
            >
              <SkipForward className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', repeatMode !== 'off' && 'text-primary')}
              onClick={cycleRepeat}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="h-4 w-4" />
              ) : (
                <Repeat className="h-4 w-4" />
              )}
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
              onValueChange={([value]) => {
                const time = (value / 100) * duration;
                seekTo(time);
              }}
            />
            <span className="w-10 text-xs text-muted-foreground">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Controls */}
        <div className="flex w-64 items-center justify-end gap-2">
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
  );
}
