import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, BookOpen, Heart, ListMusic, Plus, Compass, X, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getPlaylists } from '@/lib/storage';
import { useState, useEffect } from 'react';
import { CreatePlaylistDialog } from '@/components/CreatePlaylistDialog';
import meloLogo from '@/assets/melo-logo.png';

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const location = useLocation();
  const [playlists, setPlaylists] = useState(getPlaylists());
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const handle = () => setPlaylists(getPlaylists());
    window.addEventListener('storage', handle);
    window.addEventListener('playlistsUpdated', handle);
    return () => {
      window.removeEventListener('storage', handle);
      window.removeEventListener('playlistsUpdated', handle);
    };
  }, []);

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Compass, label: 'Explore' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/library', icon: BookOpen, label: 'Library' },
    { to: '/import', icon: Download, label: 'Import' },
  ];

  const mobileHiddenRoutes = ['/', '/explore', '/search'];
  const filteredNavItems = onNavigate
    ? navItems.filter((item) => !mobileHiddenRoutes.includes(item.to))
    : navItems;

  const handleNavClick = () => onNavigate?.();

  const renderNavLink = (item: { to: string; icon: any; label: string }) => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={handleNavClick}
      end={item.to === '/'}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border border-transparent',
          isActive
            ? 'nav-item-active'
            : 'text-white/65 hover:text-white hover:bg-white/5'
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon size={17} className="shrink-0" />
          <span className="flex-1">{item.label}</span>
          {isActive && <span className="nav-dot" />}
        </>
      )}
    </NavLink>
  );

  return (
    <aside
      className={cn(
        'glass-heavy flex h-full w-64 flex-col rounded-none md:rounded-r-2xl',
        className
      )}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <img src={meloLogo} alt="Melo" className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_2px_10px_rgba(255,45,45,0.55)]" />
          <span className="flex items-center text-2xl font-extrabold leading-[0.85] tracking-tight">
            <span>melo</span>
            <span className="melo-dot" aria-hidden="true" />
          </span>
        </div>
        {onNavigate && (
          <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={onNavigate}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="space-y-1 px-3">{filteredNavItems.map(renderNavLink)}</nav>

      <div className="my-4 mx-5 h-px bg-white/[0.08]" />

      <div className="px-3">
        <NavLink
          to="/liked"
          onClick={handleNavClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border border-transparent',
              isActive ? 'nav-item-active' : 'text-white/65 hover:text-white hover:bg-white/5'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-fuchsia-500 to-indigo-500">
                <Heart className="h-3 w-3 text-white" fill="white" />
              </div>
              <span className="flex-1">Liked Songs</span>
              {isActive && <span className="nav-dot" />}
            </>
          )}
        </NavLink>
      </div>

      <div className="my-4 mx-5 h-px bg-white/[0.08]" />

      <div className="flex items-center justify-between px-5 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
          Playlists
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 pb-3">
        {playlists.map((playlist) => (
          <NavLink
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'text-[#FF2D2D]' : 'text-white/55 hover:text-white'
              )
            }
          >
            <ListMusic className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{playlist.name}</span>
          </NavLink>
        ))}
      </ScrollArea>

      <CreatePlaylistDialog open={showCreate} onOpenChange={setShowCreate} />
    </aside>
  );
}
