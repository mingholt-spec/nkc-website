import type { PageBlockColumns } from '@/lib/types';
import { BlockRenderer } from '@/components/PageRenderer';

interface Props { block: PageBlockColumns }

const colMap: Record<number, string> = { 2: 'grid-cols-1 md:grid-cols-2', 3: 'grid-cols-1 md:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4' };
const gapMap: Record<string, string> = { none: 'gap-0', sm: 'gap-4', md: 'gap-8', lg: 'gap-12' };

export default function ColumnsBlock({ block }: Props) {
  const cols = Array.isArray(block.columns) ? block.columns : [];
  const colClass = colMap[block.columnCount ?? cols.length] ?? 'grid-cols-1 md:grid-cols-2';
  const gapClass = gapMap[block.gap ?? 'md'] ?? 'gap-8';
  return (
    <div className={`mx-auto max-w-6xl px-6 py-6 grid ${colClass} ${gapClass}`}>
      {cols.map((col, i) => (
        <div key={i}>
          {Array.isArray(col) && col.map(b => <BlockRenderer key={b.id} block={b} />)}
        </div>
      ))}
    </div>
  );
}
