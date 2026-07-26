import { useEffect } from 'react';

// The Ledger is dark-mode only. This hook simply ensures the `dark` class is
// always present on <html>, and clears any old 'theme' preference users may
// have saved back when light mode existed (so nothing ever flips it off).
export const useDarkMode = () => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.removeItem('theme');
  }, []);

  return { isDark: true, toggle: () => {} };
};