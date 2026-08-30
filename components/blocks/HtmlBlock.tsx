'use client';

import { useState, useEffect } from 'react';
import type { PageBlockHtml } from '@/lib/types';
import { safeStr } from '@/lib/utils';
import { spacingToStyle } from './blockSpacing';
import { blockStyleToCSS } from './blockStyle';

interface Props { block: PageBlockHtml }

/**
 * Körs FÖRST i blockets iframe, innan resten av innehållet — sätter `.dark`
 * på iframens EGEN `<html>` om sajtens ljust/mörkt-läge just nu är mörkt.
 *
 * Iframen (srcDoc, sandboxad utan allow-same-origin) är en helt separat,
 * cross-origin-dokument-instans. Sajtens `.dark`-klass sitter på FÖRÄLDRA-
 * sidans `<html>`, som ALDRIG är en förfader till något inuti iframen — så
 * AI-genererade block som skriver `.dark <selektor>`-CSS (ett vanligt,
 * rimligt mönster att skriva) kan aldrig matcha något, oavsett hur korrekt
 * koden annars är. Det är roten till att mörkt läge "funkar ibland, går
 * sen fel igen" — inte ett fel i det AI genererar, utan att iframens egen
 * `.dark`-klass aldrig sätts av något. Detta löser det generellt, för alla
 * nuvarande och framtida AI-genererade block, utan att behöva ändra det
 * genererade innehållet i sig.
 */
function darkModeScript(isDark: boolean): string {
  return `<script>if(${isDark})document.documentElement.classList.add('dark');</script>`;
}

// Fixed height, NOT dynamically resized. AI-generated blocks often use
// scroll-triggered libraries (AOS) that calculate element visibility against
// the iframe's viewport size at load — starting small and growing the iframe
// afterward leaves everything below the initial small viewport permanently
// marked "not yet scrolled into view" (invisible), since nothing ever fires a
// real scroll event inside the iframe to re-trigger AOS. The section scrolls
// inside the iframe instead, which doesn't have that problem.
export default function HtmlBlock({ block }: Props) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains('dark'));
    const observer = new MutationObserver(() => setIsDark(root.classList.contains('dark')));
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const rawHtml = safeStr(block.code);
  if (!rawHtml) return null;
  const html = darkModeScript(isDark) + rawHtml;

  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '0px', y: '0px' }), ...blockStyleToCSS(block.style) };

  return (
    <div style={{ position: 'relative', zIndex: 0, ...sectionStyle }}>
      <iframe
        srcDoc={html}
        sandbox="allow-scripts allow-top-navigation-by-user-activation"
        style={{ width: '100%', height: 800, border: 'none', display: 'block' }}
        title="Innehållsblock"
      />
    </div>
  );
}
