import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Library, Heart, ListMusic, Plus, Music, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getPlaylists } from '@/lib/storage';
import { useState, useEffect } from 'react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const [playlists, setPlaylists] = useState(getPlaylists());

  useEffect(() => {
    const handleStorageChange = () => {
      setPlaylists(getPlaylists());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('playlistsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('playlistsUpdated', handleStorageChange);
    };
  }, []);

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Compass, label: 'Explore' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/library', icon: Library, label: 'Library' },
  ];

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border',
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
          <Music className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground">Sunoh</span>
      </div>

      {/* Main Navigation */}
      <nav className="px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-4 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Separator className="my-4 bg-sidebar-border" />

      {/* Library Section */}
      <div className="px-3">
        <NavLink
          to="/liked"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-4 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            )
          }
        >
          <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-purple-600 to-blue-400">
            <Heart className="h-3 w-3 text-white" fill="white" />
          </div>
          Liked Songs
        </NavLink>
      </div>

      <Separator className="my-4 bg-sidebar-border" />

      {/* Playlists */}
      <div className="flex items-center justify-between px-6 py-2">
        <span className="text-xs font-semibold uppercase text-sidebar-foreground/60">
          Playlists
        </span>
        <NavLink to="/library?create=true">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-4 w-4" />
          </Button>
        </NavLink>
      </div>

      <ScrollArea className="flex-1 px-3">
        {playlists.map((playlist) => (
          <NavLink
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-4 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )
            }
          >
            <ListMusic className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{playlist.name}</span>
          </NavLink>
        ))}
      </ScrollArea>
    </aside>
  );
}
