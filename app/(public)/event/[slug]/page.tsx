import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCampaignBySlug, getClubConfig } from '@/lib/data';
import { buildEventSchema, buildFAQPageSchema, buildBreadcrumbListSchema } from '@/lib/jsonLd';
import EventPage from '@/components/events/EventPage';

export const revalidate = 300; // Events uppdateras ofta (anmälningar)

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) return {};

  const title = campaign.pageConfig.metaTitle ?? campaign.pageConfig.title;
  const description = campaign.pageConfig.metaDescription ?? campaign.pageConfig.description ?? '';
  const ogImage = campaign.shareImage ?? campaign.pageConfig.headerImage;

  return {
    title,
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
  const [campaign, club] = await Promise.all([getCampaignBySlug(slug), getClubConfig()]);
  if (!campaign) notFound();

  const canonicalUrl = `https://www.nkc.nu/event/${slug}`;
  const eventSchema = buildEventSchema(campaign, canonicalUrl, club);
  const faqSchema = buildFAQPageSchema(campaign.contentBlocks);
  const breadcrumbSchema = buildBreadcrumbListSchema([
    { name: 'Hem', url: 'https://www.nkc.nu/' },
    { name: campaign.pageConfig.title, url: canonicalUrl },
  ]);

  return (
    <>
      {eventSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />
      )}
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      )}
      <EventPage campaign={campaign} />
    </>
  );
}
