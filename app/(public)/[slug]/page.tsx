import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPageBySlug, getPageBySlugPreview, getWebsitePages, getWebsiteConfig, getBlogPosts, getSchedule, getSeminars } from '@/lib/data';
import { buildFAQPageSchema, buildBreadcrumbListSchema } from '@/lib/jsonLd';
import PageRenderer from '@/components/PageRenderer';
import SocialShareBar from '@/components/layout/SocialShareBar';

export const revalidate = 300; // Matchar event-sidornas cache-tid (300s) — 3600s gjorde att nypublicerat innehåll på vanliga sidor kunde dröja upp till en timme, medan events uppdaterades inom 5 min

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string>>;
};

export async function generateStaticParams() {
  try {
    const pages = await getWebsitePages();
    return pages.map(p => ({ slug: p.slug }));
  } catch { return []; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [page, config] = await Promise.all([
    getPageBySlug(slug),
    getWebsiteConfig(),
  ]);
  if (!page) return {};

  const title = page.metaTitle ?? page.title;
  const description = page.metaDescription ?? config?.seoDefaults?.description ?? '';
  const ogImage = page.ogImage ?? config?.seoDefaults?.ogImage;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: `https://www.nkc.nu/${slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.nkc.nu/${slug}`,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function PublicPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp?.preview === '1';

  const [page, config, blogPosts, schedule, seminars] = await Promise.all([
    isPreview ? getPageBySlugPreview(slug) : getPageBySlug(slug),
    getWebsiteConfig(),
    getBlogPosts(10),
    getSchedule(),
    getSeminars(),
  ]);
  if (!page) notFound();

  const faqSchema = buildFAQPageSchema(page.blocks);
  const breadcrumbSchema = buildBreadcrumbListSchema([
    { name: 'Hem', url: 'https://www.nkc.nu/' },
    { name: page.title, url: `https://www.nkc.nu/${slug}` },
  ]);

  return (
    <>
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      )}
      <PageRenderer page={page} blogPosts={blogPosts} schedule={schedule} seminars={seminars} />
      <SocialShareBar config={config} title={page.metaTitle ?? page.title} />
    </>
  );
}
