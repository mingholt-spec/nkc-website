import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPageBySlug, getPageBySlugPreview, getWebsitePages, getClubConfig, getWebsiteConfig } from '@/lib/data';
import PageRenderer from '@/components/PageRenderer';
import SocialShareBar from '@/components/layout/SocialShareBar';

export const revalidate = 3600;

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
  const [page, club, config] = await Promise.all([
    getPageBySlug(slug),
    getClubConfig(),
    getWebsiteConfig(),
  ]);
  if (!page) return {};

  const title = page.metaTitle ?? page.title;
  const description = page.metaDescription ?? config?.seoDefaults?.description ?? '';
  const clubName = club.clubName ?? '';
  const ogImage = page.ogImage ?? config?.seoDefaults?.ogImage;

  return {
    title: `${title} | ${clubName}`,
    description,
    openGraph: { title, description, ...(ogImage ? { images: [ogImage] } : {}) },
  };
}

export default async function PublicPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp?.preview === '1';

  const [page, config] = await Promise.all([
    isPreview ? getPageBySlugPreview(slug) : getPageBySlug(slug),
    getWebsiteConfig(),
  ]);
  if (!page) notFound();
  return (
    <>
      <PageRenderer page={page} />
      <SocialShareBar config={config} title={page.metaTitle ?? page.title} />
    </>
  );
}
