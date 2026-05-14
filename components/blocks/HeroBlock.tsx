import Link from 'next/link';
import type { PageBlockHero } from '@/lib/types';

interface Props { block: PageBlockHero }

const heightMap = { sm: 'min-h-[40vh]', md: 'min-h-[60vh]', lg: 'min-h-[80vh]', full: 'min-h-screen' };
const alignMap = { left: 'items-start text-left', center: 'items-center text-center', right: 'items-end text-right' };

export default function HeroBlock({ block }: Props) {
  const height = heightMap[block.height ?? 'md'];
  const align = alignMap[block.textAlign ?? 'center'];
  const overlay = block.backgroundOverlay ?? 0.4;

  return (
    <section
      className={`relative flex flex-col justify-center ${height} px-6 py-16 overflow-hidden`}
      style={{
        backgroundColor: block.style?.backgroundColor ?? '#18181b',
        backgroundImage: block.backgroundImage ? `url(${block.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: block.backgroundPosition ?? 'center',
      }}
    >
      {block.backgroundImage && (
        <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlay})` }} />
      )}
      <div className={`relative z-10 mx-auto w-full max-w-4xl flex flex-col gap-4 ${align}`}>
        <h1
          className="font-bold leading-tight"
          style={{ color: block.titleColor ?? '#fff', fontSize: titleSize(block.titleSize) }}
        >
          {block.title}
        </h1>
        {block.subtitle && (
          <p className="text-lg md:text-xl max-w-2xl" style={{ color: block.subtitleColor ?? 'rgba(255,255,255,0.85)' }}>
            {block.subtitle}
          </p>
        )}
        {block.ctaText && block.ctaUrl && (
          <div className="flex flex-wrap gap-3 mt-2">
            <Link
              href={block.ctaUrl}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: block.ctaColor ?? '#dc2626' }}
            >
              {block.ctaText}
            </Link>
            {block.secondaryCtaText && block.secondaryCtaUrl && (
              <Link
                href={block.secondaryCtaUrl}
                className="px-6 py-3 rounded-lg font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
              >
                {block.secondaryCtaText}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function titleSize(size?: string): string {
  const map: Record<string, string> = {
    xs: '1.5rem', sm: '2rem', base: '2.5rem', lg: '3rem',
    xl: '3.75rem', '2xl': '4.5rem', '3xl': '6rem', '4xl': '8rem',
  };
  return map[size ?? 'xl'] ?? '3.75rem';
}
