import { db } from './firebase-admin';
import type { NewsPost, WebsitePage, Campaign, WebsiteConfig, ClubConfig, UpcomingClassPreview, UpcomingSeminarPreview } from './types';
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
    if (!snap.empty) return snap.docs.map(d => docToNewsPost(d.id, d.data() as Record<string, unknown>));
    // Fallback: some posts may not have publishedAt — try createdAt
    const fallback = await db.collection('news')
      .where('isPublished', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();
    return fallback.docs.map(d => docToNewsPost(d.id, d.data() as Record<string, unknown>));
  } catch {
    // Composite index may be missing — last resort: fetch without ordering
    try {
      const snap = await db!.collection('news').where('isPublished', '==', true).limit(limitCount).get();
      return snap.docs.map(d => docToNewsPost(d.id, d.data() as Record<string, unknown>));
    } catch { return []; }
  }
});

// ── Schedule ──

/**
 * Upcoming, publicly-relevant classes for the page builder's live Schedule
 * block — excludes seminars and private sessions (one-off/closed events,
 * not "how we train every week"). `schedule` is publicly readable in
 * Firestore rules, so this needs no special auth handling. Mirrors
 * bjj-premium/api/data.ts's loadUpcomingSchedule.
 */
export const getSchedule = cache(async (daysAhead = 7): Promise<UpcomingClassPreview[]> => {
  if (!db) return [];
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const endDate = new Date(today);
    // Both ends of the range are inclusive, so `daysAhead - 1` gives exactly
    // `daysAhead` distinct calendar dates — without the -1 this spans one
    // extra date, wrapping back onto today's own weekday a second time.
    endDate.setDate(endDate.getDate() + Math.max(0, daysAhead - 1));
    const endStr = endDate.toISOString().split('T')[0];

    const snap = await db.collection('schedule')
      .where('date', '>=', todayStr)
      .where('date', '<=', endStr)
      .get();

    return snap.docs
      .map(d => d.data() as Record<string, unknown>)
      .filter(c => !c.isSeminar && !c.isPrivate)
      .map(c => ({
        id: String(c.id ?? ''),
        date: String(c.date ?? ''),
        time: String(c.time ?? ''),
        endTime: c.endTime ? String(c.endTime) : undefined,
        name: String(c.name ?? ''),
        instructor: c.instructor ? String(c.instructor) : undefined,
      }))
      .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));
  } catch {
    return [];
  }
});

/**
 * Upcoming seminars/events (`schedule` docs with `isSeminar: true`) for the
 * Schedule block's "Kommande seminarier" section. Mirrors bjj-premium's
 * api/data.ts's loadUpcomingSeminars — a date-range-only query (isSeminar
 * filtered in JS, avoids needing a composite Firestore index), joined to the
 * publicly-readable `campaigns` collection by eventDetails.classId to attach
 * a public /event/{slug} link when the seminar came from a campaign.
 */
export const getSeminars = cache(async (daysAhead = 90): Promise<UpcomingSeminarPreview[]> => {
  if (!db) return [];
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + Math.max(0, daysAhead - 1));
    const endStr = endDate.toISOString().split('T')[0];

    const [scheduleSnap, campaignsSnap] = await Promise.all([
      db.collection('schedule').where('date', '>=', todayStr).where('date', '<=', endStr).get(),
      db.collection('campaigns').get(),
    ]);

    const slugByClassId = new Map<string, string>();
    campaignsSnap.docs.forEach(d => {
      const data = d.data() as Record<string, unknown>;
      const eventDetails = data.eventDetails as Record<string, unknown> | undefined;
      const classId = eventDetails?.classId as string | undefined;
      const slug = data.slug as string | undefined;
      if (classId && slug) slugByClassId.set(classId, slug);
    });

    return scheduleSnap.docs
      .map(d => ({ docId: d.id, data: d.data() as Record<string, unknown> }))
      .filter(({ data: c }) => Boolean(c.isSeminar))
      .map(({ docId, data: c }) => ({
        id: String(c.id ?? docId),
        date: String(c.date ?? ''),
        time: String(c.time ?? ''),
        endTime: c.endTime ? String(c.endTime) : undefined,
        name: String(c.name ?? ''),
        instructor: c.instructor ? String(c.instructor) : undefined,
        description: c.description ? String(c.description) : undefined,
        shareImage: c.shareImage ? String(c.shareImage) : undefined,
        campaignSlug: slugByClassId.get(docId),
      }))
      .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));
  } catch {
    return [];
  }
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

// Used for admin preview of unpublished pages (?preview=1).
// Does not filter by isPublished so drafts are visible.
export async function getPageBySlugPreview(slug: string): Promise<WebsitePage | null> {
  if (!db) return null;
  try {
    const snap = await db.collection('website_pages')
      .where('slug', '==', slug)
      .limit(1)
      .get();
    return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as WebsitePage);
  } catch { return null; }
}

export const getHomepage = cache(async (): Promise<WebsitePage | null> => {
  // Reuse getWebsitePages() which uses a single-field query (no composite index needed).
  // Sorting and filtering in JavaScript avoids the Firestore composite index requirement
  // for isPublished+sortOrder that previously caused a silent error and returned null.
  const pages = await getWebsitePages();
  if (!pages.length) return null;
  const marked = pages.find(p => p.isHomepage);
  if (marked) return marked;
  return pages.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0] ?? null;
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
