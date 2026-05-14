import Link from 'next/link';
import type { PageBlockHero } from '@/lib/types';
import { safeStr } from '@/lib/utils';

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

  return (
    <section
      className={`relative flex flex-col justify-center ${height} px-6 py-16 overflow-hidden`}
      style={{ backgroundColor: bgColor, backgroundImage: bgImage ? `url(${bgImage})` : undefined, backgroundSize: 'cover', backgroundPosition: bgPos }}
    >
      {bgImage && <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlay})` }} />}
      <div className={`relative z-10 mx-auto w-full max-w-4xl flex flex-col gap-4 ${align}`}>
        {title && (
          <h1 className="font-bold leading-tight" style={{ color: titleColor, fontSize: titleFontSize(safeStr(block.titleSize)) }}>
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-lg md:text-xl max-w-2xl" style={{ color: subtitleColor }}>{subtitle}</p>
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
