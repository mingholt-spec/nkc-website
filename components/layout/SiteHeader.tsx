import Link from 'next/link';
import Image from 'next/image';
import type { ClubConfig, WebsiteConfig } from '@/lib/types';

interface Props {
  club: ClubConfig;
  config: WebsiteConfig | null;
}

export default function SiteHeader({ club, config }: Props) {
  const nav = Array.isArray(config?.navigation) ? config.navigation : [];
  const logoUrl = config?.headerConfig?.logoUrl ?? club.logoUrl;
  const showName = config?.headerConfig?.showClubName !== false;
  const primaryColor = config?.theme?.primaryColor ?? '#dc2626';

  return (
    <header className="w-full border-b border-zinc-200 bg-white" style={{ '--primary': primaryColor } as React.CSSProperties}>
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          {logoUrl && (
            <Image src={logoUrl} alt={club.clubName ?? ''} width={40} height={40} className="h-10 w-auto object-contain" />
          )}
          {showName && club.clubName && (
            <span className="font-bold text-lg text-zinc-900">{club.clubName}</span>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {nav.map(item => (
            <NavItem key={item.id} item={item} />
          ))}
        </nav>
      </div>
    </header>
  );
}

function NavItem({ item }: { item: WebsiteConfig['navigation'][number] }) {
  if (item.isExternal && item.externalUrl) {
    return (
      <a href={item.externalUrl} target="_blank" rel="noopener noreferrer"
        className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
        {item.label}
      </a>
    );
  }
  const href = item.pageId ? `/${item.pageId}` : '#';
  return (
    <Link href={href} className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
      {item.label}
    </Link>
  );
}
