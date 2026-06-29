import { NavLink } from 'react-router-dom';
import { Home, Compass, Search, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: BookOpen, label: 'Library' },
];

export function MobileNav() {
  return (
    <nav className="glass-heavy fixed bottom-0 left-0 right-0 z-40 md:hidden rounded-none border-x-0 border-b-0 pt-2.5 pb-[22px]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center gap-0.5 px-4 py-1.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-[#FF2D2D]' : 'text-white/55'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} />
                <span className={cn(isActive && 'font-semibold')}>{item.label}</span>
                {isActive && (
                  <span
                    className="absolute -bottom-0.5 h-1 w-1 rounded-full"
                    style={{ background: '#FF2D2D', boxShadow: '0 0 8px #FF2D2D' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
