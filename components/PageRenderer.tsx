'use client';
import Image from 'next/image';
import type { WebsitePage, PageBlock, NewsPost, PageBlockBlog, PageBlockSchedule, UpcomingClassPreview } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import HeroBlock from './blocks/HeroBlock';
import TextBlock from './blocks/TextBlock';
import HeadingBlock from './blocks/HeadingBlock';
import ImageBlock from './blocks/ImageBlock';
import ButtonBlock from './blocks/ButtonBlock';
import HtmlBlock from './blocks/HtmlBlock';
import VideoBlock from './blocks/VideoBlock';
import ColumnsBlock from './blocks/ColumnsBlock';
import SpacerBlock from './blocks/SpacerBlock';
import DividerBlock from './blocks/DividerBlock';
import CtaBlock from './blocks/CtaBlock';
import LeadFormBlock from './blocks/LeadFormBlock';
import TestimonialBlock from './blocks/TestimonialBlock';
import PricingBlock from './blocks/PricingBlock';
import AccordionBlock from './blocks/AccordionBlock';
import QuoteBlock from './blocks/QuoteBlock';
import CountdownBlock from './blocks/CountdownBlock';
import BadgeBlock from './blocks/BadgeBlock';
import InstructorBlock from './blocks/InstructorBlock';
import ProgressBlock from './blocks/ProgressBlock';
import GalleryBlock from './blocks/GalleryBlock';
import TabsBlock from './blocks/TabsBlock';
import SocialFeedBlock from './blocks/SocialFeedBlock';
import MapBlock from './blocks/MapBlock';
import { safeStr } from '@/lib/utils';
import { spacingToStyle, hasSpacing } from './blocks/blockSpacing';
import { blockStyleToCSS, headlineStyleToCSS, typographyToCSS } from './blocks/blockStyle';

interface Props { page: WebsitePage; blogPosts?: NewsPost[]; schedule?: UpcomingClassPreview[] }

function generateExcerpt(html: string, max = 140): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s\S*$/, '') + '…';
}

function formatDate(dateStr: string): string {
  try { return new Date(dateStr).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return dateStr; }
}

