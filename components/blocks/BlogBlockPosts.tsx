'use client';
import Image from 'next/image';
import type { NewsPost, PageBlockBlog } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';

interface Props {
  block: PageBlockBlog;
  posts: NewsPost[];
}

function generateExcerpt(html: string, max = 140): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s\S*$/, '') + '…';
}

const T = {
  sv: { empty: 'Inga inlägg publicerade' },
  en: { empty: 'No posts published' },
};

export default function BlogBlockPosts({ block, posts }: Props) {
  const lang = useLanguage();
  const t = T[lang];
  const locale = lang === 'en' ? 'en-GB' : 'sv-SE';

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return dateStr; }
  };

  const showExcerpt = block.showExcerpt !== false;
  const showCoverImage = block.showCoverImage !== false;
  const showDate = block.showDate !== false;
  const showAuthor = block.showAuthor === true;
  const isList = block.layout === 'list';

  if (posts.length === 0) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-300 text-center py-8">{t.empty}</p>;
  }

  const resolvePost = (post: NewsPost) => {
    const href = post.category
      ? `/blogg/${post.category}/${post.slug || post.id}`
      : `/blogg/${post.slug || post.id}`;
    const title = (lang === 'en' && post.titleEn) ? post.titleEn : post.title;
    const excerpt = (lang === 'en' && post.excerptEn) ? post.excerptEn : (post.excerpt || generateExcerpt(post.content));
    return { href, title, excerpt };
  };

  if (isList) {
    return (
      <div className="flex flex-col gap-4">
        {posts.map(post => {
          const { href, title, excerpt } = resolvePost(post);
          return (
            <a key={post.id} href={href}
              className="group flex gap-4 items-center bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300">
              {showCoverImage && post.coverImage && (
                <div className="w-32 h-24 flex-shrink-0 overflow-hidden relative">
                  <Image
                    src={post.coverImage}
                    alt={title}
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
                  {title}
                </h3>
                {showExcerpt && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
                    {excerpt}
                  </p>
                )}
              </div>
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => {
        const { href, title, excerpt } = resolvePost(post);
        return (
          <a key={post.id} href={href}
            className="group block bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300">
            {showCoverImage && post.coverImage && (
              <div className="aspect-video overflow-hidden relative">
                <Image
                  src={post.coverImage}
                  alt={title}
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
                {title}
              </h3>
              {showExcerpt && (
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                  {excerpt}
                </p>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}
