import type { PageBlockText } from '@/lib/types';
import { safeStr, normalizeLinks } from '@/lib/utils';
import { spacingToStyle, hasSpacing } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS, headlineStyleToCSS, typographyToCSS } from './blockStyle';

interface Props { block: PageBlockText }

export default function TextBlock({ block }: Props) {
  const html = safeStr(block.content);
  if (!html) return null;
  const align = safeStr(block.style?.textAlign) as 'left' | 'center' | 'right' | '';
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : '';

  const sectionStyle = {
    ...spacingToStyle(block.spacing, undefined, { x: '24px', y: '16px' }),
    ...blockStyleToCSS(block.style),
  };
  const hasCustomPadding = hasSpacing(block.spacing);
  const hStyle = headlineStyleToCSS(block.style);
  const typo = typographyToCSS(block.style);
  delete typo.textAlign; // handled by alignClass
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);

  return (
    <div id={`block-${block.id}`} className={`${hasCustomPadding ? '' : 'px-6 py-4'} ${alignClass}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <div
        className="prose prose-zinc dark:prose-invert max-w-none"
        style={{ fontFamily: 'var(--font-raleway, var(--font-inter)), system-ui, sans-serif', ...hStyle, ...typo }}
        dangerouslySetInnerHTML={{ __html: normalizeLinks(html) }}
      />
    </div>
  );
}
