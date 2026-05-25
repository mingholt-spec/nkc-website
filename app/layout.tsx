import type { Metadata } from 'next';
import { Raleway } from 'next/font/google';
import { getClubConfig, getWebsiteConfig } from '@/lib/data';
import CookieConsent from '@/components/layout/CookieConsent';
import GoogleAnalytics from '@/components/layout/GoogleAnalytics';
import './globals.css';

// Only load Raleway (the configured font). Inter/Outfit were unused fallbacks.
// Weights: 400 body, 500 body-medium, 600 semibold, 700 bold, 900 black headers.
// latin only — Swedish å/ä/ö are covered by latin subset, latin-ext is not needed.
const raleway = Raleway({ subsets: ['latin'], variable: '--font-raleway', display: 'optional', weight: ['400', '500', '600', '700', '900'] });

export async function generateMetadata(): Promise<Metadata> {
  const [club, config] = await Promise.all([getClubConfig(), getWebsiteConfig()]);
  const name = club.clubName ?? 'NKC';
  const faviconUrl = club.faviconUrl ?? config?.headerConfig?.logoUrl;
  return {
    title: { default: name, template: `%s | ${name}` },
    description: config?.seoDefaults?.description ?? '',
    ...(faviconUrl ? { icons: { icon: faviconUrl, apple: faviconUrl } } : {}),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [, config] = await Promise.all([getClubConfig(), getWebsiteConfig()]);
  const theme = config?.theme;

  const cssVars = {
    '--site-bg':       theme?.backgroundColor  ?? '#ffffff',
    '--site-bg-dark':  theme?.darkBackground   ?? '#18181b',
    '--site-text':     theme?.textColor        ?? '#3f3f46',
    '--site-text-dark':theme?.darkTextColor    ?? '#fafafa',
  } as React.CSSProperties;

  return (
    <html lang="sv" className={raleway.variable} style={cssVars} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        {/* Prevent flash of wrong theme on load */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('flowroll_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();` }} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <CookieConsent />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
