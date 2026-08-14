'use client';

import type { PageBlockHtml } from '@/lib/types';
import { safeStr } from '@/lib/utils';

interface Props { block: PageBlockHtml }

// Fixed height, NOT dynamically resized. AI-generated blocks often use
// scroll-triggered libraries (AOS) that calculate element visibility against
// the iframe's viewport size at load — starting small and growing the iframe
// afterward leaves everything below the initial small viewport permanently
// marked "not yet scrolled into view" (invisible), since nothing ever fires a
// real scroll event inside the iframe to re-trigger AOS. The section scrolls
// inside the iframe instead, which doesn't have that problem.
export default function HtmlBlock({ block }: Props) {
  const html = safeStr(block.code);
  if (!html) return null;

  return (
    <div style={{ position: 'relative', zIndex: 0 }}>
      <iframe
        srcDoc={html}
        sandbox="allow-scripts"
        style={{ width: '100%', height: 800, border: 'none', display: 'block' }}
        title="Innehållsblock"
      />
    </div>
  );
}
