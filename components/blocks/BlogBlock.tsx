import { getBlogPosts } from '@/lib/data';
import type { PageBlockBlog } from '@/lib/types';
import { safeStr } from '@/lib/utils';

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

export default async function BlogBlock({ block }: Props) {
  const count = block.count ?? 3;
  const posts = await getBlogPosts(count);
  const title = safeStr(block.title);

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      {title && (
        <h2 className="text-3xl font-black uppercase tracking-tight mb-8 text-center text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
      )}
      {posts.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-8">Inga inlägg publicerade</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => {
            const href = post.category
              ? `/blogg/${post.category}/${post.slug || post.id}`
              : `/blogg/${post.slug || post.id}`;
            return (
              <a key={post.id} href={href}
                className="group block bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300">
                {post.coverImage && (
                  <div className="aspect-video overflow-hidden">
                    <img src={post.coverImage} alt={post.title} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      style={post.coverImagePosition ? { objectPosition: post.coverImagePosition } : undefined} />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
                    {formatDate(post.createdAt)}
                  </p>
                  <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 mb-2 group-hover:opacity-70 transition-opacity line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
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
