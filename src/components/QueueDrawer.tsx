import { usePlayer } from '@/contexts/PlayerContext';
import { X, ListMusic, GripVertical, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface QueueDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function QueueDrawer({ open, onClose }: QueueDrawerProps) {
  const { queue, currentSong, isPlaying, playSong, removeFromQueue, clearQueue } = usePlayer();

  const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
  const upNext = queue.slice(currentIndex + 1);
  const played = queue.slice(0, currentIndex);

  if (!open) return null;

  return (
    <div className="fixed bottom-20 right-0 top-0 z-40 w-80 border-l border-border bg-card shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ListMusic className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Queue</h2>
          <span className="text-xs text-muted-foreground">({queue.length} songs)</span>
        </div>
        <div className="flex items-center gap-1">
          {queue.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearQueue}>
              Clear
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Now Playing */}
        {currentSong && (
          <div className="px-3 pt-3 pb-1">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Now Playing</p>
            <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-2">
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="h-10 w-10 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-primary">{currentSong.title}</p>
                <p className="truncate text-xs text-muted-foreground">{currentSong.channelTitle}</p>
              </div>
              {isPlaying && (
                <div className="flex gap-0.5 pr-1">
                  <span className="h-3 w-0.5 animate-pulse bg-primary" />
                  <span className="h-3 w-0.5 animate-pulse bg-primary delay-75" />
                  <span className="h-3 w-0.5 animate-pulse bg-primary delay-150" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Up Next */}
        {upNext.length > 0 && (
          <div className="px-3 pt-4 pb-1">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Up Next · {upNext.length} songs
            </p>
            <div className="space-y-0.5">
              {upNext.map((song, idx) => (
                <div
                  key={`${song.id}-${idx}`}
                  className="group flex items-center gap-2 rounded-md p-1.5 transition-colors hover:bg-accent cursor-pointer"
                  onClick={() => playSong(song, queue)}
                >
                  <span className="w-5 text-center text-xs text-muted-foreground">
                    {idx + 1}
                  </span>
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="h-9 w-9 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{song.title}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{song.channelTitle}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(currentIndex + 1 + idx);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previously Played */}
        {played.length > 0 && (
          <div className="px-3 pt-4 pb-3">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Previously Played
            </p>
            <div className="space-y-0.5 opacity-60">
              {played.map((song, idx) => (
                <div
                  key={`${song.id}-prev-${idx}`}
                  className="flex items-center gap-2 rounded-md p-1.5 transition-colors hover:bg-accent cursor-pointer"
                  onClick={() => playSong(song, queue)}
                >
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="h-9 w-9 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{song.title}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{song.channelTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {queue.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ListMusic className="mb-3 h-10 w-10" />
            <p className="text-sm font-medium">Queue is empty</p>
            <p className="text-xs">Play a song to get started</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
