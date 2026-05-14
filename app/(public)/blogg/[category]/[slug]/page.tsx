import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBlogPostBySlug, getBlogPosts, getClubConfig, getWebsiteConfig } from '@/lib/data';
import BlogPost from '@/components/blog/BlogPost';

export const revalidate = 3600;

type Props = { params: Promise<{ category: string; slug: string }> };

export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts(200);
    return posts
      .filter(p => p.slug && p.category)
      .map(p => ({ category: p.category!, slug: p.slug! }));
  } catch { return []; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post, club] = await Promise.all([getBlogPostBySlug(slug), getClubConfig()]);
  if (!post) return {};

  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? post.excerpt ?? '';
  const clubName = club.clubName ?? '';

  return {
    title: `${title} | ${clubName}`,
    description,
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
