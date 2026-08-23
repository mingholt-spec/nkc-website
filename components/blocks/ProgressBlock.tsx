import type { PageBlockProgress } from '@/lib/types';
import { spacingToStyle } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS } from './blockStyle';

interface Props { block: PageBlockProgress }

export default function ProgressBlock({ block }: Props) {
  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '32px' }), ...blockStyleToCSS(block.style) };
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);

  return (
    <section id={`block-${block.id}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <div className="max-w-2xl mx-auto flex items-center px-6">
        {block.steps.map((step, idx) => {
          const isDone = idx < block.currentStep;
          const isCurrent = idx === block.currentStep;
          return (
            <div key={step.id} className="contents">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  isDone ? 'bg-red-600 text-white' : isCurrent ? 'bg-red-100 text-red-600 border-2 border-red-600 dark:bg-red-900/30' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                }`}>
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  ) : idx + 1}
                </div>
                <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest text-center whitespace-nowrap ${isCurrent ? 'text-red-600' : 'text-zinc-400'}`}>{step.label}</span>
              </div>
              {idx < block.steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 ${isDone ? 'bg-red-600' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
