import Link from 'next/link';
import type { ClubConfig, WebsiteConfig } from '@/lib/types';

interface Props {
  club: ClubConfig;
  config: WebsiteConfig | null;
}

export default function SiteFooter({ club, config }: Props) {
  const footerConfig = config?.footerConfig;
  const showClubInfo = footerConfig?.showClubInfo !== false && club.showClubInfoInFooter !== false;

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          <div>
            {club.clubName && <p className="font-semibold text-zinc-800">{club.clubName}</p>}
            {showClubInfo && (
              <div className="mt-2 text-sm text-zinc-500 space-y-1">
                {club.address && <p>{club.address}{club.city ? `, ${club.city}` : ''}</p>}
                {club.email && <p><a href={`mailto:${club.email}`} className="hover:text-zinc-800">{club.email}</a></p>}
                {club.phone && <p>{club.phone}</p>}
              </div>
            )}
          </div>

          {footerConfig?.links && footerConfig.links.length > 0 && (
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {footerConfig.links.map((l, i) => (
                <Link key={i} href={l.url} className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {footerConfig?.text && (
          <p className="mt-6 text-xs text-zinc-400">{footerConfig.text}</p>
        )}
      </div>
    </footer>
  );
}
