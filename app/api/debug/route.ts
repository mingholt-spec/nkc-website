import { NextResponse } from 'next/server';
import { getHomepage, getClubConfig, getWebsiteConfig } from '@/lib/data';

// Temporary debug endpoint — remove before going live on nkc.nu
export async function GET() {
  const [page, club, config] = await Promise.all([getHomepage(), getClubConfig(), getWebsiteConfig()]);

  const blockSummary = (page?.blocks ?? []).map((b, i) => ({
    index: i,
    type: b.type,
    id: b.id,
    codeType: typeof (b as Record<string, unknown>).code,
    codePreview: String((b as Record<string, unknown>).code ?? '').slice(0, 100),
  }));

  return NextResponse.json({
    club: { clubName: club.clubName, logoUrl: club.logoUrl },
    hasWebsiteConfig: !!config,
    navCount: config?.navigation?.length ?? 0,
    page: page ? { slug: page.slug, title: page.title, blockCount: page.blocks?.length, blocks: blockSummary } : null,
  });
}
