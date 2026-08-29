import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getHomepage, getClubConfig, getWebsiteConfig, getBlogPosts, getSchedule, getSeminars } from '@/lib/data';
import { buildFAQPageSchema } from '@/lib/jsonLd';
import PageRenderer from '@/components/PageRenderer';
import SocialShareBar from '@/components/layout/SocialShareBar';

// ISR: re-render within 60 s of a content change. NOTE (found 2026-08-29): runtime
// ISR revalidation appears unreliable on Firebase App Hosting for this Next.js
// version — after editing the homepage's Firestore content directly, the page kept
// serving pre-edit content (x-nextjs-cache: STALE on every request) for 20+ minutes
// and many requests, including immediately after a fresh `apphosting:rollouts:create`
// pointed at the same already-built commit. Only a genuinely NEW build (a fresh
// commit, not just a rollout of an existing one) picked up the change. If a content
// edit doesn't show up on the live site, don't assume 60s is enough — push a trivial
// commit to force a real rebuild rather than waiting or re-rolling out the same build.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [page, club, config] = await Promise.all([getHomepage(), getClubConfig(), getWebsiteConfig()]);
  const title = page?.metaTitle ?? config?.seoDefaults?.title ?? club.clubName ?? '';
  const description = page?.metaDescription ?? config?.seoDefaults?.description ?? '';
  const ogImage = page?.ogImage ?? config?.seoDefaults?.ogImage;

  return {
    title: { absolute: title },
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: 'https://www.nkc.nu/' },
    openGraph: {
      title,
      description,
      type: 'website',
      url: 'https://www.nkc.nu/',
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function HomePage() {
  const [page, config, blogPosts, schedule, seminars] = await Promise.all([getHomepage(), getWebsiteConfig(), getBlogPosts(10), getSchedule(), getSeminars()]);
  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h1 className="text-3xl font-bold text-zinc-800">Välkommen</h1>
        <p className="mt-3 text-zinc-500">Webbplatsen är under uppbyggnad.</p>
      </div>
    );
  }
  const faqSchema = buildFAQPageSchema(page.blocks);

  return (
    <>
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <PageRenderer page={page} blogPosts={blogPosts} schedule={schedule} seminars={seminars} />
      <SocialShareBar config={config} title={page.metaTitle ?? page.title} />
    </>
  );
}
