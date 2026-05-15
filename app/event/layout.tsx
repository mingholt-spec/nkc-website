import { getClubConfig, getWebsiteConfig } from '@/lib/data';
import EventLayoutFooter from '@/components/events/EventLayoutFooter';

export default async function EventLayout({ children }: { children: React.ReactNode }) {
  const [club, config] = await Promise.all([getClubConfig(), getWebsiteConfig()]);
  return (
    <>
      {children}
      <EventLayoutFooter club={club} config={config} />
    </>
  );
}
