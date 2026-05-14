import type { PageBlockHtml } from '@/lib/types';
import { safeStr } from '@/lib/utils';

/**
 * Scope global CSS selectors (*, body, html, :root) to the block's wrapper div.
 * This prevents HTML blocks from resetting margins/padding on the entire page,
 * which would break Tailwind v4 utilities (they live in CSS layers and lose to
 * unlayered CSS regardless of specificity).
 */
function scopeGlobalSelectors(css: string, scope: string): string {
  return css
    .replace(/(?<![.:#\w-])\*\s*(?=[,{])/g, `.${scope} *`)
    .replace(/\bbody\s*(?=[,{])/g, `.${scope}`)
    .replace(/\bhtml\s*(?=[,{])/g, `.${scope}`)
    .replace(/\b:root\s*(?=[,{])/g, `.${scope}`);
}

function scopeStyleTags(html: string, scope: string): string {
  return html.replace(
    /<style\b([^>]*)>([\s\S]*?)<\/style>/gi,
    (_, attrs: string, css: string) =>
      `<style${attrs}>${scopeGlobalSelectors(css, scope)}</style>`
  );
}

interface Props { block: PageBlockHtml }

export default function HtmlBlock({ block }: Props) {
  const html = safeStr(block.code);
  if (!html) return null;
  // Generate a stable, CSS-safe scope class from the block id
  const scope = `hb-${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <div className={scope} dangerouslySetInnerHTML={{ __html: scopeStyleTags(html, scope) }} />
  );
}
