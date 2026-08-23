import type { PageBlockDivider } from '@/lib/types';
import { spacingToStyle, hasSpacing } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS } from './blockStyle';
interface Props { block: PageBlockDivider }
export default function DividerBlock({ block }: Props) {
  const hasCustomPadding = hasSpacing(block.padding);
  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '8px' }), ...blockStyleToCSS(block.style) };
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);
  return (
    <div id={`block-${block.id}`} className={`mx-auto max-w-4xl ${hasCustomPadding ? '' : 'px-6 py-2'}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <hr className="border-zinc-200" />
    </div>
  );
}
