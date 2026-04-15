import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListMusic, Plus } from 'lucide-react';
import { getPlaylists, createPlaylist, addSongToPlaylist } from '@/lib/storage';
import { YouTubeVideo } from '@/lib/youtube';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddToPlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: YouTubeVideo | null;
}

export function AddToPlaylistDialog({ open, onOpenChange, song }: AddToPlaylistDialogProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const playlists = open ? getPlaylists() : [];

  const handleAdd = (playlistId: string, playlistName: string) => {
    if (!song) return;
    addSongToPlaylist(playlistId, song);
    toast.success(`Added to "${playlistName}"`);
    window.dispatchEvent(new Event('playlistsUpdated'));
    onOpenChange(false);
  };

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed || !song) return;
    const playlist = createPlaylist(trimmed);
    addSongToPlaylist(playlist.id, song);
    window.dispatchEvent(new Event('playlistsUpdated'));
    toast.success(`Created "${trimmed}" and added song`);
    setNewName('');
    setShowCreate(false);
    onOpenChange(false);
  };

  // If no playlists exist, show create form directly
  const hasPlaylists = playlists.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setShowCreate(false); setNewName(''); } }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
        </DialogHeader>

        {(!hasPlaylists || showCreate) ? (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              {hasPlaylists ? 'Create a new playlist' : 'No playlists yet. Create one!'}
            </p>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Playlist name"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              {hasPlaylists && (
                <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Back</Button>
              )}
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>Create & Add</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="h-4 w-4" />
              Create New Playlist
            </Button>
            <ScrollArea className="max-h-60">
              <div className="space-y-1">
                {playlists.map((p) => (
                  <button
                    key={p.id}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent"
                    onClick={() => handleAdd(p.id, p.name)}
                  >
                    <ListMusic className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.songs.length} songs</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
