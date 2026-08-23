import Link from 'next/link';
import type { PageBlockPricing } from '@/lib/types';
import { safeStr } from '@/lib/utils';
import { spacingToStyle, hasSpacing } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS, headingSizeCls, typographyToCSS } from './blockStyle';

interface Props { block: PageBlockPricing }

export default function PricingBlock({ block }: Props) {
  const hasCustomPadding = hasSpacing(block.padding);
  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '48px' }), ...blockStyleToCSS(block.style) };
  const typo = typographyToCSS(block.style);
  delete typo.textAlign;
  delete typo.fontSize;
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);
  const title = safeStr(block.title);

  return (
    <section id={`block-${block.id}`} className={`mx-auto max-w-5xl ${hasCustomPadding ? '' : 'px-6 py-12'}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      {title && (
        <h2 className={`${headingSizeCls(block.titleSize, '2xl')} font-black uppercase tracking-tight mb-8 text-center text-zinc-900 dark:text-zinc-100`} style={typo}>
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {block.tiers.map(tier => (
          <div key={tier.id} className={`rounded-2xl border p-6 flex flex-col ${tier.highlighted ? 'border-red-600 shadow-xl bg-red-50/50 dark:bg-red-900/10 scale-[1.02]' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'}`}>
            {tier.highlighted && (
              <span className="self-start mb-3 px-2.5 py-1 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-widest">Populärast</span>
            )}
            <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">{tier.name}</h3>
            <p className="mt-2 mb-4">
              <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{tier.price}</span>
              {tier.interval && <span className="text-sm text-zinc-500 dark:text-zinc-400">{tier.interval}</span>}
            </p>
            <ul className="space-y-2 mb-6 flex-1">
              {tier.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            {tier.buttonText && tier.buttonUrl && (
              <Link href={tier.buttonUrl} className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${tier.highlighted ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg' : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'}`}>
                {tier.buttonText}
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
