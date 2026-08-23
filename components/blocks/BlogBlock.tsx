import Image from 'next/image';
import { getBlogPosts } from '@/lib/data';
import type { PageBlockBlog } from '@/lib/types';
import { safeStr } from '@/lib/utils';
import { spacingToStyle, hasSpacing } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS, headlineStyleToCSS, typographyToCSS } from './blockStyle';

interface Props { block: PageBlockBlog }

function generateExcerpt(html: string, max = 140): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s\S*$/, '') + '…';
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return dateStr; }
}

const titleSizeMap: Record<string, string> = { xs: 'text-lg', sm: 'text-xl', base: 'text-2xl', lg: 'text-3xl', xl: 'text-4xl', '2xl': 'text-5xl', '3xl': 'text-6xl', '4xl': 'text-7xl' };

export default async function BlogBlock({ block }: Props) {
  const postsToShow = block.postsToShow ?? 3;
  const posts = await getBlogPosts(postsToShow);
  const title = safeStr(block.title);
  const showExcerpt = block.showExcerpt !== false;
  const showCoverImage = block.showCoverImage !== false;
  const showDate = block.showDate !== false;
  const showAuthor = block.showAuthor === true;
  const isList = block.layout === 'list';

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
      {posts.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-300 text-center py-8">Inga inlägg publicerade</p>
      ) : isList ? (
        <div className="flex flex-col gap-4">
          {posts.map(post => {
            const href = post.category
              ? `/blogg/${post.category}/${post.slug || post.id}`
              : `/blogg/${post.slug || post.id}`;
            return (
              <a key={post.id} href={href}
                className="group flex gap-4 items-center bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300">
                {showCoverImage && post.coverImage && (
                  <div className="w-32 h-24 flex-shrink-0 overflow-hidden relative">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="128px"
                      style={post.coverImagePosition ? { objectPosition: post.coverImagePosition } : undefined}
                    />
                  </div>
                )}
                <div className="p-5 flex-1 min-w-0">
                  {(showDate || showAuthor) && (
                    <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest mb-2">
                      {[showDate ? formatDate(post.createdAt) : null, showAuthor && post.author ? post.author : null].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 mb-2 group-hover:opacity-70 transition-opacity line-clamp-2">
                    {post.title}
                  </h3>
                  {showExcerpt && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
                      {post.excerpt || generateExcerpt(post.content)}
                    </p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => {
            const href = post.category
              ? `/blogg/${post.category}/${post.slug || post.id}`
              : `/blogg/${post.slug || post.id}`;
            return (
              <a key={post.id} href={href}
                className="group block bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300">
                {showCoverImage && post.coverImage && (
                  <div className="aspect-video overflow-hidden relative">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      style={post.coverImagePosition ? { objectPosition: post.coverImagePosition } : undefined}
                    />
                  </div>
                )}
                <div className="p-5">
                  {(showDate || showAuthor) && (
                    <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest mb-2">
                      {[showDate ? formatDate(post.createdAt) : null, showAuthor && post.author ? post.author : null].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 mb-2 group-hover:opacity-70 transition-opacity line-clamp-2">
                    {post.title}
                  </h3>
                  {showExcerpt && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                      {post.excerpt || generateExcerpt(post.content)}
                    </p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}
