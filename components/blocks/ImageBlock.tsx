import type { PageBlockImage } from '@/lib/types';

interface Props { block: PageBlockImage }

export default function ImageBlock({ block }: Props) {
  if (!block.src) {
    return (
      <div className="px-6 py-8">
        <div className="max-w-3xl mx-auto aspect-video bg-zinc-100 rounded-2xl flex items-center justify-center">
          <svg className="w-12 h-12 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  }
  return (
    <div className="px-6 py-6">
      <figure className="mx-auto" style={{ maxWidth: block.width || '100%' }}>
        <img
          src={block.src}
          alt={block.alt || ''}
          loading="lazy"
          decoding="async"
          className={`w-full h-auto ${block.rounded !== false ? 'rounded-2xl' : ''} ${block.shadow !== false ? 'shadow-lg' : ''}`}
        />
        {block.caption && (
          <figcaption className="text-center text-sm mt-3 font-medium opacity-70">{block.caption}</figcaption>
        )}
      </figure>
    </div>
  );
}
