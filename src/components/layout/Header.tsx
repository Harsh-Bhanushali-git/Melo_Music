import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Moon, Sun, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import meloLogo from '@/assets/melo-logo.png';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-3 backdrop-blur-sm md:h-16 md:px-6">
      <div className="flex items-center gap-2">
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full md:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 md:hidden">
          <img src={meloLogo} alt="Melo" className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold text-foreground">Melo</span>
        </div>

        {/* Desktop nav buttons */}
        <div className="hidden items-center gap-1 md:flex">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => navigate(1)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
