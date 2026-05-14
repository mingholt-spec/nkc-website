import Link from 'next/link';
import type { PageBlockCta } from '@/lib/types';
interface Props { block: PageBlockCta }
export default function CtaBlock({ block }: Props) {
  return (
    <section
      className="relative px-6 py-16 text-center"
      style={{
        backgroundColor: block.backgroundColor ?? '#18181b',
        backgroundImage: block.backgroundImage ? `url(${block.backgroundImage})` : undefined,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}
    >
      {block.backgroundImage && <div className="absolute inset-0 bg-black/50" />}
      <div className="relative z-10 mx-auto max-w-2xl">
        <h2 className="text-3xl font-bold text-white">{block.title}</h2>
        {block.subtitle && <p className="mt-3 text-lg text-white/80">{block.subtitle}</p>}
        <Link href={block.buttonUrl} className="mt-6 inline-block px-8 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
          {block.buttonText}
        </Link>
      </div>
    </section>
  );
}
