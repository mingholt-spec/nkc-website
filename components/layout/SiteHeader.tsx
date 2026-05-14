'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import type { NavigationItem, WebsiteConfig, WebsitePage, ClubConfig, SocialLink } from '@/lib/types';
import { safeStr } from '@/lib/utils';

const SOCIAL_ICONS: Record<string, { viewBox: string; path: string; label: string }> = {
  facebook: { label: 'Facebook', viewBox: '0 0 24 24', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  instagram: { label: 'Instagram', viewBox: '0 0 24 24', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
  youtube: { label: 'YouTube', viewBox: '0 0 24 24', path: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  tiktok: { label: 'TikTok', viewBox: '0 0 24 24', path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' },
  x: { label: 'X', viewBox: '0 0 24 24', path: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z' },
  linkedin: { label: 'LinkedIn', viewBox: '0 0 24 24', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  whatsapp: { label: 'WhatsApp', viewBox: '0 0 24 24', path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' },
};

const BRAND_COLORS: Record<string, { bg: string; fg: string }> = {
  facebook: { bg: '#1877F2', fg: '#ffffff' },
  instagram: { bg: '#E4405F', fg: '#ffffff' },
  youtube: { bg: '#FF0000', fg: '#ffffff' },
  tiktok: { bg: '#000000', fg: '#ffffff' },
  x: { bg: '#000000', fg: '#ffffff' },
  linkedin: { bg: '#0A66C2', fg: '#ffffff' },
  whatsapp: { bg: '#25D366', fg: '#ffffff' },
};

const T = {
  sv: { lightMode: 'Ljust läge', darkMode: 'Mörkt läge', myAccount: 'Mitt konto', login: 'Logga in', becomeMember: 'Bli Medlem', follow: 'Följ oss' },
  en: { lightMode: 'Light mode', darkMode: 'Dark mode', myAccount: 'My Account', login: 'Login', becomeMember: 'Become a Member', follow: 'Follow us' },
};

function SocialIcons({ links, textColor, colorMode }: { links: SocialLink[]; textColor: string; colorMode?: boolean }) {
  const filtered = links.filter(l => l.url);
  if (filtered.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      {filtered.map(link => {
        const icon = SOCIAL_ICONS[link.platform];
        if (!icon) return null;
        const brand = colorMode ? BRAND_COLORS[link.platform] : null;
        return (
          <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={icon.label}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ backgroundColor: brand ? brand.bg : `${textColor}20`, color: brand ? brand.fg : textColor }}>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox={icon.viewBox}><path d={icon.path} /></svg>
          </a>
        );
      })}
    </div>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className || 'w-3 h-3'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function pageHref(page: WebsitePage) {
  return page.isHomepage ? '/' : `/${page.slug}`;
}

function resolveHref(item: NavigationItem, pages: WebsitePage[]) {
  if (item.isExternal && item.externalUrl) return item.externalUrl;
  if (item.pageId) {
    const page = pages.find(p => p.id === item.pageId);
    if (page) {
      const base = pageHref(page);
      return item.anchorBlockId ? `${base}#block-${item.anchorBlockId}` : base;
    }
  }
  if (item.anchorBlockId) return `#block-${item.anchorBlockId}`;
  return '#';
}

function getLabel(item: NavigationItem, language: 'sv' | 'en') {
  return (language === 'en' && item.labelEn) ? item.labelEn : item.label;
}

function DesktopDropdown({ item, pages, currentSlug, txtColor, bgColor, primaryColor, radius, bodyFont, language }: {
  item: NavigationItem; pages: WebsitePage[]; currentSlug: string;
  txtColor: string; bgColor: string; primaryColor: string; radius: string; bodyFont?: string; language: 'sv' | 'en';
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const children = item.children || [];

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);
  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, []);
  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const isChildActive = children.some(child => {
    if (child.pageId) return pages.find(p => p.id === child.pageId)?.slug === currentSlug;
    return false;
  });

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className="px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1.5"
        style={{ color: isChildActive ? primaryColor : txtColor, borderRadius: radius, backgroundColor: isChildActive ? `${primaryColor}10` : 'transparent', fontFamily: bodyFont }}
        aria-haspopup="true" aria-expanded={open}
      >
        {getLabel(item, language)}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className="absolute left-0 top-full pt-1 z-50" style={{ opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(-4px)', pointerEvents: open ? 'auto' : 'none', transition: 'opacity 150ms ease, transform 150ms ease' }}>
        <div className="min-w-[200px] py-2 rounded-xl border shadow-lg" style={{ backgroundColor: bgColor, borderColor: `${txtColor}15`, boxShadow: '0 10px 40px -8px rgba(0,0,0,0.15)', borderRadius: radius === '9999px' ? '12px' : radius }}>
          {children.map(child => {
            const childActive = child.pageId ? pages.find(p => p.id === child.pageId)?.slug === currentSlug : false;
            return (
              <a key={child.id} href={resolveHref(child, pages)} target={child.isExternal ? '_blank' : undefined} rel={child.isExternal ? 'noopener noreferrer' : undefined}
                onClick={e => { if (child.anchorBlockId && !child.isExternal) { e.preventDefault(); document.getElementById(`block-${child.anchorBlockId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }}
                className="block px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all hover:opacity-70"
                style={{ color: childActive ? primaryColor : txtColor, backgroundColor: childActive ? `${primaryColor}08` : 'transparent', fontFamily: bodyFont }}>
                {getLabel(child, language)}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobileAccordion({ item, pages, currentSlug, txtColor, primaryColor, radius, bodyFont, language, onNavigate }: {
  item: NavigationItem; pages: WebsitePage[]; currentSlug: string;
  txtColor: string; primaryColor: string; radius: string; bodyFont?: string; language: 'sv' | 'en'; onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const children = item.children || [];

  const isChildActive = children.some(child => {
    if (child.pageId) return pages.find(p => p.id === child.pageId)?.slug === currentSlug;
    return false;
  });

  return (
    <div>
      <button onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-between"
        style={{ color: isChildActive ? primaryColor : txtColor, borderRadius: radius, backgroundColor: isChildActive ? `${primaryColor}10` : 'transparent', fontFamily: bodyFont }}
        aria-expanded={expanded}>
        {getLabel(item, language)}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: expanded ? `${children.length * 56}px` : '0px', opacity: expanded ? 1 : 0 }}>
        <div className="pl-6 border-l-2 ml-4 mt-1 mb-1" style={{ borderColor: `${txtColor}15` }}>
          {children.map(child => {
            const childActive = child.pageId ? pages.find(p => p.id === child.pageId)?.slug === currentSlug : false;
            return (
              <a key={child.id} href={resolveHref(child, pages)} target={child.isExternal ? '_blank' : undefined} rel={child.isExternal ? 'noopener noreferrer' : undefined}
                onClick={e => { if (child.anchorBlockId && !child.isExternal) { e.preventDefault(); onNavigate(); document.getElementById(`block-${child.anchorBlockId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }}
                className="block px-4 py-2.5 text-sm font-bold uppercase tracking-widest transition-all"
                style={{ color: childActive ? primaryColor : txtColor, borderRadius: radius, backgroundColor: childActive ? `${primaryColor}10` : 'transparent', fontFamily: bodyFont }}>
                {getLabel(child, language)}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface Props {
  club: ClubConfig;
  config: WebsiteConfig | null;
  pages: WebsitePage[];
  isDark: boolean;
  onToggleDark?: () => void;
  language: 'sv' | 'en';
  onToggleLanguage: () => void;
  resolvedColors: { bg: string; text: string };
}

export default function SiteHeader({ club, config, pages, isDark, onToggleDark, language, onToggleLanguage, resolvedColors }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const currentSlug = pathname === '/' ? '' : pathname.replace(/^\//, '').split('/')[0];
  const t = T[language];

  const header = config?.headerConfig;
  const nav = Array.isArray(config?.navigation) ? config!.navigation : [];
  const theme = config?.theme;

  const showSocial = (config?.socialDisplay?.header !== false) && (config?.socialLinks || []).filter(l => l.url).length > 0;
  const socialLinks = showSocial ? (config!.socialLinks || []) : [];

  const bgColor = resolvedColors.bg;
  const txtColor = resolvedColors.text;
  const primaryColor = safeStr(theme?.primaryColor, '#e50401');

  const logoUrl = safeStr(header?.logoUrl ?? club.logoUrl);
  const clubName = safeStr(club.clubName);
  const showClubName = header?.showClubName !== false;

  const radius = theme?.borderRadius === 'none' ? '0' : theme?.borderRadius === 'sm' ? '4px' : theme?.borderRadius === 'md' ? '8px' : theme?.borderRadius === 'lg' ? '12px' : '9999px';
  const maxWidth = theme?.maxWidth || '1280px';
  const bodyFont = theme?.bodyFont;
  const headingFont = theme?.headingFont;

  const isActive = (item: NavigationItem) => {
    if (item.pageId) return pages.find(p => p.id === item.pageId)?.slug === currentSlug || (item.pageId && pages.find(p => p.id === item.pageId)?.isHomepage && pathname === '/');
    return false;
  };

  const DarkToggle = ({ ariaLabel }: { ariaLabel: string }) => (
    <button onClick={onToggleDark} className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
      style={{ color: txtColor, backgroundColor: `${txtColor}10` }} aria-label={ariaLabel}>
      {isDark ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
      )}
    </button>
  );

  return (
    <header className={`w-full z-50 ${header?.sticky !== false ? 'sticky top-0' : ''}`} style={{ backgroundColor: bgColor }}>
      <div className="mx-auto flex items-center justify-between px-6 py-4" style={{ maxWidth }}>
        {/* Logo + club name */}
        <a href="/" className="flex items-center gap-3">
          {logoUrl && (
            <img src={logoUrl} alt={clubName} className="h-10 w-auto object-contain" />
          )}
          {showClubName && clubName && (
            <span className="text-lg font-black uppercase tracking-tight" style={{ fontFamily: headingFont, color: txtColor }}>
              {clubName}
            </span>
          )}
        </a>

        {/* Desktop: nav + social + dark toggle + language + login */}
        <div className="hidden md:flex items-center gap-4">
          {nav.length > 0 && (
            <nav className="flex items-center gap-1">
              {nav.map(item => {
                const hasChildren = (item.children || []).length > 0;
                if (hasChildren) {
                  return (
                    <DesktopDropdown key={item.id} item={item} pages={pages} currentSlug={currentSlug}
                      txtColor={txtColor} bgColor={bgColor} primaryColor={primaryColor} radius={radius} bodyFont={bodyFont} language={language} />
                  );
                }
                const active = isActive(item);
                return (
                  <a key={item.id} href={resolveHref(item, pages)} target={item.isExternal ? '_blank' : undefined}
                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                    onClick={e => { if (item.anchorBlockId && !item.isExternal) { e.preventDefault(); document.getElementById(`block-${item.anchorBlockId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all"
                    style={{ color: active ? primaryColor : txtColor, borderRadius: radius, backgroundColor: active ? `${primaryColor}10` : 'transparent', fontFamily: bodyFont }}>
                    {getLabel(item, language)}
                  </a>
                );
              })}
            </nav>
          )}

          {socialLinks.length > 0 && (
            <>
              {nav.length > 0 && <div className="w-px h-6" style={{ backgroundColor: `${txtColor}20` }} />}
              <SocialIcons links={socialLinks} textColor={txtColor} colorMode={config?.socialIconStyle === 'color'} />
            </>
          )}

          {onToggleDark && (
            <>
              <div className="w-px h-6" style={{ backgroundColor: `${txtColor}20` }} />
              <DarkToggle ariaLabel={isDark ? t.lightMode : t.darkMode} />
            </>
          )}

          <div className="w-px h-6" style={{ backgroundColor: `${txtColor}20` }} />
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 gap-0.5">
            <button onClick={() => language !== 'sv' && onToggleLanguage()} title="Svenska"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${language === 'sv' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>
              <span className="text-sm leading-none">🇸🇪</span>
            </button>
            <button onClick={() => language !== 'en' && onToggleLanguage()} title="English"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${language === 'en' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>
              <span className="text-sm leading-none">🇬🇧</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a href="/app"
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80"
              style={{ color: txtColor }}>
              {t.login}
            </a>
            <a href="/app"
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 rounded-lg"
              style={{ color: '#fff', backgroundColor: primaryColor }}>
              {t.becomeMember}
            </a>
          </div>
        </div>

        {/* Mobile: dark toggle + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          {onToggleDark && <DarkToggle ariaLabel={isDark ? t.lightMode : t.darkMode} />}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2" style={{ color: txtColor }}>
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t px-6 py-4" style={{ borderColor: `${txtColor}15`, backgroundColor: bgColor }}>
          {nav.length > 0 && (
            <nav className="flex flex-col gap-1">
              {nav.map(item => {
                const hasChildren = (item.children || []).length > 0;
                if (hasChildren) {
                  return (
                    <MobileAccordion key={item.id} item={item} pages={pages} currentSlug={currentSlug}
                      txtColor={txtColor} primaryColor={primaryColor} radius={radius} bodyFont={bodyFont}
                      language={language} onNavigate={() => setMobileOpen(false)} />
                  );
                }
                const active = isActive(item);
                return (
                  <a key={item.id} href={resolveHref(item, pages)} target={item.isExternal ? '_blank' : undefined}
                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                    onClick={e => { if (item.anchorBlockId && !item.isExternal) { e.preventDefault(); setMobileOpen(false); document.getElementById(`block-${item.anchorBlockId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } else { setMobileOpen(false); } }}
                    className="px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all"
                    style={{ color: active ? primaryColor : txtColor, borderRadius: radius, backgroundColor: active ? `${primaryColor}10` : 'transparent', fontFamily: bodyFont }}>
                    {getLabel(item, language)}
                  </a>
                );
              })}
            </nav>
          )}

          {socialLinks.length > 0 && (
            <div className={`flex items-center gap-3 px-4 ${nav.length > 0 ? 'pt-4 mt-3 border-t' : ''}`} style={{ borderColor: `${txtColor}15` }}>
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${txtColor}60` }}>{t.follow}</span>
              <SocialIcons links={socialLinks} textColor={txtColor} colorMode={config?.socialIconStyle === 'color'} />
            </div>
          )}

          <div className={`px-4 ${(nav.length > 0 || socialLinks.length > 0) ? 'pt-4 mt-3 border-t' : ''}`} style={{ borderColor: `${txtColor}15` }}>
            <div className="flex gap-2">
              <a href="/app"
                className="flex-1 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all rounded-lg text-center"
                style={{ color: txtColor, backgroundColor: `${txtColor}08` }}>
                {t.login}
              </a>
              <a href="/app"
                className="flex-1 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all active:scale-95 rounded-lg text-center"
                style={{ color: '#fff', backgroundColor: primaryColor }}>
                {t.becomeMember}
              </a>
            </div>
            <div className="flex justify-center pt-3">
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 gap-0.5">
                <button onClick={() => language !== 'sv' && onToggleLanguage()} title="Svenska"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${language === 'sv' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>
                  <span className="text-sm leading-none">🇸🇪</span>
                  <span>SV</span>
                </button>
                <button onClick={() => language !== 'en' && onToggleLanguage()} title="English"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${language === 'en' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>
                  <span className="text-sm leading-none">🇬🇧</span>
                  <span>EN</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
