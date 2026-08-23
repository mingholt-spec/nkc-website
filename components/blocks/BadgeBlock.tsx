import type { PageBlockBadge } from '@/lib/types';
import { spacingToStyle } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS } from './blockStyle';

interface Props { block: PageBlockBadge }

const ALIGN_MAP: Record<string, string> = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };

export default function BadgeBlock({ block }: Props) {
  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '12px' }), ...blockStyleToCSS(block.style) };
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);

  return (
    <section id={`block-${block.id}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <div className={`flex ${ALIGN_MAP[block.align || 'center']}`}>
        <span
          className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest"
          style={{ backgroundColor: block.backgroundColor || '#dc2626', color: block.textColor || '#ffffff' }}
        >
          {block.text}
        </span>
      </div>
    </section>
  );
}
