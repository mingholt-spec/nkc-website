'use client';
import Link from 'next/link';
import Image from 'next/image';
import type { NewsPost } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';

interface Props { posts: NewsPost[] }

const T = {
  sv: { heading: 'Blogg', empty: 'Inga inlägg publicerade ännu.' },
  en: { heading: 'Blog', empty: 'No posts published yet.' },
};

export default function BlogList({ posts }: Props) {
  const lang = useLanguage();
  const t = T[lang];
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">{t.heading}</h1>
      <div className="grid gap-8 sm:grid-cols-2">
        {posts.map(post => <PostCard key={post.id} post={post} />)}
      </div>
      {posts.length === 0 && (
        <p className="text-zinc-500 text-center py-20">{t.empty}</p>
      )}
    </div>
  );
}

function PostCard({ post }: { post: NewsPost }) {
  const lang = useLanguage();
  const slug = post.slug ?? post.id;
  const href = `/blogg/${post.category ?? 'okategoriserat'}/${slug}`;
  const title = (lang === 'en' && post.titleEn) ? post.titleEn : post.title;
  const excerpt = (lang === 'en' && post.excerptEn) ? post.excerptEn : post.excerpt;
  const locale = lang === 'en' ? 'en-GB' : 'sv-SE';

  return (
    <Link href={href} className="group block rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden hover:shadow-md transition-shadow">
      {post.coverImage && (
        <div className="aspect-video relative bg-zinc-100 dark:bg-zinc-700">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
      )}
      <div className="p-5">
        {post.category && (
          <span className="text-xs font-semibold uppercase tracking-wide text-red-600">{post.category}</span>
        )}
        <h2 className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
          {title}
        </h2>
        {excerpt && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3">{excerpt}</p>
        )}
        {post.publishedAt && (
          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
            {new Date(post.publishedAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>
    </Link>
  );
}
