export interface ConsentPreferences {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  timestamp: string;
  version: string;
}

const KEY = 'nkc_cookie_consent';
const VERSION = '1';

export function getConsent(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentPreferences;
    if (parsed.version !== VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(prefs: { functional: boolean; analytics: boolean }): void {
  const consent: ConsentPreferences = {
    necessary: true,
    functional: prefs.functional,
    analytics: prefs.analytics,
    timestamp: new Date().toISOString(),
    version: VERSION,
  };
  localStorage.setItem(KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent('nkc:consent', { detail: consent }));
}

export function hasConsent(category: 'functional' | 'analytics'): boolean {
  const c = getConsent();
  if (!c) return false;
  return c[category] === true;
}
