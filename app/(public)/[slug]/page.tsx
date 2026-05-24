import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPageBySlug, getWebsitePages, getClubConfig, getWebsiteConfig } from '@/lib/data';
import PageRenderer from '@/components/PageRenderer';
import SocialShareBar from '@/components/layout/SocialShareBar';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

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

export default async function PublicPage({ params }: Props) {
  const { slug } = await params;
  const [page, config] = await Promise.all([getPageBySlug(slug), getWebsiteConfig()]);
  if (!page) notFound();
  return (
    <>
      <PageRenderer page={page} />
      <SocialShareBar config={config} title={page.metaTitle ?? page.title} />
    </>
  );
}
