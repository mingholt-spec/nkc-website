'use client';

import type { ClubConfig, WebsiteConfig } from '@/lib/types';

const SOCIAL_ICONS: Record<string, { viewBox: string; path: string }> = {
  facebook: { viewBox: '0 0 24 24', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  instagram: { viewBox: '0 0 24 24', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
  youtube: { viewBox: '0 0 24 24', path: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  tiktok: { viewBox: '0 0 24 24', path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' },
  x: { viewBox: '0 0 24 24', path: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z' },
  linkedin: { viewBox: '0 0 24 24', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  whatsapp: { viewBox: '0 0 24 24', path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' },
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

interface Props {
  club: ClubConfig;
  config: WebsiteConfig | null;
  resolvedColors: { bg: string; text: string };
}

export default function SiteFooter({ club, config, resolvedColors }: Props) {
  const footer = config?.footerConfig;
  const theme = config?.theme;
  const bgColor = resolvedColors.bg;
  const txtColor = resolvedColors.text;
  const useColor = config?.socialIconStyle === 'color';

  const showSocial = (config?.socialDisplay?.footer !== false) && (config?.socialLinks || []).filter(l => l.url).length > 0;
  const socialLinks = showSocial ? (config!.socialLinks || []) : [];

  const hasClubInfo = club && (club.clubName || club.phone || club.email || club.address);
  const addressParts = [club.address, [club.postalCode, club.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');

  const hasContent = footer?.text || (footer?.links?.length ?? 0) > 0 || showSocial || footer?.showPoweredBy !== false || hasClubInfo;
  if (!hasContent) return null;

  return (
    <footer className="border-t mt-auto" style={{ borderColor: `${txtColor}15`, backgroundColor: bgColor }}>
      <div className="mx-auto px-6 py-10" style={{ maxWidth: theme?.maxWidth || '1280px' }}>
        {/* Club info */}
        {hasClubInfo && (
          <div className="mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
            <div className="text-center md:text-left">
              {club.clubName && (
                <p className="font-bold text-sm mb-1" style={{ color: txtColor, fontFamily: theme?.headingFont }}>
                  {club.clubName}
                </p>
              )}
              {club.organization_number && (
                <p className="text-xs mb-1" style={{ color: `${txtColor}70`, fontFamily: theme?.bodyFont }}>
                  Org.nr: {club.organization_number}
                </p>
              )}
              {addressParts && (
                <p className="text-xs" style={{ color: `${txtColor}70`, fontFamily: theme?.bodyFont }}>
                  {addressParts}
                </p>
              )}
            </div>
            <div className="flex flex-col items-center md:items-end gap-1">
              {club.phone && (
                <a href={`tel:${club.phone}`} className="text-xs hover:opacity-70 transition-opacity flex items-center gap-1.5"
                  style={{ color: `${txtColor}90`, fontFamily: theme?.bodyFont }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {club.phone}
                </a>
              )}
              {club.email && (
                <a href={`mailto:${club.email}`} className="text-xs hover:opacity-70 transition-opacity flex items-center gap-1.5"
                  style={{ color: `${txtColor}90`, fontFamily: theme?.bodyFont }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {club.email}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Social + links row */}
        {(socialLinks.length > 0 || (footer?.links && footer.links.length > 0)) && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            {footer?.links && footer.links.length > 0 && (
              <nav className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
                {footer.links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                    style={{ color: txtColor, fontFamily: theme?.bodyFont }}>
                    {link.label}
                  </a>
                ))}
              </nav>
            )}

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.filter(l => l.url).map((link) => {
                  const icon = SOCIAL_ICONS[link.platform];
                  if (!icon) return null;
                  const brand = useColor ? BRAND_COLORS[link.platform] : null;
                  return (
                    <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer"
                      aria-label={link.platform}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:opacity-80"
                      style={{ backgroundColor: brand ? brand.bg : `${txtColor}10`, color: brand ? brand.fg : txtColor }}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox={icon.viewBox}><path d={icon.path} /></svg>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {footer?.text && (
          <p className="text-sm mb-6 text-center md:text-left" style={{ color: `${txtColor}99`, fontFamily: theme?.bodyFont }}>
            {footer.text}
          </p>
        )}

        {footer?.showPoweredBy !== false && (
          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: `${txtColor}10` }}>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: `${txtColor}50`, fontFamily: theme?.bodyFont }}>
              Powered by{' '}
              <a href="https://bjj-manager-pro.web.app" className="hover:opacity-70"
                style={{ color: theme?.primaryColor || '#e50401' }}>
                BJJ Manager Pro
              </a>
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}
