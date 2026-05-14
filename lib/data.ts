import { db } from './firebase-admin';
import type { NewsPost, WebsitePage, Campaign, WebsiteConfig, ClubConfig } from './types';
import { cache } from 'react';

// ── Helpers ──

function toISOString(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === 'string') { try { return new Date(val).toISOString(); } catch { return null; } }
  const v = val as Record<string, unknown>;
  if (typeof v.toDate === 'function') { try { return (v.toDate as () => Date)().toISOString(); } catch { return null; } }
  if (typeof v.seconds === 'number') { try { return new Date(v.seconds * 1000).toISOString(); } catch { return null; } }
  return null;
}

function docToNewsPost(id: string, data: Record<string, unknown>): NewsPost {
  return {
    id,
    title: (data.title as string) ?? '',
    content: (data.content as string) ?? '',
    authorId: (data.authorId as string) ?? '',
    author: data.author as string | undefined,
    createdAt: toISOString(data.createdAt) ?? new Date().toISOString(),
    publishedAt: toISOString(data.publishedAt) ?? undefined,
    updatedAt: toISOString(data.updatedAt) ?? undefined,
    isPinned: Boolean(data.isPinned),
    coverImage: data.coverImage as string | undefined,
    coverImagePosition: data.coverImagePosition as string | undefined,
    coverImageHeight: data.coverImageHeight as NewsPost['coverImageHeight'],
    excerpt: data.excerpt as string | undefined,
    slug: data.slug as string | undefined,
    isPublished: Boolean(data.isPublished),
    tags: (data.tags as string[]) ?? [],
    category: data.category as string | undefined,
    fontSize: data.fontSize as NewsPost['fontSize'],
    showBanners: data.showBanners as boolean | undefined,
    metaTitle: data.metaTitle as string | undefined,
    metaDescription: data.metaDescription as string | undefined,
    titleEn: data.titleEn as string | undefined,
    contentEn: data.contentEn as string | undefined,
    excerptEn: data.excerptEn as string | undefined,
  };
}

// ── Global config ──

export const getClubConfig = cache(async (): Promise<ClubConfig> => {
  if (!db) return {};
  try {
    const snap = await db.collection('config').doc('club').get();
    return (snap.data() ?? {}) as ClubConfig;
  } catch { return {}; }
});

export const getWebsiteConfig = cache(async (): Promise<WebsiteConfig | null> => {
  if (!db) return null;
  try {
    const snap = await db.collection('config').doc('website').get();
    return snap.exists ? (snap.data() as WebsiteConfig) : null;
  } catch { return null; }
});

export const getWebsitePages = cache(async (): Promise<WebsitePage[]> => {
  if (!db) return [];
  try {
    const snap = await db.collection('website_pages').where('isPublished', '==', true).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as WebsitePage));
  } catch { return []; }
});

// ── Blog ──

export const getBlogPosts = cache(async (limitCount = 50): Promise<NewsPost[]> => {
  if (!db) return [];
  try {
    const snap = await db.collection('news')
      .where('isPublished', '==', true)
      .orderBy('publishedAt', 'desc')
      .limit(limitCount)
      .get();
    return snap.docs.map(d => docToNewsPost(d.id, d.data() as Record<string, unknown>));
  } catch { return []; }
});

export const getBlogPostBySlug = cache(async (slug: string): Promise<NewsPost | null> => {
  if (!db) return null;
  try {
    const snap = await db.collection('news')
      .where('slug', '==', slug)
      .where('isPublished', '==', true)
      .limit(1)
      .get();
    if (!snap.empty) return docToNewsPost(snap.docs[0].id, snap.docs[0].data() as Record<string, unknown>);

    const doc = await db.collection('news').doc(slug).get();
    if (doc.exists && (doc.data() as Record<string, unknown>).isPublished) {
      return docToNewsPost(doc.id, doc.data() as Record<string, unknown>);
    }
    return null;
  } catch { return null; }
});

// ── Pages ──

export const getPageBySlug = cache(async (slug: string): Promise<WebsitePage | null> => {
  if (!db) return null;
  try {
    const snap = await db.collection('website_pages')
      .where('slug', '==', slug)
      .where('isPublished', '==', true)
      .limit(1)
      .get();
    return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as WebsitePage);
  } catch { return null; }
});

export const getHomepage = cache(async (): Promise<WebsitePage | null> => {
  if (!db) return null;
  try {
    // First try isHomepage flag
    const snap = await db.collection('website_pages')
      .where('isHomepage', '==', true)
      .where('isPublished', '==', true)
      .limit(1)
      .get();
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() } as WebsitePage;

    // Fallback: first published page ordered by sortOrder
    const fallback = await db.collection('website_pages')
      .where('isPublished', '==', true)
      .orderBy('sortOrder', 'asc')
      .limit(1)
      .get();
    return fallback.empty ? null : ({ id: fallback.docs[0].id, ...fallback.docs[0].data() } as WebsitePage);
  } catch { return null; }
});

// ── Campaigns / Events ──

export const getCampaignBySlug = cache(async (slug: string): Promise<Campaign | null> => {
  if (!db) return null;
  try {
    const snap = await db.collection('campaigns').where('slug', '==', slug).limit(1).get();
    return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Campaign);
  } catch { return null; }
});

// ── Sitemap helpers ──

export async function getAllPublishedSlugs(): Promise<{
  pages: string[];
  posts: { slug: string; category?: string; updatedAt?: string }[];
  events: string[];
}> {
  if (!db) return { pages: [], posts: [], events: [] };
  try {
    const [pagesSnap, postsSnap, campaignsSnap] = await Promise.all([
      db.collection('website_pages').where('isPublished', '==', true).get(),
      db.collection('news').where('isPublished', '==', true).get(),
      db.collection('campaigns').get(),
    ]);
    return {
      pages: pagesSnap.docs.map(d => (d.data() as Record<string, unknown>).slug as string).filter(Boolean),
      posts: postsSnap.docs.map(d => {
        const data = d.data() as Record<string, unknown>;
        return {
          slug: (data.slug ?? d.id) as string,
          category: data.category as string | undefined,
          updatedAt: toISOString(data.updatedAt ?? data.publishedAt) ?? undefined,
        };
      }),
      events: campaignsSnap.docs.map(d => (d.data() as Record<string, unknown>).slug as string).filter(Boolean),
    };
  } catch { return { pages: [], posts: [], events: [] }; }
}
