'use client';

import { useEffect } from 'react';
import { useUserPreferences } from '../hooks/useUserPreferences';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { preferences } = useUserPreferences();

  // Apply theme based on preferences
  useEffect(() => {
    const applyTheme = () => {
      const { theme } = preferences;
      const root = document.documentElement;
      
      // Remove any existing theme classes
      root.classList.remove('light-theme', 'dark-theme');
      
      // Apply the appropriate theme
      if (theme === 'auto') {
        // Use system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark-theme');
        } else {
          root.classList.add('light-theme');
        }
        
        // Listen for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
          root.classList.remove('light-theme', 'dark-theme');
          root.classList.add(e.matches ? 'dark-theme' : 'light-theme');
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Apply user selected theme
        root.classList.add(`${theme}-theme`);
      }
    };
    
    applyTheme();
  }, [preferences.theme]);
  
  return <>{children}</>;
} 