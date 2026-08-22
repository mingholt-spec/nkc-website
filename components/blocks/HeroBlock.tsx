import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import type { PageBlockHero } from '@/lib/types';
import { safeStr } from '@/lib/utils';
import { spacingToStyle, hasSpacing } from './blockSpacing';
import { blockStyleToCSS, headlineStyleToCSS, typographyToCSS, type HeadlineStyle } from './blockStyle';
import { useResponsiveOutline } from './useResponsiveOutline';

interface Props { block: PageBlockHero }

const heightMap: Record<string, string> = { sm: 'min-h-[40vh]', md: 'min-h-[60vh]', lg: 'min-h-[80vh]', full: 'min-h-screen' };
const alignMap: Record<string, string> = { left: 'items-start text-left', center: 'items-center text-center', right: 'items-end text-right' };

export default function HeroBlock({ block }: Props) {
  const height = heightMap[safeStr(block.height, 'md')] ?? 'min-h-[60vh]';
  const align = alignMap[safeStr(block.textAlign, 'center')] ?? 'items-center text-center';
  const overlay = typeof block.backgroundOverlay === 'number' ? block.backgroundOverlay : 0.4;
  const title = safeStr(block.title);
  const subtitle = safeStr(block.subtitle);
  const ctaText = safeStr(block.ctaText);
  const ctaUrl = safeStr(block.ctaUrl);
  const secondaryCtaText = safeStr(block.secondaryCtaText);
  const secondaryCtaUrl = safeStr(block.secondaryCtaUrl);
  const bgImage = safeStr(block.backgroundImage);
  const bgPos = safeStr(block.backgroundPosition, 'center');
  const titleColor = safeStr(block.titleColor, '#fff');
  const subtitleColor = safeStr(block.subtitleColor, 'rgba(255,255,255,0.85)');
  const ctaColor = safeStr(block.ctaColor, '#dc2626');
  const bgColor = safeStr(block.style?.backgroundColor, '#18181b');

  const sectionStyle = {
    backgroundColor: bgColor,
    ...spacingToStyle(block.spacing, undefined, { x: '24px', y: '64px' }),
    ...blockStyleToCSS(block.style),
  };
  const hasCustomPadding = hasSpacing(block.spacing);

  const titleStyle: HeadlineStyle = { color: titleColor, ...headlineStyleToCSS(block.style, 'title') };
  const typo = typographyToCSS(block.style);
  delete typo.textAlign; // hero uses textAlign prop for layout, not typography.textAlign
  delete typo.fontSize;  // hero uses its own titleFontSize map
  Object.assign(titleStyle, typo);

  const subtitleStyle: HeadlineStyle = { color: subtitleColor, ...headlineStyleToCSS(block.style, 'subtitle') };

  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  useResponsiveOutline(titleRef, titleStyle.textShadow as string, titleStyle._mobileTextShadow);
  useResponsiveOutline(subtitleRef, subtitleStyle.textShadow as string, subtitleStyle._mobileTextShadow);

  const { _mobileTextShadow: _mt, ...cleanTitleStyle } = titleStyle;
  const { _mobileTextShadow: _ms, ...cleanSubtitleStyle } = subtitleStyle;
  void _mt; void _ms;

  return (
    <section
      className={`relative flex flex-col justify-center ${height} ${hasCustomPadding ? '' : 'px-6 py-16'} overflow-hidden`}
      style={sectionStyle}
    >
      {bgImage && (
        <Image
          src={bgImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: bgPos }}
        />
      )}
      {bgImage && <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlay})` }} />}
      <div className={`relative z-10 mx-auto w-full max-w-4xl flex flex-col gap-4 ${align}`}>
        {title && (
          <h1 ref={titleRef} className="font-bold leading-tight" style={{ ...cleanTitleStyle, fontSize: titleFontSize(safeStr(block.titleSize)) }}>
            {title}
          </h1>
        )}
        {subtitle && (
          <p ref={subtitleRef} className="text-lg md:text-xl max-w-2xl" style={cleanSubtitleStyle}>{subtitle}</p>
        )}
        {ctaText && ctaUrl && (
          <div className="flex flex-wrap gap-3 mt-2">
            <Link href={ctaUrl} className="px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: ctaColor }}>
              {ctaText}
            </Link>
            {secondaryCtaText && secondaryCtaUrl && (
              <Link href={secondaryCtaUrl} className="px-6 py-3 rounded-lg font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors">
                {secondaryCtaText}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function titleFontSize(size: string): string {
  const map: Record<string, string> = { xs: '1.5rem', sm: '2rem', base: '2.5rem', lg: '3rem', xl: '3.75rem', '2xl': '4.5rem', '3xl': '6rem', '4xl': '8rem' };
  return map[size] ?? '3.75rem';
}
