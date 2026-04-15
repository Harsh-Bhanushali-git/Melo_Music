import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SongCard } from '@/components/SongCard';
import { Button } from '@/components/ui/button';
import { Loader2, Music, Flame, Heart, Zap, Cloud, Sunrise, PartyPopper, Guitar, Headphones, Radio, Mic2, Disc3, Play, ChevronUp } from 'lucide-react';
import { searchYouTube, YouTubeVideo } from '@/lib/youtube';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'pop', label: 'Pop', icon: Music, gradient: 'from-pink-500 to-rose-500', query: 'Pop Hits 2026' },
  { id: 'hiphop', label: 'Hip Hop', icon: Mic2, gradient: 'from-amber-500 to-orange-600', query: 'Hip Hop Rap Music' },
  { id: 'rock', label: 'Rock', icon: Guitar, gradient: 'from-red-600 to-red-800', query: 'Rock Music Hits' },
  { id: 'electronic', label: 'Electronic', icon: Zap, gradient: 'from-cyan-400 to-blue-600', query: 'Electronic Dance Music EDM' },
  { id: 'chill', label: 'Chill', icon: Cloud, gradient: 'from-teal-400 to-emerald-500', query: 'Chill Lofi Relaxing Music' },
  { id: 'workout', label: 'Workout', icon: Flame, gradient: 'from-orange-500 to-red-500', query: 'Workout Music' },
  { id: 'bollywood', label: 'Bollywood', icon: Disc3, gradient: 'from-yellow-400 to-pink-500', query: 'Bollywood Latest Songs' },
  { id: 'rnb', label: 'R&B / Soul', icon: Heart, gradient: 'from-purple-500 to-pink-500', query: 'R&B Soul Music' },
  { id: 'jazz', label: 'Jazz', icon: Radio, gradient: 'from-indigo-400 to-purple-600', query: 'Jazz Music Smooth' },
  { id: 'classical', label: 'Classical', icon: Headphones, gradient: 'from-slate-400 to-slate-600', query: 'Classical Music Piano' },
  { id: 'morning', label: 'Morning Vibes', icon: Sunrise, gradient: 'from-amber-300 to-yellow-500', query: 'Morning Feel Good Music' },
  { id: 'party', label: 'Party', icon: PartyPopper, gradient: 'from-fuchsia-500 to-violet-600', query: 'Party Dance Hits' },
];

const curatedPlaylists = [
  { id: 'bollywood-trending', title: '🔥 Bollywood Trending Now', query: 'Bollywood trending songs 2026', gradient: 'from-orange-500 to-pink-600' },
  { id: 'bollywood-classics', title: '🎵 Bollywood Classics', query: 'Bollywood classic hit songs all time', gradient: 'from-yellow-500 to-red-500' },
  { id: 'hollywood-pop', title: '🎤 Hollywood Pop Trends', query: 'Hollywood pop trending songs 2026', gradient: 'from-blue-500 to-purple-600' },
  { id: 'lofi-beats', title: '🌙 Lofi Chill Beats', query: 'lofi hip hop chill beats study', gradient: 'from-indigo-500 to-cyan-500' },
  { id: 'punjabi-hits', title: '🎶 Punjabi Hits', query: 'Punjabi latest songs trending', gradient: 'from-green-500 to-yellow-500' },
  { id: 'edm-bangers', title: '⚡ EDM Bangers', query: 'EDM festival bangers 2026', gradient: 'from-violet-600 to-fuchsia-500' },
  { id: 'retro-vibes', title: '📻 Retro Vibes', query: 'retro 80s 90s greatest hits music', gradient: 'from-rose-400 to-amber-400' },
  { id: 'acoustic-calm', title: '🎸 Acoustic & Calm', query: 'acoustic calm relaxing guitar songs', gradient: 'from-emerald-400 to-teal-500' },
];

