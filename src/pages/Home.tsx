import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SongCard } from '@/components/SongCard';
import { getRecentlyPlayed } from '@/lib/storage';
import { YouTubeVideo, searchYouTube } from '@/lib/youtube';
import { Play, TrendingUp, Clock, Headphones, Sparkles, Music, Disc3, Mic2, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';

// Use day-of-year as seed for daily rotation
function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function pickDaily<T>(arr: T[], count: number, offset = 0): T[] {
  const day = getDayOfYear() + offset;
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(arr[(day + i) % arr.length]);
  }
  return result;
}

interface Section {
  title: string;
  icon: React.ReactNode;
  query: string;
}

const ALL_SECTIONS: Section[] = [
  { title: 'Trending Now', icon: <TrendingUp className="h-5 w-5 text-primary" />, query: 'top trending songs 2024' },
  { title: 'Bollywood Hits', icon: <Music className="h-5 w-5 text-primary" />, query: 'latest Bollywood hits songs' },
  { title: 'Chill Vibes', icon: <Headphones className="h-5 w-5 text-primary" />, query: 'chill lofi relaxing music' },
  { title: 'Punjabi Beats', icon: <Disc3 className="h-5 w-5 text-primary" />, query: 'latest Punjabi songs hits' },
  { title: 'Romantic Mood', icon: <Sparkles className="h-5 w-5 text-primary" />, query: 'romantic love songs Hindi' },
  { title: 'Workout Energy', icon: <Radio className="h-5 w-5 text-primary" />, query: 'high energy workout gym music' },
  { title: 'Pop Worldwide', icon: <Mic2 className="h-5 w-5 text-primary" />, query: 'top pop songs worldwide 2024' },
  { title: 'Hip Hop & Rap', icon: <Music className="h-5 w-5 text-primary" />, query: 'best hip hop rap songs 2024' },
  { title: 'Arijit Singh Specials', icon: <Mic2 className="h-5 w-5 text-primary" />, query: 'Arijit Singh best songs' },
  { title: 'Party Anthems', icon: <Disc3 className="h-5 w-5 text-primary" />, query: 'party dance songs Bollywood' },
  { title: 'Sufi & Soulful', icon: <Sparkles className="h-5 w-5 text-primary" />, query: 'sufi soulful songs Hindi' },
  { title: 'Tamil Hits', icon: <Music className="h-5 w-5 text-primary" />, query: 'latest Tamil songs hits' },
  { title: 'Telugu Chartbusters', icon: <Music className="h-5 w-5 text-primary" />, query: 'Telugu songs hits 2024' },
  { title: 'Indie & Alternative', icon: <Radio className="h-5 w-5 text-primary" />, query: 'Indian indie alternative music' },
  { title: 'EDM & Electronic', icon: <Headphones className="h-5 w-5 text-primary" />, query: 'EDM electronic dance music 2024' },
  { title: 'Old School Classics', icon: <Disc3 className="h-5 w-5 text-primary" />, query: 'classic old Hindi songs Bollywood retro' },
  { title: '90s Nostalgia', icon: <Sparkles className="h-5 w-5 text-primary" />, query: '90s Bollywood songs hits nostalgia' },
  { title: 'K-Pop Favorites', icon: <Music className="h-5 w-5 text-primary" />, query: 'K-pop best songs BTS Blackpink 2024' },
];

// Pick 5 sections daily (rotate through all)
const DAILY_SECTIONS = pickDaily(ALL_SECTIONS, 5);

const HOME_CACHE_KEY = 'melo_home_sections';
const HOME_CACHE_DAY_KEY = 'melo_home_day';

interface HomeSectionCache {
  [title: string]: YouTubeVideo[];
}

function getCachedHomeSections(): HomeSectionCache | null {
  try {
    const cachedDay = localStorage.getItem(HOME_CACHE_DAY_KEY);
    const today = getDayOfYear().toString();
    // If same day, return cache
    if (cachedDay === today) {
      const raw = localStorage.getItem(HOME_CACHE_KEY);
      if (raw) return JSON.parse(raw);
    }
    return null;
  } catch {
    return null;
  }
}

