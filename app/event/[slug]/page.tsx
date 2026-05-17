import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCampaignBySlug, getClubConfig } from '@/lib/data';
import EventPage from '@/components/events/EventPage';

export const revalidate = 300; // Events change often (registrations) — rebuild every 5 min

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [campaign, club] = await Promise.all([getCampaignBySlug(slug), getClubConfig()]);
  if (!campaign) return {};

  const title = campaign.pageConfig.metaTitle ?? campaign.pageConfig.title;
  const description = campaign.pageConfig.metaDescription ?? campaign.pageConfig.description ?? '';
  const clubName = club.clubName ?? '';
  const ogImage = campaign.shareImage ?? campaign.pageConfig.headerImage;

  return {
    title,  // template in root layout adds "| clubName" automatically
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: `https://www.nkc.nu/event/${slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.nkc.nu/event/${slug}`,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function CampaignPage({ params }: Props) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) notFound();
  return <EventPage campaign={campaign} />;
}
