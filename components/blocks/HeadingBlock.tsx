import type { PageBlockHeading } from '@/lib/types';
import { safeStr } from '@/lib/utils';

interface Props { block: PageBlockHeading }
const sizeMap: Record<string, string> = { xs: 'text-lg', sm: 'text-xl', base: 'text-2xl', lg: 'text-3xl', xl: 'text-4xl', '2xl': 'text-5xl', '3xl': 'text-6xl', '4xl': 'text-7xl' };

export default function HeadingBlock({ block }: Props) {
  const text = safeStr(block.text);
  const sizeClass = sizeMap[safeStr(block.size, 'xl')] ?? 'text-4xl';
  const level = typeof block.level === 'number' ? block.level : 2;
  const align = safeStr(block.align, 'left') as 'left' | 'center' | 'right';
  const color = safeStr(block.color);
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return (
    <div className="mx-auto max-w-4xl px-6 py-4" style={{ textAlign: align }}>
      <Tag className={`font-bold ${sizeClass}`} style={color ? { color } : undefined}>{text}</Tag>
    </div>
  );
}
