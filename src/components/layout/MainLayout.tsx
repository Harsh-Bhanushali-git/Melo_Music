import { Sidebar } from './Sidebar';
import { PlayerBar } from './PlayerBar';
import { Header } from './Header';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar className="hidden md:flex" />
        <main className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <ScrollArea className="flex-1">
            <div className="pb-24">{children}</div>
          </ScrollArea>
        </main>
      </div>
      <PlayerBar />
    </div>
  );
}
