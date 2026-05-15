import type { Metadata } from 'next';
import { Inter, Outfit, Raleway } from 'next/font/google';
import { getClubConfig, getWebsiteConfig } from '@/lib/data';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap', weight: ['700', '800'] });
const raleway = Raleway({ subsets: ['latin', 'latin-ext'], variable: '--font-raleway', display: 'swap', weight: ['400', '500', '600', '700', '800', '900'] });

export async function generateMetadata(): Promise<Metadata> {
  const [club, config] = await Promise.all([getClubConfig(), getWebsiteConfig()]);
  const name = club.clubName ?? 'NKC';
  return {
    title: { default: name, template: `%s | ${name}` },
    description: config?.seoDefaults?.description ?? '',
    robots: { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [club, config] = await Promise.all([getClubConfig(), getWebsiteConfig()]);
  const faviconUrl = club.faviconUrl ?? config?.headerConfig?.logoUrl;

  return (
    <html lang="sv" className={`${inter.variable} ${outfit.variable} ${raleway.variable}`}>
      <head>
        {faviconUrl && <link rel="icon" href={faviconUrl} />}
        {faviconUrl && <link rel="apple-touch-icon" href={faviconUrl} />}
        {/* Prevent flash of wrong theme on load */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('flowroll_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();` }} />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
