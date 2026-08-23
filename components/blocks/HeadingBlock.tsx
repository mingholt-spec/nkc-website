import type { PageBlockHeading } from '@/lib/types';
import { safeStr } from '@/lib/utils';
import { spacingToStyle, hasSpacing } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS, headlineStyleToCSS, typographyToCSS } from './blockStyle';

interface Props { block: PageBlockHeading }
const sizeMap: Record<string, string> = { xs: 'text-lg', sm: 'text-xl', base: 'text-2xl', lg: 'text-3xl', xl: 'text-4xl', '2xl': 'text-5xl', '3xl': 'text-6xl', '4xl': 'text-7xl' };

export default function HeadingBlock({ block }: Props) {
  const text = safeStr(block.text);
  const effectiveSize = block.style?.fontSize ?? block.size;
  const sizeClass = sizeMap[safeStr(effectiveSize, 'xl')] ?? 'text-4xl';
  const level = typeof block.level === 'number' ? block.level : 2;
  const align = (block.style?.textAlign ?? safeStr(block.align, 'left')) as 'left' | 'center' | 'right';
  const color = safeStr(block.color);
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  const sectionStyle = {
    ...spacingToStyle(block.spacing, undefined, { x: '24px', y: '16px' }),
    ...blockStyleToCSS(block.style),
    textAlign: align,
  };
  const hasCustomPadding = hasSpacing(block.spacing);

  const { _mobileTextShadow: _mt, ...headingStyle } = headlineStyleToCSS(block.style);
  void _mt;
  if (color && !headingStyle.color) headingStyle.color = color;
  const typo = typographyToCSS(block.style);
  delete typo.textAlign; // handled by sectionStyle
  delete typo.fontSize;  // handled by sizeClass
  Object.assign(headingStyle, typo);
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);

  return (
    <div id={`block-${block.id}`} className={`mx-auto max-w-4xl ${hasCustomPadding ? '' : 'px-6 py-4'}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <Tag className={`font-bold ${sizeClass}`} style={headingStyle}>{text}</Tag>
    </div>
  );
}
