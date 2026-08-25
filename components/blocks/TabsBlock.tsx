'use client';

import { useState, useRef } from 'react';
import type { PageBlockTabs } from '@/lib/types';
import { normalizeLinks, safeStr } from '@/lib/utils';
import { spacingToStyle } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS } from './blockStyle';

interface Props { block: PageBlockTabs }

export default function TabsBlock({ block }: Props) {
  const [activeId, setActiveId] = useState(block.tabs[0]?.id);
  const activeTab = block.tabs.find(t => t.id === activeId) || block.tabs[0];
  // Roving-tabindex refs so arrow-key navigation (WAI-ARIA APG tabs pattern)
  // can move focus to the newly-active tab, not just visually select it.
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '32px' }), ...blockStyleToCSS(block.style) };
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);

  if (block.tabs.length === 0) return null;

  const activateTab = (id: string) => {
    setActiveId(id);
    tabRefs.current[id]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    const count = block.tabs.length;
    let nextIdx: number | null = null;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % count;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + count) % count;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = count - 1;
    if (nextIdx !== null) {
      e.preventDefault();
      activateTab(block.tabs[nextIdx].id);
    }
  };

  return (
    <section id={`block-${block.id}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <div className="max-w-3xl mx-auto px-6">
        <div role="tablist" className="flex gap-1 border-b border-zinc-200 dark:border-zinc-700 mb-6 overflow-x-auto">
          {block.tabs.map((tab, idx) => {
            const isActive = activeTab?.id === tab.id;
            return (
              <button
                key={tab.id}
                ref={el => { tabRefs.current[tab.id] = el; }}
                type="button"
                role="tab"
                id={`tab-${block.id}-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`tabpanel-${block.id}-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => activateTab(tab.id)}
                onKeyDown={e => handleKeyDown(e, idx)}
                className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${
                  isActive ? 'border-red-600 text-red-600' : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {activeTab && (
          <div
            role="tabpanel"
            id={`tabpanel-${block.id}-${activeTab.id}`}
            aria-labelledby={`tab-${block.id}-${activeTab.id}`}
            className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: normalizeLinks(safeStr(activeTab.content)) }}
          />
        )}
      </div>
    </section>
  );
}
