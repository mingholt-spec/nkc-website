'use client';
import Image from 'next/image';
import type { WebsitePage, PageBlock, NewsPost, PageBlockBlog } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import HeroBlock from './blocks/HeroBlock';
import TextBlock from './blocks/TextBlock';
import HeadingBlock from './blocks/HeadingBlock';
import ImageBlock from './blocks/ImageBlock';
import ButtonBlock from './blocks/ButtonBlock';
import HtmlBlock from './blocks/HtmlBlock';
import VideoBlock from './blocks/VideoBlock';
import ColumnsBlock from './blocks/ColumnsBlock';
import SpacerBlock from './blocks/SpacerBlock';
import DividerBlock from './blocks/DividerBlock';
import CtaBlock from './blocks/CtaBlock';
import { safeStr } from '@/lib/utils';

interface Props { page: WebsitePage; blogPosts?: NewsPost[] }

function generateExcerpt(html: string, max = 140): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s\S*$/, '') + '…';
}

function formatDate(dateStr: string): string {
  try { return new Date(dateStr).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return dateStr; }
}

function BlogBlockClient({ block, posts }: { block: PageBlockBlog; posts: NewsPost[] }) {
  const title = safeStr(block.title);
  const count = block.count ?? 3;
  const shown = posts.slice(0, count);
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      {title && (
        <h2 className="text-3xl font-black uppercase tracking-tight mb-8 text-center text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
      )}
      {shown.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-300 text-center py-8">Inga inlägg publicerade</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map(post => {
            const href = post.category
              ? `/blogg/${post.category}/${post.slug || post.id}`
              : `/blogg/${post.slug || post.id}`;
            return (
              <a key={post.id} href={href}
                className="group block bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300">
                {post.coverImage && (
                  <div className="aspect-video overflow-hidden relative">
                    <Image src={post.coverImage} alt={post.title} fill loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      style={post.coverImagePosition ? { objectPosition: post.coverImagePosition } : undefined} />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest mb-2">
                    {formatDate(post.createdAt)}
                  </p>
                  <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 mb-2 group-hover:opacity-70 transition-opacity line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                    {post.excerpt || generateExcerpt(post.content)}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function PageRenderer({ page, blogPosts = [] }: Props) {
  const lang = useLanguage();

  if (page.mode === 'html') {
    const html = (lang === 'en' && page.htmlContentEn) ? page.htmlContentEn : (page.htmlContent ?? '');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  const blocks = (lang === 'en' && page.blocksEn?.length) ? page.blocksEn : (page.blocks ?? []);
  return (
    <div>
      {blocks.map(block => <BlockRenderer key={block.id} block={block} blogPosts={blogPosts} />)}
    </div>
  );
}

export function BlockRenderer({ block, blogPosts = [] }: { block: PageBlock; blogPosts?: NewsPost[] }) {
  switch (block.type) {
    case 'hero':     return <HeroBlock block={block} />;
    case 'text':     return <TextBlock block={block} />;
    case 'heading':  return <HeadingBlock block={block} />;
    case 'image':    return <ImageBlock block={block} />;
    case 'button':   return <ButtonBlock block={block} />;
    case 'html':     return <HtmlBlock block={block} />;
    case 'video':    return <VideoBlock block={block} />;
    case 'columns':  return <ColumnsBlock block={block} />;
    case 'spacer':   return <SpacerBlock block={block} />;
    case 'divider':  return <DividerBlock block={block} />;
    case 'cta':      return <CtaBlock block={block} />;
    case 'blog':     return <BlogBlockClient block={block} posts={blogPosts} />;
    case 'form':     return null;
    default:         return null;
  }
}
