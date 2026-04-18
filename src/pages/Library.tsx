import { useState, useEffect } from 'react';
import { Plus, ListMusic, Trash2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getPlaylists, createPlaylist, deletePlaylist, Playlist } from '@/lib/storage';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function LibraryPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setPlaylists(getPlaylists());
    if (searchParams.get('create') === 'true') {
      setIsDialogOpen(true);
    }
  }, [searchParams]);

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName.trim());
    setPlaylists(getPlaylists());
    setNewPlaylistName('');
    setIsDialogOpen(false);
    window.dispatchEvent(new Event('playlistsUpdated'));
  };

  const handleDeletePlaylist = (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation();
    deletePlaylist(playlistId);
    setPlaylists(getPlaylists());
    window.dispatchEvent(new Event('playlistsUpdated'));
  };

  return (
    <MainLayout>
      <div className="min-w-0 max-w-full overflow-hidden p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Library</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
              </DialogHeader>
              <div className="flex gap-2">
                <Input
                  placeholder="Playlist name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                />
                <Button onClick={handleCreatePlaylist}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ListMusic className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">No playlists yet</h2>
            <p className="mb-4 text-muted-foreground">
              Create your first playlist to start organizing your music
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Playlist
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="group flex cursor-pointer items-center gap-4 rounded-lg bg-card p-4 transition-colors hover:bg-accent"
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gradient-to-br from-primary/40 to-primary/20">
                  <ListMusic className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{playlist.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => handleDeletePlaylist(e, playlist.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
