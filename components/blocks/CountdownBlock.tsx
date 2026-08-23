'use client';

import { useState, useEffect } from 'react';
import type { PageBlockCountdown } from '@/lib/types';
import { safeStr } from '@/lib/utils';
import { spacingToStyle } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS, headingSizeCls, typographyToCSS } from './blockStyle';

interface Props { block: PageBlockCountdown }

function getTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

const UNIT_LABELS: Record<string, string> = { days: 'Dagar', hours: 'Timmar', minutes: 'Min', seconds: 'Sek' };

export default function CountdownBlock({ block }: Props) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(block.targetDate));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(block.targetDate)), 1000);
    return () => clearInterval(interval);
  }, [block.targetDate]);

  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '48px' }), ...blockStyleToCSS(block.style) };
  const typo = typographyToCSS(block.style);
  delete typo.textAlign;
  delete typo.fontSize;
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);
  const title = safeStr(block.title);

  return (
    <section id={`block-${block.id}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <div className="max-w-2xl mx-auto text-center px-6">
        {title && (
          <h2 className={`${headingSizeCls(block.titleSize, '2xl')} font-black uppercase tracking-tight mb-6 text-zinc-900 dark:text-zinc-100`} style={typo}>
            {title}
          </h2>
        )}
        {timeLeft ? (
          <div className="flex justify-center gap-3 md:gap-6">
            {(Object.keys(timeLeft) as (keyof typeof timeLeft)[]).map(unit => (
              <div key={unit} className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center text-2xl md:text-3xl font-black tabular-nums">
                  {String(timeLeft[unit]).padStart(2, '0')}
                </div>
                <span className="mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{UNIT_LABELS[unit]}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lg font-bold text-zinc-700 dark:text-zinc-200">{block.expiredText || 'Tiden har gått ut!'}</p>
        )}
      </div>
    </section>
  );
}
