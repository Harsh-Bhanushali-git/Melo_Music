import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SongCard } from '@/components/SongCard';
import { searchYouTube, YouTubeVideo, YOUTUBE_API_KEY } from '@/lib/youtube';
import { MainLayout } from '@/components/layout/MainLayout';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    if (YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
      setError('Please add your YouTube API key in src/lib/youtube.ts');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await searchYouTube(searchQuery);
      setResults(data.items);
      setSearchParams({ q: searchQuery });
    } catch (err) {
      setError('Failed to search. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      handleSearch(query);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  return (
    <MainLayout>
      <div className="p-6">
        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for songs, artists..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 pl-12 text-lg"
          />
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-md bg-muted" />
                <div className="mt-2 h-4 w-3/4 rounded bg-muted" />
                <div className="mt-1 h-3 w-1/2 rounded bg-muted" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-bold">Search Results</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {results.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          </div>
        )}

        {!isLoading && query && results.length === 0 && !error && (
          <div className="text-center text-muted-foreground">
            No results found for "{query}"
          </div>
        )}

        {!query && (
          <div className="text-center text-muted-foreground">
            <p className="text-lg">Search for your favorite music</p>
            <p className="mt-2 text-sm">
              Find songs, artists, albums, and more
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
