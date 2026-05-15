'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Campaign, CampaignScheduleDay } from '@/lib/types';

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);
  const toggle = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      try { localStorage.setItem('flowroll_theme', next ? 'dark' : 'light'); } catch {}
      return next;
    });
  }, []);
  return { isDark, toggle };
}

interface Props {
  campaign: Campaign;
  children: React.ReactNode; // rendered content blocks from server
}

const TITLE_SIZE_CLASSES: Record<string, string> = {
  xs:  'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
  sm:  'text-2xl sm:text-3xl md:text-5xl lg:text-6xl',
  md:  'text-3xl sm:text-4xl md:text-6xl lg:text-7xl',
  lg:  'text-3xl sm:text-5xl md:text-7xl lg:text-8xl',
  xl:  'text-4xl sm:text-6xl md:text-8xl lg:text-[9rem]',
  '2xl': 'text-5xl sm:text-7xl md:text-[9rem] lg:text-[12rem]',
};

function formatDateShort(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('sv-SE', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

const inputClasses = 'w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold text-sm focus:ring-2 outline-none transition-all placeholder-zinc-400';
const sidebarInputClasses = 'w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold text-sm focus:ring-2 outline-none transition-all placeholder-zinc-400';

export default function EventPageClient({ campaign, children }: Props) {
  const { pageConfig, formConfig, eventDetails } = campaign;
  const accent = campaign.accentColor ?? null;
  const { isDark, toggle: toggleDark } = useDarkMode();

  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const isSidebar = campaign.formLayout === 'sidebar';
  const hasHtmlBlocks = campaign.contentBlocks?.some(b => b.type === 'html') ?? false;
  const schedule = (eventDetails?.schedule ?? []) as CampaignScheduleDay[];
  const hasSchedule = campaign.goal === 'event' && schedule.length > 0;
  const price = eventDetails?.price ?? 0;
  const isPaid = campaign.goal === 'event' && price > 0;
  const maxAttendees = eventDetails?.maxAttendees ?? 0;
  const registrationCount = campaign.registrationCount ?? 0;
  const spotsLeft = maxAttendees > 0 ? maxAttendees - registrationCount : 0;
  const bookingPercent = maxAttendees > 0 ? Math.round((registrationCount / maxAttendees) * 100) : 0;
  const isUrgent = maxAttendees > 0 && bookingPercent >= 75;
  const isSoldOut = maxAttendees > 0 && registrationCount >= maxAttendees;

  useEffect(() => {
    if (isSidebar || !formRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(formRef.current);
    return () => observer.disconnect();
  }, [isSidebar]);

  const scrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `https://bjj-manager-pro.web.app/event/${campaign.slug}`;
  };

  // ── Schedule card ──
  const ScheduleCard = () => {
    if (!hasSchedule) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 shrink-0" style={{ color: accent ?? '#e50401' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Schema</span>
        </div>
        {schedule.map((day, i) => (
          <div key={i} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
            <span className="text-sm font-black text-zinc-900 dark:text-white">{formatDateShort(day.date)}</span>
            <span className="text-xs font-bold text-zinc-500">{day.time}{day.endTime ? ` – ${day.endTime}` : ''}</span>
          </div>
        ))}
      </div>
    );
  };

  // ── Social proof bar ──
  const SocialProofBar = () => {
    if (maxAttendees <= 0) return null;
    if (isSoldOut) {
      return <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Fullbokat</span>;
    }
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={`text-xs font-black uppercase tracking-wider ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-zinc-600 dark:text-zinc-300'}`}>
              {isUrgent ? 'Få platser kvar!' : `${spotsLeft} platser kvar`}
            </span>
          </div>
          <span className="text-[10px] font-bold text-zinc-400">{registrationCount}/{maxAttendees}</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${isUrgent ? 'bg-red-500' : ''}`}
            style={{ width: `${Math.min(bookingPercent, 100)}%`, ...(!isUrgent ? { backgroundColor: accent ?? '#e50401' } : {}) }}
          />
        </div>
      </div>
    );
  };

  // ── Registration form ──
  const renderForm = (compact: boolean) => (
    <form onSubmit={handleSubmit}>
      <h2 className={`${compact ? 'text-lg' : 'text-2xl'} font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-4 font-display`}>
        Anmälan
      </h2>
      <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3`}>
        {formConfig.map(field => (
          <div key={field.id} className={!compact && field.type === 'guardianInfo' ? 'sm:col-span-2' : ''}>
            {field.type === 'guardianInfo' ? (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-2">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Målsmans uppgifter</p>
                <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'} gap-2`}>
                  <input name="guardianName" placeholder="Namn" required={field.required} className={compact ? sidebarInputClasses : inputClasses} />
                  <input name="guardianEmail" type="email" placeholder="E-post" required={field.required} className={compact ? sidebarInputClasses : inputClasses} />
                  <input name="guardianPhone" type="tel" placeholder="Telefon" required={field.required} className={compact ? sidebarInputClasses : inputClasses} />
                </div>
              </div>
            ) : (
              <input
                type={field.type === 'phone' ? 'tel' : field.type}
                name={field.name}
                placeholder={field.label}
                required={field.required}
                className={compact ? sidebarInputClasses : inputClasses}
              />
            )}
          </div>
        ))}
      </div>

      <label className={`flex items-start gap-3 ${compact ? 'mt-3' : 'mt-4'} cursor-pointer`}>
        <input
          type="checkbox"
          checked={gdprAccepted}
          onChange={e => setGdprAccepted(e.target.checked)}
          required
          className="mt-0.5 w-5 h-5 rounded border-zinc-300 dark:border-zinc-600 shrink-0"
          style={{ accentColor: accent ?? '#e50401' }}
        />
        <span className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          Jag godkänner att mina uppgifter sparas och behandlas i enlighet med GDPR för hantering av min anmälan.
        </span>
      </label>

      <button
        type="submit"
        disabled={isSoldOut || !gdprAccepted}
        className={`w-full mt-4 text-white font-black ${compact ? 'py-4 rounded-xl text-[10px]' : 'py-5 rounded-2xl text-xs'} uppercase tracking-[0.2em] active:scale-95 disabled:opacity-50 transition-all`}
        style={{
          backgroundColor: isSoldOut ? '#a1a1aa' : (accent ?? '#e50401'),
          boxShadow: !isSoldOut ? `0 0 24px ${(accent ?? '#e50401')}30` : undefined,
        }}
      >
        {isSoldOut ? 'Fullbokat' : isPaid ? `Betala & anmäl — ${price} kr` : 'Skicka anmälan'}
      </button>
    </form>
  );

  const formCardStyle: React.CSSProperties = accent ? { borderTopColor: accent, borderTopWidth: '3px' } : {};
  const formCardClasses = hasHtmlBlocks
    ? 'rounded-2xl shadow-xl p-6 space-y-5 bg-zinc-900/80 backdrop-blur-xl border border-white/10'
    : 'rounded-2xl shadow-xl p-6 space-y-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800';

  const FormCard = ({ compact }: { compact: boolean }) => (
    <div className={formCardClasses} style={formCardStyle}>
      {hasSchedule && (
        <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <ScheduleCard />
        </div>
      )}
      {(isPaid || maxAttendees > 0) && (
        <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800 space-y-3">
          {isPaid && (
            <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{price} kr</span>
          )}
          <SocialProofBar />
        </div>
      )}
      {renderForm(compact)}
    </div>
  );

  const contentBg = hasHtmlBlocks ? '' : 'bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden';

  return (
    <div className={`${hasHtmlBlocks ? 'bg-black dark:bg-black' : 'bg-zinc-50 dark:bg-black'} min-h-screen font-sans`}>

      {/* HERO */}
      <header className="relative h-[40vh] sm:h-[50vh] md:h-[65vh] min-h-[350px] md:min-h-[500px]">
        {pageConfig.headerImage ? (
          <img src={pageConfig.headerImage} alt={pageConfig.title} className="w-full h-full object-cover" decoding="async" />
        ) : (
          <div className="w-full h-full bg-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        {/* Dark mode toggle */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={toggleDark}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all"
            aria-label={isDark ? 'Ljust läge' : 'Mörkt läge'}
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>
        <div className="absolute bottom-10 md:bottom-20 left-0 right-0 px-6 sm:px-10 max-w-6xl mx-auto">
          <h1 className={`${TITLE_SIZE_CLASSES[pageConfig.titleSize ?? 'xl']} font-black tracking-tighter uppercase leading-[0.85] font-display text-white mb-4`}>
            {pageConfig.title}
          </h1>
          {pageConfig.instructor && (
            <p className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-[0.2em] opacity-90" style={{ color: accent ?? '#e50401' }}>
              Med {pageConfig.instructor}
            </p>
          )}
        </div>
      </header>

      {/* QUICK INFO BAR (stacked only) */}
      {!isSidebar && (hasSchedule || isPaid || maxAttendees > 0) && (
        <div className={`border-b ${hasHtmlBlocks ? 'bg-black/60 backdrop-blur-xl border-white/10' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {hasSchedule && schedule.map((day, i) => (
              <div key={i} className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" style={{ color: accent ?? '#e50401' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  {formatDateShort(day.date)} {day.time}{day.endTime ? `–${day.endTime}` : ''}
                </span>
              </div>
            ))}
            {isPaid && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Pris</span>
                <span className="text-lg font-black tracking-tight" style={{ color: accent ?? '#e50401' }}>{price} kr</span>
              </div>
            )}
            {maxAttendees > 0 && !isSoldOut && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className={`text-xs font-black uppercase tracking-wider ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-zinc-600 dark:text-zinc-300'}`}>
                    {isUrgent ? 'Få platser kvar!' : `${spotsLeft} platser kvar`}
                  </span>
                </div>
                <div className="w-20 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isUrgent ? 'bg-red-500' : ''}`}
                    style={{ width: `${Math.min(bookingPercent, 100)}%`, ...(!isUrgent ? { backgroundColor: accent ?? '#e50401' } : {}) }}
                  />
                </div>
              </div>
            )}
            {isSoldOut && (
              <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Fullbokat</span>
            )}
          </div>
        </div>
      )}

      {/* SHARE BUTTONS */}
      <div className={`${isSidebar ? 'max-w-6xl' : 'max-w-4xl'} mx-auto px-4 sm:px-8 pt-6 flex justify-center`}>
        <ShareRow title={pageConfig.title} accent={accent ?? '#e50401'} />
      </div>

      {/* MAIN CONTENT */}
      {isSidebar ? (
        <main className={`relative z-10 ${hasHtmlBlocks ? 'w-full max-w-[100vw] overflow-x-hidden' : 'max-w-6xl mx-auto px-4 sm:px-8 py-6 md:py-10'}`}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: content blocks */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className={contentBg}>{children}</div>
              {/* Mobile form */}
              <div ref={formRef} className="lg:hidden mt-8" style={{ position: 'relative', zIndex: 1 }}>
                <FormCard compact />
              </div>
            </div>
            {/* Right: sticky form (desktop) */}
            <div className={`hidden lg:block w-[360px] flex-shrink-0 ${hasHtmlBlocks ? 'pr-8 pt-6' : ''}`} style={{ position: 'relative', zIndex: 1 }}>
              <div className="sticky top-6">
                <FormCard compact />
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className={`relative z-10 ${hasHtmlBlocks ? 'bg-black' : 'max-w-4xl mx-auto px-4 sm:px-8 py-6 md:py-10'}`}>
          {hasHtmlBlocks ? (
            <>
              <div className="campaign-blocks" style={{ position: 'relative', zIndex: 0 }}>
                {children}
              </div>
              <div ref={formRef} className="max-w-2xl mx-auto px-4 sm:px-8 py-10 md:py-16" style={{ position: 'relative', zIndex: 1 }}>
                <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 sm:p-10" style={formCardStyle}>
                  {renderForm(false)}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              {children}
              <div className="mx-6 sm:mx-10 border-t border-zinc-100 dark:border-zinc-800" />
              <div ref={formRef} className="px-6 sm:px-10 py-8 sm:py-10">
                {hasSchedule && (
                  <div className="mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                    <ScheduleCard />
                  </div>
                )}
                {(isPaid || maxAttendees > 0) && (
                  <div className="mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800 space-y-3">
                    {isPaid && <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{price} kr</span>}
                    <SocialProofBar />
                  </div>
                )}
                {renderForm(false)}
              </div>
            </div>
          )}
        </main>
      )}

      {/* STICKY CTA BAR */}
      {!isSidebar && showStickyCta && !isSoldOut && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {isPaid && (
                <span className="text-lg font-black text-zinc-900 dark:text-white tracking-tight shrink-0">{price} kr</span>
              )}
              {maxAttendees > 0 && (
                <span className={`text-[10px] font-black uppercase tracking-widest shrink-0 ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-zinc-400'}`}>
                  {isUrgent ? 'Få platser kvar!' : `${spotsLeft} platser kvar`}
                </span>
              )}
            </div>
            <button
              onClick={scrollToForm}
              className="shrink-0 text-white font-black py-3 px-8 rounded-xl uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-all"
              style={{ backgroundColor: accent ?? '#e50401' }}
            >
              Anmäl dig nu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Share row — inline because it needs window.location
function ShareRow({ title, accent }: { title: string; accent: string }) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => { setUrl(window.location.href); }, []);

  const share = (getUrl: (u: string, t: string) => string) =>
    window.open(getUrl(url, title), '_blank', 'noopener,noreferrer');

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TARGETS = [
    { label: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', getUrl: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
    { label: 'X', path: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z', getUrl: (u: string, t: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
    { label: 'WhatsApp', path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z', getUrl: (u: string, t: string) => `https://wa.me/?text=${encodeURIComponent(t + ' ' + u)}` },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Dela</span>
      {TARGETS.map(btn => (
        <button key={btn.label} onClick={() => share(btn.getUrl)} aria-label={`Dela på ${btn.label}`}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d={btn.path} /></svg>
        </button>
      ))}
      <button onClick={copy} aria-label="Kopiera länk"
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{ backgroundColor: copied ? `${accent}20` : 'rgba(161,161,170,0.2)', color: copied ? accent : '#71717a' }}>
        {copied
          ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        }
      </button>
    </div>
  );
}
