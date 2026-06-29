import { usePlayer } from '@/contexts/PlayerContext';
import { X, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QueueDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function QueueDrawer({ open, onClose }: QueueDrawerProps) {
  const player = usePlayer();
  const { queue, currentSong, isPlaying, playSong } = player;
  const { removeFromQueue, clearQueue } = player;

  const rawIndex = queue.findIndex((s) => s.id === currentSong?.id);
  const currentIndex = Math.max(0, rawIndex);
  const upNext = queue.slice(currentIndex + 1);
  const played = rawIndex > 0 ? queue.slice(0, currentIndex) : [];

  if (!open) return null;

  return (
    <div className="glass-heavy fixed bottom-20 right-0 top-0 z-40 flex w-80 flex-col rounded-l-2xl border-r-0 animate-in slide-in-from-right-full duration-300">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-[#FF2D2D]" />
          <h2 className="text-sm font-bold tracking-tight">Queue</h2>
          <span className="text-[11px] text-white/40">({queue.length} songs)</span>
        </div>
        <div className="flex items-center gap-1">
          {queue.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-white/65 hover:bg-white/10" onClick={clearQueue}>
              Clear
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/10" onClick={onClose}>
            <X size={13} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {currentSong && (
          <div className="px-3 pt-3 pb-1">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/40">Now Playing</p>
            <div className="flex items-center gap-3 rounded-xl bg-[rgba(255,45,45,0.08)] border border-[rgba(255,45,45,0.2)] p-2">
              <img src={currentSong.thumbnail} alt="" className="h-10 w-10 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#FF2D2D]">{currentSong.title}</p>
                <p className="truncate text-[10px] text-white/45">{currentSong.channelTitle}</p>
              </div>
              {isPlaying && (
                <div className="flex h-5 items-end gap-0 pr-1">
                  <span className="eq-bar" style={{ background: '#FF2D2D' }} />
                  <span className="eq-bar" style={{ background: '#FF2D2D' }} />
                  <span className="eq-bar" style={{ background: '#FF2D2D' }} />
                </div>
              )}
            </div>
          </div>
        )}

        {upNext.length > 0 && (
          <div className="px-3 pt-4 pb-1">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/40">
              Up Next · {upNext.length}
            </p>
            <div className="space-y-0.5">
              {upNext.map((song, idx) => (
                <div
                  key={`${song.id}-${idx}`}
                  className="group flex cursor-pointer items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-white/[0.06]"
                  onClick={() => playSong(song, queue)}
                >
                  <span className="w-5 text-center text-[11px] tabular-nums text-white/30">{idx + 1}</span>
                  <img src={song.thumbnail} alt="" className="h-9 w-9 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{song.title}</p>
                    <p className="truncate text-[10px] text-white/45">{song.channelTitle}</p>
                  </div>
                  <Button
                    variant="ghost" size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-white/10"
                    onClick={(e) => { e.stopPropagation(); removeFromQueue(currentIndex + 1 + idx); }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {played.length > 0 && (
          <div className="px-3 pt-4 pb-3">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/40">Previously Played</p>
            <div className="space-y-0.5 opacity-55">
              {played.map((song, idx) => (
                <div
                  key={`${song.id}-prev-${idx}`}
                  className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-white/[0.06]"
                  onClick={() => playSong(song, queue)}
                >
                  <img src={song.thumbnail} alt="" className="h-9 w-9 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{song.title}</p>
                    <p className="truncate text-[10px] text-white/45">{song.channelTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {queue.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-white/35">
            <List className="mb-3 h-10 w-10" />
            <p className="text-sm font-medium">Queue is empty</p>
            <p className="text-xs">Play a song to get started</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
