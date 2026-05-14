import type { Metadata } from 'next';
import { getBlogPosts, getClubConfig, getWebsiteConfig } from '@/lib/data';
import BlogList from '@/components/blog/BlogList';

export const revalidate = 1800; // ISR: rebuild every 30 min

export async function generateMetadata(): Promise<Metadata> {
  const [club, config] = await Promise.all([getClubConfig(), getWebsiteConfig()]);
  const clubName = club.clubName ?? '';
  return {
    title: `Blogg | ${clubName}`,
    description: config?.seoDefaults?.description ?? '',
    openGraph: { title: `Blogg | ${clubName}` },
  };
}

export default async function BlogListPage() {
  const posts = await getBlogPosts(50);
  return <BlogList posts={posts} />;
}
