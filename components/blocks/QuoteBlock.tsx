import type { PageBlockQuote } from '@/lib/types';
import { safeStr } from '@/lib/utils';
import { spacingToStyle, hasSpacing } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS, headlineStyleToCSS, typographyToCSS } from './blockStyle';

interface Props { block: PageBlockQuote }

export default function QuoteBlock({ block }: Props) {
  const hasCustomPadding = hasSpacing(block.padding);
  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '48px' }), ...blockStyleToCSS(block.style) };
  const { _mobileTextShadow: _mt, ...textStyle } = headlineStyleToCSS(block.style);
  void _mt;
  const typo = typographyToCSS(block.style);
  delete typo.fontSize;
  Object.assign(textStyle, typo);
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);
  const author = safeStr(block.author);
  const role = safeStr(block.role);

  return (
    <section id={`block-${block.id}`} className={`mx-auto max-w-3xl text-center ${hasCustomPadding ? '' : 'px-6 py-12'}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <svg className="w-8 h-8 mx-auto mb-4 text-red-600/40" fill="currentColor" viewBox="0 0 24 24"><path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.57-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" /></svg>
      <p className="text-xl md:text-2xl font-medium text-zinc-800 dark:text-zinc-100 leading-relaxed" style={textStyle}>
        {block.text}
      </p>
      {(author || role) && (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          {author && <span className="font-bold text-zinc-700 dark:text-zinc-200">{author}</span>}
          {author && role && ' — '}
          {role}
        </p>
      )}
    </section>
  );
}
