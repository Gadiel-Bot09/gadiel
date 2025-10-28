import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface Props {
  children: ReactNode;
}

const STORAGE_KEY = 'gadiel-theme';

export function ThemeProvider({ children }: Props) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem(STORAGE_KEY) as 'light' | 'dark') ?? 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const match = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setTheme(match.matches ? 'dark' : 'light');
    match.addEventListener('change', handler);
    return () => match.removeEventListener('change', handler);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="min-h-screen" data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

interface ThemeContextValue {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => undefined,
});

export function useTheme() {
  return useContext(ThemeContext);
}
