import { useState, useEffect, useCallback } from 'react';
import { Heart, Play, Shuffle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SongCard } from '@/components/SongCard';
import { Button } from '@/components/ui/button';
import { getLikedSongs } from '@/lib/storage';
import { YouTubeVideo } from '@/lib/youtube';
import { usePlayer } from '@/contexts/PlayerContext';

export default function LikedSongsPage() {
  const [likedSongs, setLikedSongs] = useState<YouTubeVideo[]>([]);
  const { playQueue } = usePlayer();

  const refreshLiked = useCallback(() => {
    setLikedSongs(getLikedSongs());
  }, []);

  useEffect(() => {
    refreshLiked();

    // Listen for both storage events and custom liked events
    window.addEventListener('storage', refreshLiked);
    window.addEventListener('likedSongsUpdated', refreshLiked);
    return () => {
      window.removeEventListener('storage', refreshLiked);
      window.removeEventListener('likedSongsUpdated', refreshLiked);
    };
  }, [refreshLiked]);

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playQueue(likedSongs);
    }
  };

  const handleShuffle = () => {
    if (likedSongs.length > 0) {
      const shuffled = [...likedSongs].sort(() => Math.random() - 0.5);
      playQueue(shuffled);
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex items-end gap-6 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 p-8">
          <div className="flex h-40 w-40 items-center justify-center rounded-md bg-gradient-to-br from-purple-500/50 to-blue-400/50 shadow-xl">
            <Heart className="h-20 w-20 text-white" fill="white" />
          </div>
          <div className="text-white">
            <p className="text-sm font-medium uppercase tracking-wider">Playlist</p>
            <h1 className="mb-2 text-4xl font-bold">Liked Songs</h1>
            <p className="text-white/80">{likedSongs.length} songs</p>
          </div>
        </div>

        {/* Actions */}
        {likedSongs.length > 0 && (
          <div className="mb-6 flex items-center gap-4">
            <Button size="lg" className="gap-2" onClick={handlePlayAll}>
              <Play className="h-5 w-5" fill="currentColor" />
              Play All
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={handleShuffle}>
              <Shuffle className="h-5 w-5" />
              Shuffle
            </Button>
          </div>
        )}

        {/* Songs List */}
        {likedSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Heart className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">No liked songs yet</h2>
            <p className="text-muted-foreground">
              Songs you like will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {likedSongs.map((song, idx) => (
              <SongCard key={song.id} song={song} variant="row" songs={likedSongs} index={idx} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
