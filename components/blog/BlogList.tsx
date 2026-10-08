'use client';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { NewsPost, BlogBanner } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import { useT } from '@/lib/translations';
import { slugifyCategory } from '@/lib/utils';
import { BlogSidebar, InlineBanner } from './BlogSidebar';

interface Props {
  posts: NewsPost[];
  sidebarEnabled?: boolean;
  banners?: BlogBanner[];
}

export default function BlogList({ posts, sidebarEnabled = false, banners = [] }: Props) {
  const t = useT('blogList');

  // Samma placeringslogik som bjj-premium/components/public/PublicBlogList.tsx:
  // sidofältet kräver minst en aktiv sidebar-banner, annars faller listan
  // tillbaka till fullbredd. Inline-banners (en eller flera, roterande) visas
  // var 4:e inlägg när sidofältet är synligt, annars var 6:e.
  const sidebarBanners = banners.filter(b => b.isActive && b.position === 'sidebar');
  const inlineBanners = banners.filter(b => b.isActive && b.position === 'inline');
  const showSidebar = sidebarEnabled && sidebarBanners.length > 0;
  const inlineEvery = showSidebar ? 4 : 6;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">{t.heading}</h1>
      <div className={showSidebar ? 'flex flex-col lg:flex-row gap-8' : ''}>
        <div className="flex-1 min-w-0">
          <div className={`grid gap-8 ${showSidebar ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {posts.map((post, idx) => (
              <Fragment key={post.id}>
                <PostCard post={post} />
                {inlineBanners.length > 0 && (idx + 1) % inlineEvery === 0 && (
                  <div className={showSidebar ? 'sm:col-span-2' : 'sm:col-span-2 lg:col-span-3'}>
                    <InlineBanner banner={inlineBanners[Math.floor(idx / inlineEvery) % inlineBanners.length]} />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
          {posts.length === 0 && (
            <p className="text-zinc-600 dark:text-zinc-300 text-center py-20">{t.empty}</p>
          )}
        </div>
        {showSidebar && (
          <div className="lg:sticky lg:top-24 lg:self-start">
            <BlogSidebar banners={banners} />
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: NewsPost }) {
  const lang = useLanguage();
  const slug = post.slug ?? post.id;
  const href = `/blogg/${slugifyCategory(post.category ?? 'okategoriserat')}/${slug}`;
  const title = (lang === 'en' && post.titleEn) ? post.titleEn : post.title;
  const excerpt = (lang === 'en' && post.excerptEn) ? post.excerptEn : post.excerpt;
  const locale = lang === 'en' ? 'en-GB' : 'sv-SE';

  return (
    <Link href={href} className="group block rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden hover:shadow-md transition-shadow">
      {post.coverImage && (
        <div className="aspect-video relative bg-zinc-100 dark:bg-zinc-700">
          <Image
            src={post.coverImage}
            alt={title}
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
