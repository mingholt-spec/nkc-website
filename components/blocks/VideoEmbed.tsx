'use client';
import { useState, useEffect } from 'react';
import { hasConsent } from '@/lib/consent';

interface Props {
  embedUrl: string;
  caption?: string;
}

export default function VideoEmbed({ embedUrl, caption }: Props) {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(hasConsent('functional'));
    const handler = () => setConsented(hasConsent('functional'));
    window.addEventListener('nkc:consent', handler);
    return () => window.removeEventListener('nkc:consent', handler);
  }, []);

  if (!consented) {
    return (
      <>
        <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 flex flex-col items-center justify-center gap-3 text-center px-6">
          <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <p className="text-zinc-300 text-sm leading-relaxed max-w-xs">
            Den här videon kräver att du godkänner funktionella cookies.
          </p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('nkc:open-consent'))}
            className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Hantera cookies
          </button>
        </div>
        {caption && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 text-center">{caption}</p>}
      </>
    );
  }

  return (
    <>
      <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
        <iframe
          src={embedUrl}
          title={caption ?? 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
      {caption && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 text-center">{caption}</p>}
    </>
  );
}
