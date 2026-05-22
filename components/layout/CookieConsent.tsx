'use client';
import { useState, useEffect, useCallback } from 'react';
import { getConsent, saveConsent } from '@/lib/consent';

const CATEGORIES = [
  {
    id: 'necessary' as const,
    title: 'Nödvändiga',
    description: 'Nödvändiga cookies krävs för att webbplatsen ska fungera korrekt. De lagrar inga personuppgifter och kan inte inaktiveras.',
    alwaysActive: true,
  },
  {
    id: 'functional' as const,
    title: 'Funktionella',
    description: 'Funktionella cookies möjliggör inbäddade videor från YouTube och Vimeo. Utan dessa visas en platshållare istället för videon.',
    alwaysActive: false,
  },
  {
    id: 'analytics' as const,
    title: 'Analys',
    description: 'Analyticscookies hjälper oss förstå hur besökare använder webbplatsen. Vi använder Google Analytics 4 med anonymiserad IP-adress.',
    alwaysActive: false,
  },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
        checked ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-600'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!getConsent()) setVisible(true);

    const openHandler = () => {
      const c = getConsent();
      if (c) { setFunctional(c.functional); setAnalytics(c.analytics); }
      setShowSettings(true);
      setVisible(true);
    };
    window.addEventListener('nkc:open-consent', openHandler);
    return () => window.removeEventListener('nkc:open-consent', openHandler);
  }, []);

  const acceptAll = useCallback(() => {
    saveConsent({ functional: true, analytics: true });
    setVisible(false);
    setShowSettings(false);
  }, []);

  const rejectAll = useCallback(() => {
    saveConsent({ functional: false, analytics: false });
    setVisible(false);
    setShowSettings(false);
  }, []);

  const savePrefs = useCallback(() => {
    saveConsent({ functional, analytics });
    setVisible(false);
    setShowSettings(false);
  }, [functional, analytics]);

  if (!visible) return null;

  if (showSettings) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
        aria-modal="true"
        role="dialog"
        aria-label="Cookie-inställningar"
      >
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-base font-black text-zinc-900 dark:text-white">Hantera samtyckesinställningar</h2>
            <button
              type="button"
              onClick={rejectAll}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-lg"
              aria-label="Stäng och neka alla"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
              Vi använder cookies och liknande tekniker för att webbplatsen ska fungera, visa videor och mäta trafik.
              Nödvändiga cookies är alltid aktiva. Övriga kan du välja fritt.
            </p>

            {CATEGORIES.map(cat => (
              <div key={cat.id} className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${expanded === cat.id ? 'rotate-90' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">{cat.title}</span>
                  </div>
                  {cat.alwaysActive ? (
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">Alltid aktiv</span>
                  ) : (
                    <span onClick={e => e.stopPropagation()}>
                      <Toggle
                        checked={cat.id === 'functional' ? functional : analytics}
                        onChange={cat.id === 'functional' ? setFunctional : setAnalytics}
                      />
                    </span>
                  )}
                </button>
                {expanded === cat.id && (
                  <div className="px-4 pb-4 pt-1">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{cat.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-6 py-5 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={rejectAll}
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Neka alla
            </button>
            <button
              type="button"
              onClick={savePrefs}
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Spara inställningar
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-sm font-bold text-white hover:bg-amber-600 transition-colors"
            >
              Acceptera alla
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4">
      <div className="mx-auto max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-zinc-900 dark:text-white mb-0.5">Vi använder cookies</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Cookies används för att webbplatsen ska fungera, visa videor och mäta trafik med Google Analytics.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            <button
              type="button"
              onClick={rejectAll}
              className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
            >
              Neka alla
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
            >
              Anpassa
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="px-4 py-2 rounded-xl bg-amber-500 text-xs font-bold text-white hover:bg-amber-600 transition-colors whitespace-nowrap"
            >
              Acceptera alla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
