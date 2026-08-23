import type { PageBlockTestimonial } from '@/lib/types';
import { safeStr } from '@/lib/utils';
import { spacingToStyle, hasSpacing } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS, headingSizeCls, typographyToCSS } from './blockStyle';

interface Props { block: PageBlockTestimonial }

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 mb-3" aria-label={`${rating} av 5 stjärnor`}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= rating ? 'text-yellow-400' : 'text-zinc-200 dark:text-zinc-700'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 00-.363 1.118l1.287 3.959c.3.921-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.784.57-1.838-.197-1.539-1.118l1.287-3.96a1 1 0 00-.363-1.117L2.062 9.386c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.689l1.286-3.958z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialBlock({ block }: Props) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {block.items.map(item => (
          <div key={item.id} className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6">
            {typeof item.rating === 'number' && <Stars rating={item.rating} />}
            <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed mb-4">&ldquo;{item.quote}&rdquo;</p>
            <div className="flex items-center gap-3">
              {item.authorImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.authorImage} alt="" className="w-10 h-10 rounded-full object-cover" loading="lazy" />
              )}
              <div>
                <p className="text-xs font-black text-zinc-900 dark:text-zinc-100">{item.authorName}</p>
                {item.authorRole && <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{item.authorRole}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
