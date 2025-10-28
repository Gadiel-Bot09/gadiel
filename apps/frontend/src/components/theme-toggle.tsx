import { Moon, Sun } from 'lucide-react';

import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { useTheme } from './theme-provider';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      size="icon"
      variant="ghost"
      aria-label="Cambiar tema"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className={cn('relative text-primary-600 dark:text-primary-200', className)}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
