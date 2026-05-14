import { getClubConfig, getWebsiteConfig, getWebsitePages } from '@/lib/data';
import PublicLayoutClient from '@/components/layout/PublicLayoutClient';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [club, config, pages] = await Promise.all([
    getClubConfig(),
    getWebsiteConfig(),
    getWebsitePages(),
  ]);

  return (
    <PublicLayoutClient club={club} config={config} pages={pages}>
      {children}
    </PublicLayoutClient>
  );
}
