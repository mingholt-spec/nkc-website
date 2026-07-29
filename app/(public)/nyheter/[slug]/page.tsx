import { permanentRedirect } from 'next/navigation';
import { getBlogPosts, getBlogPostBySlug } from '@/lib/data';
import { slugifyCategory } from '@/lib/utils';

// Old blog URL structure was /nyheter/[slug] before the /blogg/[category]/[slug]
// restructure. Google still has these indexed (real search traffic lands here), so
// redirect each one to its actual new article instead of dumping everyone on the
// generic /blogg list — that lost both the visitor's destination and the page's SEO value.

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts(200);
    return posts.filter(p => p.slug).map(p => ({ slug: p.slug! }));
  } catch { return []; }
}

export default async function OldNewsRedirect({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (post?.slug && post.category) {
    permanentRedirect(`/blogg/${slugifyCategory(post.category)}/${post.slug}`);
  }
  permanentRedirect('/blogg');
}
