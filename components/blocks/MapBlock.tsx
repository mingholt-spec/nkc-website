import type { PageBlockMap } from '@/lib/types';
import { safeStr } from '@/lib/utils';
import { spacingToStyle } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS, headingSizeCls, typographyToCSS } from './blockStyle';

interface Props { block: PageBlockMap }

/** Enkel adress→embed-URL utan API-nyckel (Google Maps stödjer detta för `output=embed`). */
function buildEmbedUrl(block: PageBlockMap): string | null {
  if (block.embedUrl) return block.embedUrl;
  if (block.address) return `https://www.google.com/maps?q=${encodeURIComponent(block.address)}&output=embed`;
  return null;
}

export default function MapBlock({ block }: Props) {
  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '32px' }), ...blockStyleToCSS(block.style) };
  const typo = typographyToCSS(block.style);
  delete typo.textAlign;
  delete typo.fontSize;
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);
  const title = safeStr(block.title);
  const embedUrl = buildEmbedUrl(block);

  if (!embedUrl) return null;

  return (
    <section id={`block-${block.id}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <div className="max-w-5xl mx-auto px-6">
        {title && (
          <h2 className={`${headingSizeCls(block.titleSize, '2xl')} font-black uppercase tracking-tight mb-6 text-center text-zinc-900 dark:text-zinc-100`} style={typo}>
            {title}
          </h2>
        )}
        <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700" style={{ height: block.height || '400px' }}>
          <iframe src={embedUrl} className="w-full h-full" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={title || 'Karta'} />
        </div>
      </div>
    </section>
  );
}
