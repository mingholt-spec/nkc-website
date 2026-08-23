import type { PageBlockColumns, ColumnCellBlock } from '@/lib/types';
import { BlockRenderer } from '@/components/PageRenderer';
import { spacingToStyle, hasSpacing } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS } from './blockStyle';

interface Props { block: PageBlockColumns }

const colMap: Record<number, string> = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
};
const gapMap: Record<string, string> = { none: 'gap-0', sm: 'gap-4', md: 'gap-8', lg: 'gap-16' };

function getColBlocks(col: unknown): ColumnCellBlock[] {
  if (Array.isArray(col)) return col as ColumnCellBlock[];
  if (col && typeof col === 'object') {
    const obj = col as Record<string, unknown>;
    // Firestore stores columns as { blocks: [...] }
    if (Array.isArray(obj.blocks)) return obj.blocks as ColumnCellBlock[];
    const vals = Object.values(obj);
    if (vals.every(v => v && typeof v === 'object' && 'type' in (v as object))) {
      return vals as ColumnCellBlock[];
    }
  }
  return [];
}

export default function ColumnsBlock({ block }: Props) {
  const cols = Array.isArray(block.columns) ? block.columns : [];
  const colClass = colMap[block.columnCount ?? cols.length] ?? 'grid-cols-1 md:grid-cols-2';
  const gapClass = gapMap[block.gap ?? 'md'] ?? 'gap-8';
  const hasCustomPadding = hasSpacing(block.padding);
  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '40px' }), ...blockStyleToCSS(block.style) };
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);

  return (
    <div id={`block-${block.id}`} className={`mx-auto max-w-6xl ${hasCustomPadding ? '' : 'px-6 py-10'} grid ${colClass} ${gapClass} items-center`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      {cols.map((col, i) => {
        const blocks = getColBlocks(col);
        return (
          <div key={i} className="min-w-0">
            {blocks.map(b => <BlockRenderer key={b.id} block={b} />)}
          </div>
        );
      })}
    </div>
  );
}
