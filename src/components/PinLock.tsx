import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PIN_KEY = 'sunoh_pin';
const UNLOCKED_KEY = 'sunoh_unlocked';

export function PinLock({ children }: { children: React.ReactNode }) {
  const [isSetup, setIsSetup] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [mode, setMode] = useState<'unlock' | 'setup'>('unlock');

  useEffect(() => {
    const savedPin = localStorage.getItem(PIN_KEY);
    const unlocked = sessionStorage.getItem(UNLOCKED_KEY);
    if (savedPin) {
      setIsSetup(true);
      if (unlocked === 'true') setIsUnlocked(true);
    } else {
      setMode('setup');
    }
  }, []);

  const handleSetup = () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 characters');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    localStorage.setItem(PIN_KEY, pin);
    sessionStorage.setItem(UNLOCKED_KEY, 'true');
    setIsSetup(true);
    setIsUnlocked(true);
  };

  const handleUnlock = () => {
    const savedPin = localStorage.getItem(PIN_KEY);
    if (pin === savedPin) {
      sessionStorage.setItem(UNLOCKED_KEY, 'true');
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Incorrect PIN');
    }
  };

  const handleSkip = () => {
    sessionStorage.setItem(UNLOCKED_KEY, 'true');
    setIsUnlocked(true);
  };

  if (isUnlocked) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Melo Music</h1>
          <p className="text-center text-sm text-muted-foreground">
            {isSetup ? 'Enter your PIN to continue' : 'Set up a PIN to protect your library'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Input
              type={showPin ? 'text' : 'password'}
              placeholder={isSetup ? 'Enter PIN' : 'Create PIN (min 4 chars)'}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && (isSetup ? handleUnlock() : handleSetup())}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {!isSetup && (
            <Input
              type={showPin ? 'text' : 'password'}
              placeholder="Confirm PIN"
              value={confirmPin}
              onChange={(e) => { setConfirmPin(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSetup()}
            />
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button className="w-full" onClick={isSetup ? handleUnlock : handleSetup}>
            {isSetup ? 'Unlock' : 'Set PIN'}
          </Button>

          {!isSetup && (
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleSkip}>
              Skip for now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
