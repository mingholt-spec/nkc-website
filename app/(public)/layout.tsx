import { getClubConfig, getWebsiteConfig, getWebsitePages } from '@/lib/data';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [club, config, pages] = await Promise.all([
    getClubConfig(),
    getWebsiteConfig(),
    getWebsitePages(),
  ]);

  return (
    <>
      <SiteHeader club={club} config={config} pages={pages} />
      <main className="flex-1">{children}</main>
      <SiteFooter club={club} config={config} />
    </>
  );
}
