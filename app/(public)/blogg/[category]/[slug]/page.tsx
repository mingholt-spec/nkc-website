import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/data';
import { slugifyCategory } from '@/lib/utils';
import BlogPost from '@/components/blog/BlogPost';

export const revalidate = 3600;

type Props = { params: Promise<{ category: string; slug: string }> };

export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts(200);
    return posts
      .filter(p => p.slug && p.category)
      .map(p => ({ category: slugifyCategory(p.category!), slug: p.slug! }));
  } catch { return []; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};

  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? post.excerpt ?? '';
  const canonicalCategory = slugifyCategory(post.category ?? 'okategoriserat');

  return {
    title,
    description,
    alternates: { canonical: `https://www.nkc.nu/blogg/${canonicalCategory}/${slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || !post.isPublished) notFound();
  return <BlogPost post={post} />;
}
