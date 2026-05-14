import type { PageBlockImage } from '@/lib/types';

interface Props { block: PageBlockImage }

const widthMap: Record<string, string> = { full: 'w-full', wide: 'max-w-5xl mx-auto', medium: 'max-w-3xl mx-auto', narrow: 'max-w-xl mx-auto' };
const alignMap: Record<string, string> = { left: 'mr-auto', center: 'mx-auto', right: 'ml-auto' };

export default function ImageBlock({ block }: Props) {
  if (!block.url) return null;
  const widthClass = widthMap[block.width ?? 'full'] ?? 'w-full';
  const alignClass = block.width === 'full' ? '' : (alignMap[block.align ?? 'center'] ?? 'mx-auto');
  return (
    <div className={`px-6 py-4 ${widthClass} ${alignClass}`}>
      <img src={block.url} alt={block.alt ?? ''} loading="lazy" className="w-full h-auto rounded-xl" />
      {block.caption && <p className="mt-2 text-sm text-zinc-400 text-center">{block.caption}</p>}
    </div>
  );
}
