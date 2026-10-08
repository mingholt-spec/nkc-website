import type { Metadata } from 'next';
import { getBlogPosts, getWebsiteConfig } from '@/lib/data';
import BlogList from '@/components/blog/BlogList';
import ClientTitleOverride from '@/components/ClientTitleOverride';

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
  const [posts, config] = await Promise.all([getBlogPosts(50), getWebsiteConfig()]);
  return (
    <>
      <ClientTitleOverride enTitle="Blog" />
      <BlogList posts={posts} sidebarEnabled={config?.blogConfig?.sidebarEnabled} banners={config?.blogConfig?.banners} />
    </>
  );
}
