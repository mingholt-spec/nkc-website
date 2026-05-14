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
        ? (cols as unknown[]).map((col, ci) => {
            if (Array.isArray(col)) {
              return col.map((cb: unknown) => ({ type: (cb as PageBlock).type, id: (cb as PageBlock).id }));
            }
            // col is an object — show its keys and first entry
            const obj = col as Record<string, unknown>;
            const keys = Object.keys(obj);
            const firstKey = keys[0];
            const firstVal = firstKey ? obj[firstKey] : null;
            return {
              ci,
              notArray: true,
              type: typeof col,
              keys,
              firstKeyType: typeof firstVal,
              firstKeyIsArray: Array.isArray(firstVal),
              firstKeyPreview: Array.isArray(firstVal)
                ? (firstVal as unknown[]).map((b: unknown) => ({ type: (b as PageBlock).type }))
                : String(firstVal).slice(0, 80),
            };
          })
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
    theme: config?.theme ?? null,
    headerConfig: config?.headerConfig ?? null,
    footerConfig: config?.footerConfig ?? null,
    socialLinks: config?.socialLinks ?? [],
    socialDisplay: config?.socialDisplay ?? null,
    socialIconStyle: config?.socialIconStyle ?? null,
    page: page ? { slug: page.slug, title: page.title, blockCount: page.blocks?.length, blocks: blockSummary } : null,
  });
}
