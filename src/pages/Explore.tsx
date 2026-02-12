import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SongCard } from '@/components/SongCard';
import { Button } from '@/components/ui/button';
import { Loader2, Music, Flame, Heart, Zap, Cloud, Sunrise, PartyPopper, Guitar, Headphones, Radio, Mic2, Disc3 } from 'lucide-react';
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

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const { playQueue } = usePlayer();

  const handleCategoryClick = async (category: typeof categories[0]) => {
    if (activeCategory === category.id && results.length > 0) {
      setActiveCategory(null);
      setResults([]);
      return;
    }
    setActiveCategory(category.id);
    setLoading(true);
    try {
      const data = await searchYouTube(category.query);
      const videos = data.items;
      setResults(videos);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (results.length > 0) playQueue(results);
  };

  const activeCat = categories.find(c => c.id === activeCategory);

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="mb-2 text-3xl font-bold">Explore</h1>
        <p className="mb-6 text-muted-foreground">Discover music by genre and mood</p>

        {/* Category Grid */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className={cn(
                  'group relative flex flex-col items-center justify-center gap-2 rounded-xl p-5 transition-all duration-200',
                  `bg-gradient-to-br ${cat.gradient}`,
                  isActive
                    ? 'scale-95 ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg'
                    : 'hover:scale-105 hover:shadow-xl'
                )}
              >
                <Icon className="h-7 w-7 text-white drop-shadow" />
                <span className="text-sm font-semibold text-white drop-shadow">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Results */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && activeCategory && results.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{activeCat?.label} Music</h2>
              <Button size="sm" onClick={handlePlayAll}>Play All</Button>
            </div>
            <div className="space-y-1">
              {results.map((song) => (
                <SongCard key={song.id} song={song} variant="row" />
              ))}
            </div>
          </>
        )}

        {!loading && activeCategory && results.length === 0 && (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <Music className="mb-3 h-12 w-12" />
            <p>No results found. Try another category.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
