import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import meloLogo from '@/assets/melo-logo.png';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between px-3 md:h-16 md:px-6 backdrop-blur-xl bg-black/20 border-b border-white/[0.06]">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-white/80 hover:bg-white/10 hover:text-white md:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 md:hidden">
          <img src={meloLogo} alt="Melo" className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_2px_8px_rgba(255,45,45,0.55)]" />
          <span className="flex items-center text-lg font-extrabold leading-[0.85] tracking-tight">
            <span>melo</span>
            <span className="melo-dot" aria-hidden="true" />
          </span>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/[0.06] text-white/80 hover:bg-white/15 hover:text-white"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/[0.06] text-white/80 hover:bg-white/15 hover:text-white"
            onClick={() => navigate(1)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
