import type { PageBlockText } from '@/lib/types';
import { safeStr } from '@/lib/utils';

interface Props { block: PageBlockText }

export default function TextBlock({ block }: Props) {
  const html = safeStr(block.content);
  const align = safeStr(block.style?.textAlign) as 'left' | 'center' | 'right' | '';
  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div
        className="prose prose-zinc max-w-none"
        style={align ? { textAlign: align } : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
