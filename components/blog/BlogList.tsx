import Link from 'next/link';
import Image from 'next/image';
import type { NewsPost } from '@/lib/types';

interface Props { posts: NewsPost[] }

export default function BlogList({ posts }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-bold text-zinc-900 mb-8">Blogg</h1>
      <div className="grid gap-8 sm:grid-cols-2">
        {posts.map(post => <PostCard key={post.id} post={post} />)}
      </div>
      {posts.length === 0 && (
        <p className="text-zinc-500 text-center py-20">Inga inlägg publicerade ännu.</p>
      )}
    </div>
  );
}

function PostCard({ post }: { post: NewsPost }) {
  const slug = post.slug ?? post.id;
  const href = `/blogg/${post.category ?? 'okategoriserat'}/${slug}`;

  return (
    <Link href={href} className="group block rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow">
      {post.coverImage && (
        <div className="aspect-video relative bg-zinc-100">
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
        <h2 className="mt-1 text-lg font-bold text-zinc-900 group-hover:text-red-600 transition-colors line-clamp-2">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-2 text-sm text-zinc-500 line-clamp-3">{post.excerpt}</p>
        )}
        {post.publishedAt && (
          <p className="mt-3 text-xs text-zinc-400">
            {new Date(post.publishedAt).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>
    </Link>
  );
}