interface CuratedPlaylistData {
  songs: YouTubeVideo[];
  loading: boolean;
}

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categoryResults, setCategoryResults] = useState<YouTubeVideo[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [curatedData, setCuratedData] = useState<Record<string, CuratedPlaylistData>>({});
  const { playQueue } = usePlayer();

  useEffect(() => {
    curatedPlaylists.forEach(async (playlist) => {
      setCuratedData(prev => ({ ...prev, [playlist.id]: { songs: [], loading: true } }));
      try {
        const data = await searchYouTube(playlist.query);
        setCuratedData(prev => ({
          ...prev,
          [playlist.id]: { songs: data.items.slice(0, 10), loading: false },
        }));
      } catch {
        setCuratedData(prev => ({
          ...prev,
          [playlist.id]: { songs: [], loading: false },
        }));
      }
    });
  }, []);

  const handleCategoryClick = async (category: typeof categories[0]) => {
    if (activeCategory === category.id && categoryResults.length > 0) {
      setActiveCategory(null);
      setCategoryResults([]);
      return;
    }
    setActiveCategory(category.id);
    setCategoryLoading(true);
    try {
      const data = await searchYouTube(category.query);
      setCategoryResults(data.items);
    } catch {
      setCategoryResults([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  const activeCat = categories.find(c => c.id === activeCategory);

  return (
    <MainLayout>
      <div className="min-w-0 overflow-hidden p-4 md:p-6">
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">Explore</h1>
        <p className="mb-6 text-sm text-muted-foreground">Discover music by genre and mood</p>

        {/* Category Grid */}
        <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className={cn(
                  'group relative flex flex-col items-center justify-center gap-1.5 rounded-lg p-3 transition-all duration-200 overflow-hidden',
                  `bg-gradient-to-br ${cat.gradient}`,
                  isActive
                    ? 'ring-2 ring-primary shadow-lg opacity-90'
                    : 'hover:shadow-md hover:brightness-110'
                )}
              >
                <Icon className="h-5 w-5 text-white drop-shadow" />
                <span className="text-xs font-semibold text-white drop-shadow">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Category Results */}
        {activeCategory && (
          <div className="mb-8 overflow-hidden rounded-xl border border-border bg-card p-4">
            {categoryLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : categoryResults.length > 0 ? (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="truncate text-lg font-bold">{activeCat?.label} Music</h2>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" onClick={() => playQueue(categoryResults)}>
                      <Play className="mr-1 h-3.5 w-3.5" /> Play All
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setActiveCategory(null); setCategoryResults([]); }}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="max-h-80 space-y-0.5 overflow-y-auto">
                  {categoryResults.map((song, idx) => (
                    <SongCard key={song.id} song={song} variant="row" songs={categoryResults} index={idx} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-10 text-muted-foreground">
                <Music className="mb-2 h-10 w-10" />
                <p className="text-sm">No results found.</p>
              </div>
            )}
          </div>
        )}

        {/* Curated Playlists */}
        <h2 className="mb-4 text-xl font-bold md:text-2xl">Curated For You</h2>
        <div className="space-y-8">
          {curatedPlaylists.map((playlist) => {
            const data = curatedData[playlist.id];
            return (
              <section key={playlist.id}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="truncate text-lg font-semibold">{playlist.title}</h3>
                  {data?.songs && data.songs.length > 0 && (
                    <Button size="sm" variant="ghost" className="shrink-0" onClick={() => playQueue(data.songs)}>
                      <Play className="mr-1 h-3.5 w-3.5" /> Play All
                    </Button>
                  )}
                </div>
                {data?.loading ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-square rounded-md bg-muted" />
                        <div className="mt-2 h-3 w-3/4 rounded bg-muted" />
                        <div className="mt-1 h-2.5 w-1/2 rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                ) : data?.songs && data.songs.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {data.songs.map((song, idx) => (
                      <SongCard key={song.id} song={song} songs={data.songs} index={idx} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Could not load this playlist.</p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
