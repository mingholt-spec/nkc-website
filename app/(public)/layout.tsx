import { getClubConfig, getWebsiteConfig, getWebsitePages } from '@/lib/data';
import PublicLayoutClient from '@/components/layout/PublicLayoutClient';

// Nav depends on published pages — ensure it refreshes within 60 s of any page publish/unpublish.
// This overrides the longer revalidate on [slug]/page.tsx for the full route.
export const revalidate = 60;

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
