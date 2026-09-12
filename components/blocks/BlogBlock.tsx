import { getBlogPosts } from '@/lib/data';
import type { PageBlockBlog } from '@/lib/types';
import { safeStr } from '@/lib/utils';
import { spacingToStyle, hasSpacing } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS, headlineStyleToCSS, typographyToCSS } from './blockStyle';
import BlogBlockPosts from './BlogBlockPosts';

interface Props { block: PageBlockBlog }

const titleSizeMap: Record<string, string> = { xs: 'text-lg', sm: 'text-xl', base: 'text-2xl', lg: 'text-3xl', xl: 'text-4xl', '2xl': 'text-5xl', '3xl': 'text-6xl', '4xl': 'text-7xl' };

export default async function BlogBlock({ block }: Props) {
  const postsToShow = block.postsToShow ?? 3;
  const posts = await getBlogPosts(postsToShow);
  const title = safeStr(block.title);

  const hasCustomPadding = hasSpacing(block.padding);
  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '48px' }), ...blockStyleToCSS(block.style) };
  const effectiveTitleAlign = block.style?.textAlign ?? block.titleAlign;
  const alignClass = effectiveTitleAlign === 'left' ? 'text-left' : effectiveTitleAlign === 'right' ? 'text-right' : 'text-center';
  const titleSizeClass = titleSizeMap[safeStr(block.titleSize, '2xl')] ?? 'text-5xl';
  const titleStyle = headlineStyleToCSS(block.style);
  delete titleStyle._mobileTextShadow;
  const typo = typographyToCSS(block.style);
  delete typo.textAlign;
  delete typo.fontSize;
  Object.assign(titleStyle, typo);
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);

  return (
    <section id={`block-${block.id}`} className={`mx-auto max-w-5xl ${hasCustomPadding ? '' : 'px-6 py-12'}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      {title && (
        <h2 className={`${titleSizeClass} font-black uppercase tracking-tight mb-8 ${alignClass} text-zinc-900 dark:text-zinc-100`} style={titleStyle}>
          {title}
        </h2>
      )}
      <BlogBlockPosts block={block} posts={posts} />
    </section>
  );
}
