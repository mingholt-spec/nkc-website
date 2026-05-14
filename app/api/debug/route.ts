import { NextResponse } from 'next/server';
import { getHomepage, getClubConfig, getWebsiteConfig } from '@/lib/data';
import type { PageBlock } from '@/lib/types';

// Temporary debug endpoint — remove before going live on nkc.nu
export async function GET() {
  const [page, club, config] = await Promise.all([getHomepage(), getClubConfig(), getWebsiteConfig()]);

  const blockSummary = (page?.blocks ?? []).map((b, i) => {
    const raw = b as Record<string, unknown>;
    const extra: Record<string, unknown> = {};
    if (b.type === 'columns') {
      const cols = raw.columns;
      extra.columnsIsArray = Array.isArray(cols);
      extra.columnsLength = Array.isArray(cols) ? cols.length : null;
      extra.columnsPreview = Array.isArray(cols)
        ? (cols as unknown[][]).map((col, ci) => Array.isArray(col)
            ? col.map((cb: unknown) => ({ type: (cb as PageBlock).type, id: (cb as PageBlock).id }))
            : { ci, notArray: true, type: typeof col }
          )
        : typeof cols;
    }
    return {
      index: i,
      type: b.type,
      id: b.id,
      codeType: typeof raw.code,
      codePreview: String(raw.code ?? '').slice(0, 80),
      ...extra,
    };
  });

  return NextResponse.json({
    club: { clubName: club.clubName, logoUrl: club.logoUrl },
    hasWebsiteConfig: !!config,
    navCount: config?.navigation?.length ?? 0,
    page: page ? { slug: page.slug, title: page.title, blockCount: page.blocks?.length, blocks: blockSummary } : null,
  });
}
