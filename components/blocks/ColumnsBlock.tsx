import type { PageBlockColumns } from '@/lib/types';
import { BlockRenderer } from '@/components/PageRenderer';

interface Props { block: PageBlockColumns }

const colMap: Record<number, string> = { 2: 'grid-cols-1 md:grid-cols-2', 3: 'grid-cols-1 md:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4' };
const gapMap = { none: 'gap-0', sm: 'gap-4', md: 'gap-8', lg: 'gap-12' };

export default function ColumnsBlock({ block }: Props) {
  const colClass = colMap[block.columnCount ?? block.columns.length] ?? 'grid-cols-1 md:grid-cols-2';
  const gapClass = gapMap[block.gap ?? 'md'];
  return (
    <div className={`mx-auto max-w-6xl px-6 py-6 grid ${colClass} ${gapClass}`}>
      {block.columns.map((col, i) => (
        <div key={i}>
          {col.map(b => <BlockRenderer key={b.id} block={b} />)}
        </div>
      ))}
    </div>
  );
}
