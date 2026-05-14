'use client';

import { useState, useEffect, useCallback } from 'react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import type { ClubConfig, WebsiteConfig, WebsitePage } from '@/lib/types';

interface Props {
  club: ClubConfig;
  config: WebsiteConfig | null;
  pages: WebsitePage[];
  children: React.ReactNode;
}

export default function PublicLayoutClient({ club, config, pages, children }: Props) {
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<'sv' | 'en'>('sv');
  const darkMode = config?.theme?.darkMode ?? 'user';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('flowroll_lang');
      if (saved === 'en' || saved === 'sv') setLanguage(saved);
    } catch {}

    try {
      const saved = localStorage.getItem('flowroll_theme');
      if (darkMode === 'on') {
        setIsDark(true);
      } else if (darkMode === 'off') {
        setIsDark(false);
      } else {
        if (saved === 'dark') setIsDark(true);
        else if (saved === 'light') setIsDark(false);
        else setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    } catch {}
  }, [darkMode]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDark = useCallback(() => {
    if (darkMode !== 'user') return;
    setIsDark(prev => {
      const next = !prev;
      try { localStorage.setItem('flowroll_theme', next ? 'dark' : 'light'); } catch {}
      return next;
    });
  }, [darkMode]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => {
      const next = prev === 'sv' ? 'en' : 'sv';
      try { localStorage.setItem('flowroll_lang', next); } catch {}
      return next;
    });
  }, []);

  const theme = config?.theme;
  const resolvedColors = isDark
    ? { bg: theme?.darkBackground || '#18181b', text: theme?.darkTextColor || '#fafafa' }
    : { bg: theme?.backgroundColor || '#ffffff', text: theme?.textColor || '#3f3f46' };

  return (
    <>
      <SiteHeader
        club={club}
        config={config}
        pages={pages}
        isDark={isDark}
        onToggleDark={darkMode === 'user' ? toggleDark : undefined}
        language={language}
        onToggleLanguage={toggleLanguage}
        resolvedColors={resolvedColors}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter
        club={club}
        config={config}
        resolvedColors={resolvedColors}
      />
    </>
  );
}