function saveHomeSectionsCache(data: HomeSectionCache) {
  try {
    localStorage.setItem(HOME_CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(HOME_CACHE_DAY_KEY, getDayOfYear().toString());
  } catch { /* storage full */ }
}

export default function HomePage() {
  const [recentlyPlayed, setRecentlyPlayed] = useState<YouTubeVideo[]>([]);
  const [sectionData, setSectionData] = useState<Record<string, YouTubeVideo[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const { playQueue } = usePlayer();

  useEffect(() => {
    setRecentlyPlayed(getRecentlyPlayed().slice(0, 10));

    // Try loading from home-level cache first
    const cached = getCachedHomeSections();
    if (cached) {
      const dailyTitles = DAILY_SECTIONS.map(s => s.title);
      const allCached = dailyTitles.every(t => cached[t] && cached[t].length > 0);
      if (allCached) {
        // All sections cached for today — no API calls needed
        const filtered: Record<string, YouTubeVideo[]> = {};
        dailyTitles.forEach(t => { filtered[t] = cached[t]; });
        setSectionData(filtered);
        const states: Record<string, boolean> = {};
        dailyTitles.forEach(t => { states[t] = false; });
        setLoadingStates(states);
        return;
      }
    }

    // Fetch only missing sections
    const accumulated: HomeSectionCache = cached || {};
    DAILY_SECTIONS.forEach(async (section) => {
      if (accumulated[section.title]?.length > 0) {
        setSectionData(prev => ({ ...prev, [section.title]: accumulated[section.title] }));
        setLoadingStates(prev => ({ ...prev, [section.title]: false }));
        return;
      }
      setLoadingStates(prev => ({ ...prev, [section.title]: true }));
      try {
        const data = await searchYouTube(section.query);
        const songs = data.items.slice(0, 10);
        accumulated[section.title] = songs;
        setSectionData(prev => ({ ...prev, [section.title]: songs }));
        saveHomeSectionsCache(accumulated);
      } catch (error) {
        console.error(`Failed to fetch ${section.title}:`, error);
      } finally {
        setLoadingStates(prev => ({ ...prev, [section.title]: false }));
      }
    });
  }, []);

  const handlePlayAll = (songs: YouTubeVideo[]) => {
    if (songs.length > 0) {
      playQueue(songs);
    }
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square rounded-md bg-muted" />
          <div className="mt-2 h-4 w-3/4 rounded bg-muted" />
          <div className="mt-1 h-3 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  );

  const renderSection = (title: string, icon: React.ReactNode, songs: YouTubeVideo[], isLoading: boolean) => (
    <section key={title} className="mb-6 md:mb-8">
      <div className="mb-3 flex items-center justify-between md:mb-4">
        <div className="flex min-w-0 items-center gap-2">
          {icon}
          <h2 className="truncate text-xl font-bold">{title}</h2>
        </div>
        {songs.length > 0 && (
          <Button variant="ghost" size="sm" className="shrink-0" onClick={() => handlePlayAll(songs)}>
            <Play className="mr-2 h-4 w-4" />
            Play All
          </Button>
        )}
      </div>
      {isLoading ? renderSkeletons() : songs.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      ) : null}
    </section>
  );

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        {/* Hero Section */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 p-5 md:mb-8 md:p-8">
          <h1 className="mb-1 text-2xl font-bold md:mb-2 md:text-4xl">Welcome to Melo</h1>
          <p className="text-muted-foreground">
            Discover and play your favorite music
          </p>
        </div>

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <Clock className="h-5 w-5 shrink-0 text-primary" />
                <h2 className="truncate text-xl font-bold">Recently Played</h2>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0" onClick={() => handlePlayAll(recentlyPlayed)}>
                <Play className="mr-2 h-4 w-4" />
                Play All
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {recentlyPlayed.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          </section>
        )}

        {/* Daily Rotating Sections */}
        {DAILY_SECTIONS.map((section) =>
          renderSection(
            section.title,
            section.icon,
            sectionData[section.title] || [],
            loadingStates[section.title] ?? true,
          )
        )}
      </div>
    </MainLayout>
  );
}
