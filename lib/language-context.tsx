'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'sv' | 'en';
export const LanguageContext = createContext<Lang>('sv');
export function useLanguage(): Lang { return useContext(LanguageContext); }

export const LANGUAGE_CHANGED_EVENT = 'nkc:language-changed';

/**
 * For components rendered OUTSIDE LanguageContext.Provider — the provider only
 * wraps app/(public)/layout.tsx's children, so components mounted directly in
 * the root app/layout.tsx (CookieConsent, not-found) never see the real
 * selected language via useLanguage(). Reads the same localStorage key
 * PublicLayoutClient writes to, and updates on the same-tab custom event fired
 * by its toggleLanguage (native 'storage' events don't fire same-tab).
 */
export function useStoredLanguage(): Lang {
  const [lang, setLang] = useState<Lang>('sv');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('flowroll_lang');
      if (saved === 'en' || saved === 'sv') setLang(saved);
    } catch {}
    const handler = (e: Event) => {
      const next = (e as CustomEvent<Lang>).detail;
      if (next === 'en' || next === 'sv') setLang(next);
    };
    window.addEventListener(LANGUAGE_CHANGED_EVENT, handler);
    return () => window.removeEventListener(LANGUAGE_CHANGED_EVENT, handler);
  }, []);
  return lang;
}
