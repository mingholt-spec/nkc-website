import Image from 'next/image';
import type { PageBlockImage } from '@/lib/types';
interface Props { block: PageBlockImage }
const widthMap = { full: 'w-full', wide: 'max-w-5xl', medium: 'max-w-3xl', narrow: 'max-w-xl' };
const alignMap = { left: 'mr-auto', center: 'mx-auto', right: 'ml-auto' };
export default function ImageBlock({ block }: Props) {
  const widthClass = widthMap[block.width ?? 'full'];
  const alignClass = alignMap[block.align ?? 'center'];
  return (
    <div className={`px-6 py-4 ${widthClass} ${alignClass}`}>
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-100">
        <Image src={block.url} alt={block.alt ?? ''} fill className="object-cover" sizes="(max-width: 768px) 100vw, 1200px" />
      </div>
      {block.caption && <p className="mt-2 text-sm text-zinc-400 text-center">{block.caption}</p>}
    </div>
  );
}
