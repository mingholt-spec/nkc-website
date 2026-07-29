import type { Metadata } from 'next';
import { getBlogPosts, getWebsiteConfig } from '@/lib/data';
import BlogList from '@/components/blog/BlogList';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getWebsiteConfig();
  return {
    title: 'Blogg',
    description: config?.seoDefaults?.description ?? '',
    alternates: { canonical: 'https://www.nkc.nu/blogg' },
    openGraph: { title: 'Blogg' },
  };
}

export default async function BlogListPage() {
  const posts = await getBlogPosts(50);
  return <BlogList posts={posts} />;
}
