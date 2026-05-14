import type { Metadata } from 'next';
import { Inter, Outfit, Raleway } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap', weight: ['700', '800'] });
const raleway = Raleway({ subsets: ['latin', 'latin-ext'], variable: '--font-raleway', display: 'swap', weight: ['400', '500', '600', '700', '800', '900'] });

export const metadata: Metadata = {
  title: { default: 'NKC', template: '%s | NKC' },
  description: '',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${inter.variable} ${outfit.variable} ${raleway.variable}`}>
      <head>
        {/* Prevent flash of wrong theme on load */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('flowroll_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();` }} />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
