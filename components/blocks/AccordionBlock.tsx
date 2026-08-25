'use client';

import { useState } from 'react';
import type { PageBlockAccordion } from '@/lib/types';
import { safeStr, normalizeLinks } from '@/lib/utils';
import { spacingToStyle, hasSpacing } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS, headingSizeCls, typographyToCSS } from './blockStyle';

interface Props { block: PageBlockAccordion }

export default function AccordionBlock({ block }: Props) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = block.allowMultipleOpen ? new Set(prev) : new Set<string>();
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const hasCustomPadding = hasSpacing(block.padding);
  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '48px' }), ...blockStyleToCSS(block.style) };
  const typo = typographyToCSS(block.style);
  delete typo.textAlign;
  delete typo.fontSize;
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);
  const title = safeStr(block.title);

  return (
    <section id={`block-${block.id}`} className={`mx-auto max-w-3xl ${hasCustomPadding ? '' : 'px-6 py-12'}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      {title && (
        <h2 className={`${headingSizeCls(block.titleSize, '2xl')} font-black uppercase tracking-tight mb-8 text-center text-zinc-900 dark:text-zinc-100`} style={typo}>
          {title}
        </h2>
      )}
      <div className="space-y-3">
        {block.items.map(item => {
          const isOpen = openIds.has(item.id);
          return (
            <div key={item.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-800">
              <button
                type="button"
                id={`accordion-btn-${block.id}-${item.id}`}
                onClick={() => toggle(item.id)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${block.id}-${item.id}`}
              >
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.question}</span>
                <svg className={`w-4 h-4 flex-shrink-0 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isOpen && (
                <div
                  id={`accordion-panel-${block.id}-${item.id}`}
                  role="region"
                  aria-labelledby={`accordion-btn-${block.id}-${item.id}`}
                  className="px-5 pb-4 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: normalizeLinks(safeStr(item.answer)) }}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
