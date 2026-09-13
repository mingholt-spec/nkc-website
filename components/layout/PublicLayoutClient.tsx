'use client';

import { useState, useEffect, useCallback } from 'react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import type { ClubConfig, WebsiteConfig, WebsitePage } from '@/lib/types';
import { LanguageContext, LANGUAGE_CHANGED_EVENT, type Lang } from '@/lib/language-context';

// Mirrors the language choice into a cookie (in addition to localStorage) so
// server-rendered code without any other language signal — metadata, JSON-LD,
// /bekrafta — can read it via getServerLanguage(). 1 year, matches the
// effectively-permanent nature of the localStorage preference it mirrors.
function writeLanguageCookie(lang: Lang) {
  try { document.cookie = `flowroll_lang=${lang}; path=/; max-age=31536000; samesite=lax`; } catch {}
}

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
      if (saved === 'en' || saved === 'sv') { setLanguage(saved); writeLanguageCookie(saved); }
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
    const html = document.documentElement;
    if (isDark) {
      if (!html.classList.contains('dark')) html.classList.add('dark');
    } else {
      if (html.classList.contains('dark')) html.classList.remove('dark');
    }
  }, [isDark]);

  // Keeps the <html lang> attribute correct for screen readers/browser
  // features without needing a server-side cookie read (which would force
  // every page out of static rendering — see ClientTitleOverride for the
  // same trade-off applied to <title>).
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

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
      writeLanguageCookie(next);
      window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGED_EVENT, { detail: next }));
      return next;
    });
  }, []);

  const theme = config?.theme;
  const resolvedColors = isDark
    ? { bg: theme?.darkBackground || '#18181b', text: theme?.darkTextColor || '#fafafa' }
    : { bg: theme?.backgroundColor || '#ffffff', text: theme?.textColor || '#3f3f46' };

  return (
    <LanguageContext.Provider value={language}>
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
      <main className="flex-1 site-bg site-text">{children}</main>
      <SiteFooter
        club={club}
        config={config}
        resolvedColors={resolvedColors}
      />
    </LanguageContext.Provider>
  );
}
