import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SongCard } from '@/components/SongCard';
import { getRecentlyPlayed } from '@/lib/storage';
import { YouTubeVideo, searchYouTube } from '@/lib/youtube';
import { Play, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';

const TRENDING_QUERIES = [
  'Top Hits 2024',
  'Trending Pop Music',
  'Best Hip Hop',
  'Chill Vibes',
  'Workout Music',
];

export default function HomePage() {
  const [recentlyPlayed, setRecentlyPlayed] = useState<YouTubeVideo[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playQueue } = usePlayer();

  useEffect(() => {
    setRecentlyPlayed(getRecentlyPlayed().slice(0, 10));

    // Fetch some trending songs
    const fetchTrending = async () => {

      try {
        const randomQuery = TRENDING_QUERIES[Math.floor(Math.random() * TRENDING_QUERIES.length)];
        const data = await searchYouTube(randomQuery);
        setTrendingSongs(data.items.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch trending songs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const handlePlayAll = (songs: YouTubeVideo[]) => {
    if (songs.length > 0) {
      playQueue(songs);
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        {/* Hero Section */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 p-8">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">Welcome to Sunoh</h1>
          <p className="text-muted-foreground">
            Discover and play your favorite music
          </p>
        </div>

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Recently Played</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePlayAll(recentlyPlayed)}
              >
                <Play className="mr-2 h-4 w-4" />
                Play All
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {recentlyPlayed.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          </section>
        )}

        {/* Trending */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Trending Now</h2>
            </div>
            {trendingSongs.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePlayAll(trendingSongs)}
              >
                <Play className="mr-2 h-4 w-4" />
                Play All
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-md bg-muted" />
                  <div className="mt-2 h-4 w-3/4 rounded bg-muted" />
                  <div className="mt-1 h-3 w-1/2 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : trendingSongs.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {trendingSongs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-muted/50 p-8 text-center">
              <p className="text-muted-foreground">
                Add your YouTube API key in <code className="text-primary">src/lib/youtube.ts</code> to see trending music
              </p>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
