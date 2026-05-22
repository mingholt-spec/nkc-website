import type { MetadataRoute } from 'next';
import { getBlogPosts, getWebsitePages } from '@/lib/data';

const BASE = 'https://nkc.nu';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/blogg`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  ];

  let pageRoutes: MetadataRoute.Sitemap = [];
  try {
    const pages = await getWebsitePages();
    pageRoutes = pages
      .filter(p => p.slug && p.isPublished && !p.isHomepage)
      .map(p => ({
        url: `${BASE}/${p.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  } catch { /* best-effort */ }

  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await getBlogPosts(500);
    blogRoutes = posts
      .filter(p => p.slug && p.category && p.isPublished)
      .map(p => ({
        url: `${BASE}/blogg/${p.category}/${p.slug}`,
        lastModified: p.updatedAt ?? p.publishedAt ?? now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
  } catch { /* best-effort */ }

  return [...staticRoutes, ...pageRoutes, ...blogRoutes];
}
