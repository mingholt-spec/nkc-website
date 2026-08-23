import Link from 'next/link';
import { useRef } from 'react';
import type { PageBlockCta } from '@/lib/types';
import { spacingToStyle, hasSpacing } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS, headlineStyleToCSS, typographyToCSS, type HeadlineStyle } from './blockStyle';
import { useResponsiveOutline } from './useResponsiveOutline';

interface Props { block: PageBlockCta }
export default function CtaBlock({ block }: Props) {
  const hasCustomPadding = hasSpacing(block.padding);
  const sectionStyle = {
    backgroundColor: block.backgroundColor ?? '#18181b',
    backgroundImage: block.backgroundImage ? `url(${block.backgroundImage})` : undefined,
    backgroundSize: 'cover', backgroundPosition: 'center',
    ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '64px' }),
    ...blockStyleToCSS(block.style),
  };

  const align = block.style?.textAlign ?? 'center';
  const alignClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  const titleStyle: HeadlineStyle = { color: '#fff', ...headlineStyleToCSS(block.style, 'title') };
  const typo = typographyToCSS(block.style);
  delete typo.textAlign; // handled by alignClass
  delete typo.fontSize;  // title keeps its fixed text-3xl size
  Object.assign(titleStyle, typo);

  const subtitleStyle: HeadlineStyle = { ...headlineStyleToCSS(block.style, 'subtitle') };

  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  useResponsiveOutline(titleRef, titleStyle.textShadow as string, titleStyle._mobileTextShadow);
  useResponsiveOutline(subtitleRef, subtitleStyle.textShadow as string, subtitleStyle._mobileTextShadow);

  const { _mobileTextShadow: _mt, ...cleanTitleStyle } = titleStyle;
  const { _mobileTextShadow: _ms, ...cleanSubtitleStyle } = subtitleStyle;
  void _mt; void _ms;
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);

  return (
    <section
      id={`block-${block.id}`}
      className={`relative ${hasCustomPadding ? '' : 'px-6 py-16'} ${alignClass}`}
      style={sectionStyle}
    >
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      {block.backgroundImage && <div className="absolute inset-0 bg-black/50" />}
      <div className="relative z-10 mx-auto max-w-2xl">
        <h2 ref={titleRef} className="text-3xl font-bold" style={cleanTitleStyle}>{block.title}</h2>
        {block.subtitle && <p ref={subtitleRef} className="mt-3 text-lg text-white/80" style={cleanSubtitleStyle}>{block.subtitle}</p>}
        <Link href={block.buttonUrl} className="mt-6 inline-block px-8 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
          {block.buttonText}
        </Link>
      </div>
    </section>
  );
}
