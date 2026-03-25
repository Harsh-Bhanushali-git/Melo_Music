import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { PlayerBar } from './PlayerBar';
import { Header } from './Header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <Sidebar className="hidden md:flex" />

        {/* Mobile sidebar overlay */}
        <div
          className={cn(
            'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 md:hidden',
            mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
          onClick={() => setMobileMenuOpen(false)}
        />
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-out md:hidden',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <Sidebar className="flex h-full" onNavigate={() => setMobileMenuOpen(false)} />
        </aside>

        <main className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuToggle={() => setMobileMenuOpen(prev => !prev)} />
          <ScrollArea className="flex-1">
            <div className="pb-24">{children}</div>
          </ScrollArea>
        </main>
      </div>
      <PlayerBar />
    </div>
  );
}
