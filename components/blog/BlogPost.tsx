'use client';
import Image from 'next/image';
import Link from 'next/link';
import type { NewsPost } from '@/lib/types';
import ShareButtons from './ShareButtons';
import { useLanguage } from '@/lib/language-context';
import { normalizeLinks } from '@/lib/utils';

interface Props { post: NewsPost }

const T = {
  sv: { by: 'Av', back: 'Tillbaka till bloggen', blog: 'Blogg', share: 'Dela' },
  en: { by: 'By', back: 'Back to blog', blog: 'Blog', share: 'Share' },
};

export default function BlogPost({ post }: Props) {
  const lang = useLanguage();
  const t = T[lang];
  const title = (lang === 'en' && post.titleEn) ? post.titleEn : post.title;
  const content = (lang === 'en' && post.contentEn) ? post.contentEn : (post.content ?? '');
  const excerpt = (lang === 'en' && post.excerptEn) ? post.excerptEn : post.excerpt;
  const locale = lang === 'en' ? 'en-GB' : 'sv-SE';

  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-zinc-600 dark:text-zinc-300 mb-6">
        <Link href="/blogg" className="hover:text-zinc-900 dark:hover:text-white">{t.blog}</Link>
        {post.category && (
          <> <span>/</span> <span className="text-zinc-600 dark:text-zinc-300">{post.category}</span></>
        )}
      </nav>

      {/* Header */}
      <header className="mb-8">
        {post.category && (
          <span className="text-xs font-semibold uppercase tracking-wide text-red-600">{post.category}</span>
        )}
        <h1 className="mt-2 text-4xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{title}</h1>
        {excerpt && <p className="mt-3 text-xl text-zinc-600 dark:text-zinc-300">{excerpt}</p>}
        <div className="mt-4 flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-300">
          {post.author && <span>{t.by} {post.author}</span>}
          {publishDate && <time dateTime={post.publishedAt}>{publishDate}</time>}
        </div>
      </header>

      {/* Cover image */}
      {post.coverImage && (
        <div className="relative aspect-video rounded-xl overflow-hidden mb-10 bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            className="object-cover"
            style={{ objectPosition: post.coverImagePosition ?? 'center' }}
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-red-600"
        dangerouslySetInnerHTML={{ __html: normalizeLinks(content) }}
      />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-600 dark:text-zinc-300">{tag}</span>
          ))}
        </div>
      )}

      <ShareButtons
        title={title}
        backHref="/blogg"
        backLabel={t.back}
      />
    </article>
  );
}
