import Link from 'next/link';
import Image from 'next/image';
import type { ClubConfig, WebsiteConfig, WebsitePage } from '@/lib/types';
import { safeStr } from '@/lib/utils';

interface Props {
  club: ClubConfig;
  config: WebsiteConfig | null;
  pages: WebsitePage[];
}

export default function SiteHeader({ club, config, pages }: Props) {
  const nav = Array.isArray(config?.navigation) ? config.navigation : [];
  const logoUrl = safeStr(config?.headerConfig?.logoUrl ?? club.logoUrl);
  const showName = config?.headerConfig?.showClubName !== false;
  const primaryColor = safeStr(config?.theme?.primaryColor, '#dc2626');
  const clubName = safeStr(club.clubName);

  // Build pageId → slug map for nav links
  const pageSlugMap = Object.fromEntries(pages.map(p => [p.id, p.slug]));

  return (
    <header className="w-full border-b border-zinc-200 bg-white" style={{ '--primary': primaryColor } as React.CSSProperties}>
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          {logoUrl && (
            <Image src={logoUrl} alt={clubName} width={40} height={40} className="h-10 w-auto object-contain" unoptimized />
          )}
          {showName && clubName && (
            <span className="font-bold text-lg text-zinc-900">{clubName}</span>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {nav.map(item => {
            const label = safeStr(item.label);
            if (!label) return null;
            if (item.isExternal && item.externalUrl) {
              return (
                <a key={item.id} href={safeStr(item.externalUrl)} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                  {label}
                </a>
              );
            }
            const slug = item.pageId ? pageSlugMap[item.pageId] : undefined;
            const href = slug ? `/${slug}` : safeStr(item.externalUrl, '#');
            return (
              <Link key={item.id} href={href} className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
