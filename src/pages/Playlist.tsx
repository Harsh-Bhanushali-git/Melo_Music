import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, ListMusic, Trash2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SongCard } from '@/components/SongCard';
import { Button } from '@/components/ui/button';
import { getPlaylists, deletePlaylist, removeSongFromPlaylist, Playlist } from '@/lib/storage';
import { usePlayer } from '@/contexts/PlayerContext';

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const { playQueue } = usePlayer();

  useEffect(() => {
    const playlists = getPlaylists();
    const found = playlists.find((p) => p.id === id);
    setPlaylist(found || null);
  }, [id]);

  const handlePlayAll = () => {
    if (playlist && playlist.songs.length > 0) {
      playQueue(playlist.songs);
    }
  };

  const handleShuffle = () => {
    if (playlist && playlist.songs.length > 0) {
      const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
      playQueue(shuffled);
    }
  };

  const handleDeletePlaylist = () => {
    if (playlist) {
      deletePlaylist(playlist.id);
      window.dispatchEvent(new Event('playlistsUpdated'));
      navigate('/library');
    }
  };

  const handleRemoveSong = (songId: string) => {
    if (playlist) {
      removeSongFromPlaylist(playlist.id, songId);
      setPlaylist({
        ...playlist,
        songs: playlist.songs.filter((s) => s.id !== songId),
      });
    }
  };

  if (!playlist) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center p-6 py-16">
          <ListMusic className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">Playlist not found</h2>
          <Button onClick={() => navigate('/library')}>Go to Library</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex items-end gap-6">
          <div className="flex h-40 w-40 items-center justify-center rounded-md bg-gradient-to-br from-primary/40 to-primary/20 shadow-xl">
            <ListMusic className="h-20 w-20 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Playlist
            </p>
            <h1 className="mb-2 text-4xl font-bold">{playlist.name}</h1>
            <p className="text-muted-foreground">{playlist.songs.length} songs</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex items-center gap-4">
          {playlist.songs.length > 0 && (
            <>
              <Button size="lg" className="gap-2" onClick={handlePlayAll}>
                <Play className="h-5 w-5" fill="currentColor" />
                Play All
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={handleShuffle}>
                <Shuffle className="h-5 w-5" />
                Shuffle
              </Button>
            </>
          )}
          <Button
            size="lg"
            variant="ghost"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={handleDeletePlaylist}
          >
            <Trash2 className="h-5 w-5" />
            Delete Playlist
          </Button>
        </div>

        {/* Songs List */}
        {playlist.songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ListMusic className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">This playlist is empty</h2>
            <p className="text-muted-foreground">
              Search for songs and add them to this playlist
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {playlist.songs.map((song, idx) => (
              <SongCard key={song.id} song={song} variant="row" songs={playlist.songs} index={idx} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
