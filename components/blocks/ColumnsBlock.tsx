import type { PageBlockColumns, PageBlockLeaf } from '@/lib/types';
import { BlockRenderer } from '@/components/PageRenderer';

interface Props { block: PageBlockColumns }

const colMap: Record<number, string> = { 2: 'grid-cols-1 md:grid-cols-2', 3: 'grid-cols-1 md:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4' };
const gapMap: Record<string, string> = { none: 'gap-0', sm: 'gap-4', md: 'gap-8', lg: 'gap-12' };

function getColBlocks(col: unknown): PageBlockLeaf[] {
  if (Array.isArray(col)) return col as PageBlockLeaf[];
  // Firestore stores columns as {blocks: [...]} objects
  if (col && typeof col === 'object') {
    const obj = col as Record<string, unknown>;
    if (Array.isArray(obj.blocks)) return obj.blocks as PageBlockLeaf[];
    // Fallback: numeric-keyed object {"0": block, "1": block}
    const vals = Object.values(obj);
    if (vals.length > 0) return vals as PageBlockLeaf[];
  }
  return [];
}

export default function ColumnsBlock({ block }: Props) {
  const cols = Array.isArray(block.columns) ? block.columns : [];
  const colClass = colMap[block.columnCount ?? cols.length] ?? 'grid-cols-1 md:grid-cols-2';
  const gapClass = gapMap[block.gap ?? 'md'] ?? 'gap-8';
  return (
    <div className={`mx-auto max-w-6xl px-6 py-6 grid ${colClass} ${gapClass}`}>
      {cols.map((col, i) => {
        const blocks = getColBlocks(col);
        return (
          <div key={i}>
            {blocks.map(b => <BlockRenderer key={b.id} block={b} />)}
          </div>
        );
      })}
    </div>
  );
}
