import { NextResponse } from 'next/server';
import { getHomepage, getClubConfig, getWebsiteConfig, getBlogPosts } from '@/lib/data';
import type { PageBlock } from '@/lib/types';

// Temporary debug endpoint — remove before going live on nkc.nu
export async function GET() {
  const [page, club, config, posts] = await Promise.all([
    getHomepage(), getClubConfig(), getWebsiteConfig(), getBlogPosts(3),
  ]);

  const blockSummary = (page?.blocks ?? []).map((b, i) => {
    const raw = b as Record<string, unknown>;
    const extra: Record<string, unknown> = {};
    if (b.type === 'columns') {
      const cols = raw.columns;
      extra.columnsIsArray = Array.isArray(cols);
      extra.columnsLength = Array.isArray(cols) ? (cols as unknown[]).length : null;
      extra.columnsPreview = Array.isArray(cols)
        ? (cols as unknown[]).map((col) => {
            const blocks = Array.isArray(col)
              ? col
              : ((col as Record<string, unknown>).blocks as unknown[] ?? []);
            return (blocks as PageBlock[]).map(cb => ({
              type: cb.type,
              id: cb.id,
              src: (cb as Record<string, unknown>).src,
              url: (cb as Record<string, unknown>).url,
            }));
          })
        : typeof cols;
    }
    return {
      index: i, type: b.type, id: b.id,
      codePreview: String(raw.code ?? '').slice(0, 80),
      ...extra,
    };
  });

  return NextResponse.json({
    club: { clubName: club.clubName },
    theme: config?.theme ?? null,
    headerConfig: config?.headerConfig ?? null,
    blogPostCount: posts.length,
    blogPostSample: posts.slice(0, 2).map(p => ({ id: p.id, title: p.title, hasExcerpt: !!p.excerpt, contentLength: p.content?.length })),
    page: page ? { slug: page.slug, blockCount: page.blocks?.length, blocks: blockSummary } : null,
  });
}
