import type { PageBlockText } from '@/lib/types';
import { safeStr } from '@/lib/utils';

interface Props { block: PageBlockText }

export default function TextBlock({ block }: Props) {
  const html = safeStr(block.content);
  if (!html) return null;
  const align = safeStr(block.style?.textAlign) as 'left' | 'center' | 'right' | '';
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : '';
  return (
    <div className={`px-6 py-4 ${alignClass}`}>
      <div
        className="prose prose-zinc dark:prose-invert max-w-none"
        style={{ fontFamily: 'var(--font-raleway, var(--font-inter)), system-ui, sans-serif' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
