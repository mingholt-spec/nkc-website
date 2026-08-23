import Image from 'next/image';
import type { PageBlockGallery } from '@/lib/types';
import { safeStr } from '@/lib/utils';
import { spacingToStyle } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS, headingSizeCls, typographyToCSS } from './blockStyle';

interface Props { block: PageBlockGallery }

const COLS_MAP: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
};

export default function GalleryBlock({ block }: Props) {
  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '48px' }), ...blockStyleToCSS(block.style) };
  const typo = typographyToCSS(block.style);
  delete typo.textAlign;
  delete typo.fontSize;
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);
  const title = safeStr(block.title);

  if (block.images.length === 0) return null;

  return (
    <section id={`block-${block.id}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <div className="max-w-5xl mx-auto px-6">
        {title && (
          <h2 className={`${headingSizeCls(block.titleSize, '2xl')} font-black uppercase tracking-tight mb-8 text-center text-zinc-900 dark:text-zinc-100`} style={typo}>
            {title}
          </h2>
        )}
        <div className={`grid ${COLS_MAP[block.columns || 3]} gap-3 md:gap-4`}>
          {block.images.map(image => (
            <figure key={image.id} className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <Image src={image.src} alt={image.alt || ''} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              {image.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
