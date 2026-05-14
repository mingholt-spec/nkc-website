import Image from 'next/image';
import Link from 'next/link';
import type { NewsPost } from '@/lib/types';
import ShareButtons from './ShareButtons';

interface Props { post: NewsPost }

export default function BlogPost({ post }: Props) {
  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-zinc-400 mb-6">
        <Link href="/blogg" className="hover:text-zinc-700">Blogg</Link>
        {post.category && (
          <> <span>/</span> <span className="text-zinc-500">{post.category}</span></>
        )}
      </nav>

      {/* Header */}
      <header className="mb-8">
        {post.category && (
          <span className="text-xs font-semibold uppercase tracking-wide text-red-600">{post.category}</span>
        )}
        <h1 className="mt-2 text-4xl font-bold text-zinc-900 leading-tight">{post.title}</h1>
        {post.excerpt && <p className="mt-3 text-xl text-zinc-500">{post.excerpt}</p>}
        <div className="mt-4 flex items-center gap-4 text-sm text-zinc-400">
          {post.author && <span>Av {post.author}</span>}
          {publishDate && <time dateTime={post.publishedAt}>{publishDate}</time>}
        </div>
      </header>

      {/* Cover image */}
      {post.coverImage && (
        <div className="relative aspect-video rounded-xl overflow-hidden mb-10 bg-zinc-100">
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
        className="prose prose-zinc max-w-none prose-headings:font-bold prose-a:text-red-600"
        dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
      />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full bg-zinc-100 text-sm text-zinc-600">{tag}</span>
          ))}
        </div>
      )}

      <ShareButtons
        title={post.title}
        backHref="/blogg"
        backLabel="Tillbaka till bloggen"
      />
    </article>
  );
}