function BlogBlockClient({ block, posts }: { block: PageBlockBlog; posts: NewsPost[] }) {
  const title = safeStr(block.title);
  const postsToShow = block.postsToShow ?? 3;
  const shown = posts.slice(0, postsToShow);

  const hasCustomPadding = hasSpacing(block.padding);
  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '48px' }), ...blockStyleToCSS(block.style) };
  const alignClass = block.style?.textAlign === 'left' ? 'text-left' : block.style?.textAlign === 'right' ? 'text-right' : 'text-center';
  const titleStyle = headlineStyleToCSS(block.style);
  delete titleStyle._mobileTextShadow;
  const typo = typographyToCSS(block.style);
  delete typo.textAlign;
  delete typo.fontSize;
  Object.assign(titleStyle, typo);

  return (
    <section className={`mx-auto max-w-5xl ${hasCustomPadding ? '' : 'px-6 py-12'}`} style={sectionStyle}>
      {title && (
        <h2 className={`text-3xl font-black uppercase tracking-tight mb-8 ${alignClass} text-zinc-900 dark:text-zinc-100`} style={titleStyle}>
          {title}
        </h2>
      )}
      {shown.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-300 text-center py-8">Inga inlägg publicerade</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map(post => {
            const href = post.category
              ? `/blogg/${post.category}/${post.slug || post.id}`
              : `/blogg/${post.slug || post.id}`;
            return (
              <a key={post.id} href={href}
                className="group block bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300">
                {post.coverImage && (
                  <div className="aspect-video overflow-hidden relative">
                    <Image src={post.coverImage} alt={post.title} fill loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      style={post.coverImagePosition ? { objectPosition: post.coverImagePosition } : undefined} />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest mb-2">
                    {formatDate(post.createdAt)}
                  </p>
                  <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 mb-2 group-hover:opacity-70 transition-opacity line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
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

// Måndag-först (inte JS Date.getDay()'s söndag-först) — speglar
// bjj-premium/components/public/blocks/ScheduleBlock.tsx.
const DAY_LABELS = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
function dayIndexMondayFirst(dateStr: string): number {
  const jsDay = new Date(`${dateStr}T00:00:00`).getDay();
  return (jsDay + 6) % 7;
}
function groupByWeekday(classes: UpcomingClassPreview[]): { day: string; classes: UpcomingClassPreview[] }[] {
  const buckets: UpcomingClassPreview[][] = Array.from({ length: 7 }, () => []);
  for (const c of classes) {
    if (!c.date) continue;
    buckets[dayIndexMondayFirst(c.date)].push(c);
  }
  return DAY_LABELS
    .map((day, i) => ({ day, classes: buckets[i] }))
    .filter(d => d.classes.length > 0);
}

function ScheduleBlockClient({ block, schedule }: { block: PageBlockSchedule; schedule: UpcomingClassPreview[] }) {
  const title = safeStr(block.title);
  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '48px' }), ...blockStyleToCSS(block.style) };
  const alignClass = block.style?.textAlign === 'left' ? 'text-left' : block.style?.textAlign === 'right' ? 'text-right' : 'text-center';
  const titleStyle = headlineStyleToCSS(block.style);
  delete titleStyle._mobileTextShadow;
  const typo = typographyToCSS(block.style);
  delete typo.textAlign;
  delete typo.fontSize;
  Object.assign(titleStyle, typo);
  const days = groupByWeekday(schedule);

  return (
    <section className="mx-auto max-w-5xl px-6 py-12" style={sectionStyle}>
      {title && (
        <h2 className={`text-3xl font-black uppercase tracking-tight mb-8 ${alignClass} text-zinc-900 dark:text-zinc-100`} style={titleStyle}>
          {title}
        </h2>
      )}
      {days.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-300 text-center py-8">Inga pass inbokade just nu.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map(({ day, classes: dayClasses }) => (
            <div key={day} className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400 mb-4">{day}</h3>
              <div className="space-y-3">
                {dayClasses.map(c => (
                  <div key={c.id} className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-700 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">{c.name}</p>
                      {block.showInstructor !== false && c.instructor && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{c.instructor}</p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                      {c.time}{c.endTime ? `–${c.endTime}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function PageRenderer({ page, blogPosts = [], schedule = [] }: Props) {
  const lang = useLanguage();

  if (page.mode === 'html') {
    const html = (lang === 'en' && page.htmlContentEn) ? page.htmlContentEn : (page.htmlContent ?? '');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  const blocks = (lang === 'en' && page.blocksEn?.length) ? page.blocksEn : (page.blocks ?? []);
  return (
    <div>
      {blocks.map(block => <BlockRenderer key={block.id} block={block} blogPosts={blogPosts} schedule={schedule} />)}
    </div>
  );
}

export function BlockRenderer({ block, blogPosts = [], schedule = [] }: { block: PageBlock; blogPosts?: NewsPost[]; schedule?: UpcomingClassPreview[] }) {
  switch (block.type) {
    case 'hero':     return <HeroBlock block={block} />;
    case 'text':     return <TextBlock block={block} />;
    case 'heading':  return <HeadingBlock block={block} />;
    case 'image':    return <ImageBlock block={block} />;
    case 'button':   return <ButtonBlock block={block} />;
    case 'html':     return <HtmlBlock block={block} />;
    case 'video':    return <VideoBlock block={block} />;
    case 'columns':  return <ColumnsBlock block={block} blogPosts={blogPosts} schedule={schedule} />;
    case 'spacer':   return <SpacerBlock block={block} />;
    case 'divider':  return <DividerBlock block={block} />;
    case 'cta':      return <CtaBlock block={block} />;
    case 'blog':     return <BlogBlockClient block={block} posts={blogPosts} />;
    case 'schedule': return <ScheduleBlockClient block={block} schedule={schedule} />;
    case 'leadForm': return <LeadFormBlock block={block} />;
    case 'testimonial': return <TestimonialBlock block={block} />;
    case 'pricing': return <PricingBlock block={block} />;
    case 'accordion': return <AccordionBlock block={block} />;
    case 'quote': return <QuoteBlock block={block} />;
    case 'countdown': return <CountdownBlock block={block} />;
    case 'badge': return <BadgeBlock block={block} />;
    case 'instructor': return <InstructorBlock block={block} />;
    case 'progress': return <ProgressBlock block={block} />;
    case 'gallery': return <GalleryBlock block={block} />;
    case 'tabs': return <TabsBlock block={block} />;
    case 'socialFeed': return <SocialFeedBlock block={block} />;
    case 'map': return <MapBlock block={block} />;
    default:         return null;
  }
}
