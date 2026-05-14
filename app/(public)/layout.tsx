import { getClubConfig, getWebsiteConfig } from '@/lib/data';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [club, config] = await Promise.all([getClubConfig(), getWebsiteConfig()]);

  return (
    <>
      <SiteHeader club={club} config={config} />
      <main className="flex-1">{children}</main>
      <SiteFooter club={club} config={config} />
    </>
  );
}
