import { useState, useEffect } from 'react';

function getInitialTheme() {
  const stored = localStorage.getItem('activai-theme');
  if (stored === 'dark' || stored === 'light') {
    return stored === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useTheme() {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('activai-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return { isDark, toggle };
}
