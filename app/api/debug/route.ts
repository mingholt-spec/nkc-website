import { NextResponse } from 'next/server';
import { getHomepage } from '@/lib/data';

// Temporary debug endpoint — remove before going live on nkc.nu
export async function GET() {
  const page = await getHomepage();
  if (!page) return NextResponse.json({ error: 'No homepage found' });

  const blockSummary = (page.blocks ?? []).map((b, i) => ({
    index: i,
    type: b.type,
    id: b.id,
    contentType: typeof (b as Record<string, unknown>).content,
    contentPreview: String((b as Record<string, unknown>).content ?? '').slice(0, 100),
  }));

  return NextResponse.json({ slug: page.slug, title: page.title, blockCount: page.blocks?.length, blocks: blockSummary });
}
