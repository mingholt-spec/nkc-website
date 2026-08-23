'use client';

import { useState } from 'react';
import type { PageBlockTabs } from '@/lib/types';
import { normalizeLinks, safeStr } from '@/lib/utils';
import { spacingToStyle } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS } from './blockStyle';

interface Props { block: PageBlockTabs }

export default function TabsBlock({ block }: Props) {
  const [activeId, setActiveId] = useState(block.tabs[0]?.id);
  const activeTab = block.tabs.find(t => t.id === activeId) || block.tabs[0];

  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '32px' }), ...blockStyleToCSS(block.style) };
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);

  if (block.tabs.length === 0) return null;

  return (
    <section id={`block-${block.id}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-700 mb-6 overflow-x-auto">
          {block.tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveId(tab.id)}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${
                activeTab?.id === tab.id ? 'border-red-600 text-red-600' : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab && (
          <div
            className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: normalizeLinks(safeStr(activeTab.content)) }}
          />
        )}
      </div>
    </section>
  );
}
