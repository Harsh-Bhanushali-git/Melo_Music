import { usePlayer } from '@/contexts/PlayerContext';
import { formatTime } from '@/lib/youtube';
import { isLikedSong, addLikedSong, removeLikedSong } from '@/lib/storage';
import { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Volume1, Heart, List, ChevronUp, ChevronDown, Plus, ListMusic,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { QueueDrawer } from '@/components/QueueDrawer';
import { AddToPlaylistDialog } from '@/components/AddToPlaylistDialog';

interface PlayerBarProps {
  onMobileExpand?: (expanded: boolean) => void;
  sidebarOpen?: boolean;
}

export function PlayerBar({ onMobileExpand, sidebarOpen }: PlayerBarProps) {
  const {
    currentSong, isPlaying, duration, currentTime, volume, isMuted,
    isShuffled, repeatMode, queue,
    togglePlay, seekTo, setVolume, toggleMute, toggleShuffle, cycleRepeat, playNext, playPrevious,
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
    if (currentSong) setIsLiked(isLikedSong(currentSong.id));
  }, [currentSong]);

  useEffect(() => {
    if ((sidebarOpen || queueOpen) && mobileExpanded) {
      setMobileExpandedState(false);
      onMobileExpand?.(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarOpen, queueOpen]);

  const handleLike = () => {
    if (!currentSong) return;
    if (isLiked) removeLikedSong(currentSong.id);
    else addLikedSong(currentSong);
    setIsLiked(!isLiked);
    window.dispatchEvent(new Event('likedSongsUpdated'));
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  // Swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeTriggered = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    swipeTriggered.current = false;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null || swipeTriggered.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swipeTriggered.current = true;
      if (dx < 0) playNext(); else playPrevious();
    }
  };
  const handleTouchEnd = () => { touchStartX.current = null; touchStartY.current = null; };

  return (
    <>
      <QueueDrawer open={queueOpen} onClose={() => setQueueOpen(false)} />
      <AddToPlaylistDialog open={showPlaylistPicker} onOpenChange={setShowPlaylistPicker} song={currentSong} />

      {/* ───────── Desktop Player ───────── */}
      <div className="glass-heavy fixed bottom-0 left-0 right-0 z-50 hidden h-20 rounded-none border-x-0 border-b-0 md:block">
        {/* Top progress strip */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/[0.07]">
          <div className="h-full progress-strip-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex h-full items-center px-4">
          {/* Left: Current song */}
          <div className="flex w-64 items-center gap-3">
            {currentSong ? (
              <>
                <img
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="h-14 w-14 rounded-lg object-cover ring-1 ring-white/10"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold tracking-tight">{currentSong.title}</p>
                  <p className="truncate text-xs text-white/55">{currentSong.channelTitle}</p>
                </div>
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 flex-shrink-0 hover:bg-white/10"
                  onClick={handleLike}
                >
                  <Heart size={17} className={cn(isLiked && 'fill-[#FF2D2D] text-[#FF2D2D]')} />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3 text-white/40">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/5">
                  <ListMusic className="h-6 w-6" />
                </div>
                <span className="text-sm">No song playing</span>
              </div>
            )}
          </div>

          {/* Center: Controls */}
          <div className="flex flex-1 flex-col items-center gap-1.5 px-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost" size="icon"
                className={cn('h-8 w-8 rounded-full hover:bg-white/10', isShuffled ? 'text-[#FF2D2D]' : 'text-white/55')}
                onClick={toggleShuffle}
              >
                <Shuffle size={16} />
              </Button>

              <Button
                variant="ghost" size="icon"
                className="h-8 w-8 rounded-full bg-white/[0.08] text-white/80 hover:bg-white/15 hover:text-white"
                onClick={playPrevious}
              >
                <SkipBack size={15} />
              </Button>

              <button
                className="btn-play-red flex h-10 w-10 items-center justify-center disabled:opacity-50"
                onClick={togglePlay}
                disabled={!currentSong}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="pl-0.5" />}
              </button>

              <Button
                variant="ghost" size="icon"
                className="h-8 w-8 rounded-full bg-white/[0.08] text-white/80 hover:bg-white/15 hover:text-white"
                onClick={playNext}
              >
                <SkipForward size={15} />
              </Button>

              <Button
                variant="ghost" size="icon"
                className={cn('h-8 w-8 rounded-full hover:bg-white/10', repeatMode !== 'off' ? 'text-[#FF2D2D]' : 'text-white/55')}
                onClick={cycleRepeat}
              >
                {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
              </Button>
            </div>

            <div className="flex w-full max-w-xl items-center gap-2">
              <span className="min-w-[2.75rem] text-right text-[11px] tabular-nums text-white/45">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[progress]} max={100} step={0.1}
                className="flex-1"
                onValueChange={([value]) => seekTo((value / 100) * duration)}
              />
              <span className="min-w-[2.75rem] text-[11px] tabular-nums text-white/45">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right: Queue + Volume */}
          <div className="flex w-64 items-center justify-end gap-2">
            <Button
              variant="ghost" size="icon"
              className={cn('relative h-8 w-8 rounded-full hover:bg-white/10', queueOpen ? 'text-[#FF2D2D]' : 'text-white/70')}
              onClick={() => setQueueOpen(!queueOpen)}
            >
              <List size={16} />
              {queue.length > 1 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF2D2D] px-1 text-[9px] font-bold text-white shadow-[0_0_8px_#FF2D2D]">
                  {queue.length}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white/70 hover:bg-white/10" onClick={toggleMute}>
              <VolumeIcon size={16} />
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]} max={100}
              className="w-24"
              onValueChange={([value]) => setVolume(value)}
            />
          </div>
        </div>
      </div>

      {/* ───────── Mobile Player ───────── */}
      <div className={cn(
        'fixed left-0 right-0 z-50 md:hidden transition-all duration-300',
        mobileExpanded ? 'inset-0 h-auto' : 'bottom-[80px] h-16 mx-2 rounded-2xl overflow-hidden'
      )}>
        <div className={cn('relative', mobileExpanded ? 'h-full' : 'glass-heavy h-full rounded-2xl')}>
          {!mobileExpanded && currentSong && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/[0.07] z-10">
              <div className="h-full progress-strip-fill" style={{ width: `${progress}%` }} />
            </div>
          )}

          {/* Mini row */}
          {!mobileExpanded && (
            <div
              className="flex h-16 items-center gap-3 px-3 touch-pan-y"
              onClick={() => {
                if (swipeTriggered.current) return;
                if (currentSong) setMobileExpanded(true);
              }}
              onTouchStart={currentSong ? handleTouchStart : undefined}
              onTouchMove={currentSong ? handleTouchMove : undefined}
              onTouchEnd={currentSong ? handleTouchEnd : undefined}
            >
              {currentSong ? (
                <>
                  <img src={currentSong.thumbnail} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-white/10" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{currentSong.title}</p>
                    <p className="truncate text-[11px] text-white/55">{currentSong.channelTitle}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10"
                    onClick={(e) => { e.stopPropagation(); handleLike(); }}>
                    <Heart size={17} className={cn(isLiked && 'fill-[#FF2D2D] text-[#FF2D2D]')} />
                  </Button>
                  <button
                    className="btn-play-red flex h-9 w-9 items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  >
                    {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="pl-0.5" />}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3 text-white/40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                    <ListMusic className="h-5 w-5" />
                  </div>
                  <span className="text-sm">No song playing</span>
                </div>
              )}
            </div>
          )}

          {/* Expanded full-screen */}
          {mobileExpanded && currentSong && (
            <div
              className="absolute inset-0 flex flex-col p-5"
              style={{
                background: 'linear-gradient(180deg, rgba(255,45,45,.32) 0%, rgba(120,0,0,.18) 32%, rgba(10,10,10,.97) 66%)',
                backdropFilter: 'blur(64px) saturate(210%)',
                WebkitBackdropFilter: 'blur(64px) saturate(210%)',
              }}
            >
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost" size="icon"
                  className="glass-med h-10 w-10 rounded-full text-white hover:bg-white/15"
                  onClick={() => setMobileExpanded(false)}
                  aria-label="Collapse player"
                >
                  <ChevronDown size={20} />
                </Button>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/55">
                  Now Playing
                </span>
                <div className="h-10 w-10" />
              </div>

              <div className="flex flex-1 flex-col items-center justify-center gap-6">
                <img
                  src={currentSong.thumbnail}
                  alt=""
                  className="aspect-square w-full max-w-xs rounded-3xl object-cover"
                  style={{
                    boxShadow: '0 24px 80px rgba(255,45,45,.45), 0 44px 120px rgba(255,45,45,.25), 0 6px 30px rgba(0,0,0,.7), inset 0 1.5px 0 rgba(255,255,255,.18)',
                  }}
                />
                <div className="w-full text-center">
                  <h2 className="line-clamp-2 text-xl font-bold tracking-tight">{currentSong.title}</h2>
                  <p className="mt-1 text-sm text-white/55">{currentSong.channelTitle}</p>
                </div>

                {/* Seek */}
                <div className="w-full">
                  <Slider
                    value={[progress]} max={100} step={0.1}
                    onValueChange={([value]) => seekTo((value / 100) * duration)}
                  />
                  <div className="mt-1 flex justify-between text-[11px] tabular-nums text-white/45">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-5">
                  <Button variant="ghost" size="icon"
                    className={cn('h-9 w-9 rounded-full', isShuffled ? 'text-[#FF2D2D]' : 'text-white/55')}
                    onClick={toggleShuffle}>
                    <Shuffle size={18} />
                  </Button>
                  <Button variant="ghost" size="icon"
                    className="h-11 w-11 rounded-full bg-white/[0.08] text-white hover:bg-white/15"
                    onClick={playPrevious}>
                    <SkipBack size={20} />
                  </Button>
                  <button
                    className="btn-play-red flex h-[68px] w-[68px] items-center justify-center"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="pl-1" />}
                  </button>
                  <Button variant="ghost" size="icon"
                    className="h-11 w-11 rounded-full bg-white/[0.08] text-white hover:bg-white/15"
                    onClick={playNext}>
                    <SkipForward size={20} />
                  </Button>
                  <Button variant="ghost" size="icon"
                    className={cn('h-9 w-9 rounded-full', repeatMode !== 'off' ? 'text-[#FF2D2D]' : 'text-white/55')}
                    onClick={cycleRepeat}>
                    {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
                  </Button>
                </div>

                {/* Action pills */}
                <div className="grid w-full grid-cols-3 gap-2">
                  <button
                    className={cn('glass-med flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-[11px] font-medium transition-colors', queueOpen ? 'text-[#FF2D2D]' : 'text-white/65 hover:text-white')}
                    onClick={() => setQueueOpen(!queueOpen)}
                  >
                    <List size={16} />
                    Queue{queue.length > 1 ? ` (${queue.length})` : ''}
                  </button>
                  <button
                    className="glass-med flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-[11px] font-medium text-white/65 hover:text-white"
                    onClick={() => setShowPlaylistPicker(true)}
                  >
                    <Plus size={16} />
                    Add
                  </button>
                  <button
                    className={cn('glass-med flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-[11px] font-medium', isLiked ? 'text-[#FF2D2D]' : 'text-white/65 hover:text-white')}
                    onClick={handleLike}
                  >
                    <Heart size={16} className={cn(isLiked && 'fill-[#FF2D2D]')} />
                    {isLiked ? 'Liked' : 'Like'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
