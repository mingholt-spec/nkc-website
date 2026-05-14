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

/** Inject a dark-mode override block for AI-generated CSS variables. */
function injectDarkOverrides(html: string, scope: string): string {
  // Find any class names matching the ai-*-wrapper pattern used by AI blocks
  const matches = [...html.matchAll(/\.(ai-[\w-]+)\s*\{/g)].map(m => m[1]);
  const classes = [...new Set(matches)];
  if (classes.length === 0) return html;

  // Build selectors with specificity 0-3-0, beating the block's own 0-1-0 rule
  const selectors = classes.map(c => `.dark .${scope} .${c}`).join(',\n');
  const darkStyle = `<style>
${selectors} {
  --ai-bg: #18181b !important;
  --ai-text-primary: #fafafa !important;
  --ai-text-secondary: #71717a !important;
  --ai-border: rgba(255,255,255,0.08) !important;
  --ai-card-bg: #27272a !important;
  --ai-card-border: rgba(255,255,255,0.08) !important;
  --ai-input-bg: #27272a !important;
  --ai-badge-bg: rgba(229,4,1,0.2) !important;
}
</style>`;
  return html + darkStyle;
}

interface Props { block: PageBlockHtml }

export default function HtmlBlock({ block }: Props) {
  const html = safeStr(block.code);
  if (!html) return null;
  const scope = `hb-${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;
  const processed = injectDarkOverrides(scopeStyleTags(html, scope), scope);
  return (
    <div className={scope} dangerouslySetInnerHTML={{ __html: processed }} />
  );
}
