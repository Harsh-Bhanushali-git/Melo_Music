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
      <div className="min-w-0 overflow-hidden p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 p-5 sm:flex-row sm:items-end sm:gap-6 sm:p-8 md:mb-8">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-purple-500/50 to-blue-400/50 shadow-xl sm:h-40 sm:w-40">
            <Heart className="h-14 w-14 text-white sm:h-20 sm:w-20" fill="white" />
          </div>
          <div className="min-w-0 text-white">
            <p className="text-sm font-medium uppercase tracking-wider">Playlist</p>
            <h1 className="mb-1 text-2xl font-bold sm:mb-2 sm:text-4xl">Liked Songs</h1>
            <p className="text-white/80">{likedSongs.length} songs</p>
          </div>
        </div>

        {/* Actions */}
        {likedSongs.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
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
