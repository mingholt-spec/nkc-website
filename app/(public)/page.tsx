import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getHomepage, getClubConfig, getWebsiteConfig } from '@/lib/data';
import PageRenderer from '@/components/PageRenderer';

export const revalidate = 3600; // ISR: rebuild at most every hour

export async function generateMetadata(): Promise<Metadata> {
  const [page, club, config] = await Promise.all([getHomepage(), getClubConfig(), getWebsiteConfig()]);
  const title = page?.metaTitle ?? config?.seoDefaults?.title ?? club.clubName ?? '';
  const description = page?.metaDescription ?? config?.seoDefaults?.description ?? '';
  const ogImage = page?.ogImage ?? config?.seoDefaults?.ogImage;

  return {
    title: { absolute: title },
    description,
    openGraph: { title, description, ...(ogImage ? { images: [ogImage] } : {}) },
  };
}

export default async function HomePage() {
  const page = await getHomepage();
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
