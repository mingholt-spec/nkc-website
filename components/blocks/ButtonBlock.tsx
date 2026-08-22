import Link from 'next/link';
import type { PageBlockButton } from '@/lib/types';
import { spacingToStyle, hasSpacing } from './blockSpacing';
import { blockStyleToCSS } from './blockStyle';
interface Props { block: PageBlockButton }
const variantMap = {
  primary: 'bg-red-600 text-white hover:bg-red-700',
  secondary: 'bg-zinc-800 text-white hover:bg-zinc-700',
  outline: 'border-2 border-zinc-800 text-zinc-800 hover:bg-zinc-50',
  ghost: 'text-zinc-700 hover:bg-zinc-100',
};
const sizeMap = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3', lg: 'px-8 py-4 text-lg' };
const alignMap = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };
export default function ButtonBlock({ block }: Props) {
  const variant = variantMap[block.variant ?? 'primary'];
  const size = sizeMap[block.size ?? 'md'];
  const effectiveAlign = block.style?.textAlign ?? block.align ?? 'center';
  const align = alignMap[effectiveAlign];
  const hasCustomPadding = hasSpacing(block.spacing);
  const sectionStyle = { ...spacingToStyle(block.spacing, undefined, { x: '24px', y: '16px' }), ...blockStyleToCSS(block.style) };
  return (
    <div className={`mx-auto max-w-4xl ${hasCustomPadding ? '' : 'px-6 py-4'} flex ${align}`} style={sectionStyle}>
      <Link href={block.url} className={`inline-flex rounded-lg font-semibold transition-colors ${variant} ${size}`}>
        {block.text}
      </Link>
    </div>
  );
}
