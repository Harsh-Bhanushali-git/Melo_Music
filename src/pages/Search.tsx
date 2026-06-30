import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SongCard } from '@/components/SongCard';
import { searchYouTube, YouTubeVideo } from '@/lib/youtube';
import { MainLayout } from '@/components/layout/MainLayout';

const RECENT_KEY = 'melo_recent_searches';
const MAX_RECENT = 5;

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  const trimmed = q.trim();
  if (!trimmed) return;
  const current = loadRecent().filter((x) => x.toLowerCase() !== trimmed.toLowerCase());
  const next = [trimmed, ...current].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>(loadRecent());
  const inputRef = useRef<HTMLInputElement>(null);
  const lastCommittedRef = useRef<string>('');

  const runSearch = async (searchQuery: string, commit = false) => {
    const q = searchQuery.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchYouTube(q);
      setResults(data.items);
      setSearchParams({ q });
      if (commit && lastCommittedRef.current !== q.toLowerCase()) {
        saveRecent(q);
        setRecent(loadRecent());
        lastCommittedRef.current = q.toLowerCase();
      }
    } catch {
      setError('Failed to search. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  // Live results while typing (short debounce)
  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length >= 2) runSearch(query, false);
      else setResults([]);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Commit to recents when user pauses longer (1.2s) on a meaningful query
  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length >= 2) {
        saveRecent(query);
        setRecent(loadRecent());
        lastCommittedRef.current = query.trim().toLowerCase();
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [query]);

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setSearchParams({});
    inputRef.current?.focus();
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  };

  const showRecentPanel = focused && !query.trim() && recent.length > 0;

  return (
    <MainLayout>
      <div className="p-6">
        <div className="relative mb-8 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search for songs, artists..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runSearch(query, true);
              if (e.key === 'Escape' && query) clearQuery();
            }}
            className="h-12 pl-12 pr-12 text-lg"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={clearQuery}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          )}

          {showRecentPanel && (
            <div className="glass-med absolute left-0 right-0 top-full z-30 mt-2 rounded-xl p-2 shadow-xl">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
                  Recent searches
                </span>
                <button
                  onClick={clearRecent}
                  className="text-[11px] text-white/55 hover:text-[#FF2D2D]"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-col">
                {recent.map((r) => (
                  <button
                    key={r}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setQuery(r);
                      runSearch(r, true);
                    }}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-white/85 hover:bg-white/10"
                  >
                    <Clock size={14} className="text-white/45" />
                    <span className="truncate">{r}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {isLoading && results.length === 0 && (
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

        {results.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-bold">Search Results</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {results.map((song, idx) => (
                <SongCard key={song.id} song={song} songs={results} index={idx} />
              ))}
            </div>
          </div>
        )}

        {!isLoading && query && results.length === 0 && !error && (
          <div className="text-center text-muted-foreground">
            No results found for "{query}"
          </div>
        )}

        {!query && !showRecentPanel && (
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
