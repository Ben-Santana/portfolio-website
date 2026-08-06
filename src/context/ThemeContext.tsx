'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  /** Toggle the theme. Pass the click position to reveal from that point. */
  toggleTheme: (origin?: { x: number; y: number }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default matches the class set by the inline script in layout.tsx
  const [theme, setTheme] = useState<Theme>('dark');

  // On mount, read the theme the inline script already applied
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const applyTheme = (next: Theme) => {
    const doc = document.documentElement;
    doc.classList.remove('light', 'dark');
    doc.classList.add(next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Ignore localStorage errors
    }
    setTheme(next);
  };

  const toggleTheme = (origin?: { x: number; y: number }) => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    const doc = document as DocumentWithViewTransition;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typeof doc.startViewTransition === 'function' && !reducedMotion) {
      // Circular reveal expanding from the toggle (or viewport center)
      const x = origin?.x ?? window.innerWidth / 2;
      const y = origin?.y ?? window.innerHeight / 2;
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      const transition = doc.startViewTransition(() => applyTheme(next));
      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      });
    } else {
      // Fallback: smooth color crossfade instead of a hard cut
      const root = document.documentElement;
      root.classList.add('theme-transitioning');
      applyTheme(next);
      window.setTimeout(() => root.classList.remove('theme-transitioning'), 350);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
