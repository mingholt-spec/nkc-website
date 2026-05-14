import type { PageBlockText } from '@/lib/types';
interface Props { block: PageBlockText }
export default function TextBlock({ block }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div
        className="prose prose-zinc max-w-none"
        style={{ textAlign: block.style?.textAlign }}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  );
}
