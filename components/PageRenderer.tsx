'use client';
import Image from 'next/image';
import Link from 'next/link';
import type { WebsitePage, PageBlock, NewsPost, PageBlockBlog, PageBlockSchedule, PageBlockColumns, UpcomingClassPreview, UpcomingSeminarPreview } from '@/lib/types';
import { useLanguage, type Lang } from '@/lib/language-context';
import { useT } from '@/lib/translations';
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

interface Props { page: WebsitePage; blogPosts?: NewsPost[]; schedule?: UpcomingClassPreview[]; seminars?: UpcomingSeminarPreview[] }

function generateExcerpt(html: string, max = 140): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s\S*$/, '') + '…';
}

function formatDate(dateStr: string, locale: string): string {
  try { return new Date(dateStr).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return dateStr; }
}

function BlogBlockClient({ block, posts }: { block: PageBlockBlog; posts: NewsPost[] }) {
  const lang = useLanguage();
  const t = useT('blogBlock');
  const locale = lang === 'en' ? 'en-GB' : 'sv-SE';
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
        <p className="text-sm text-zinc-600 dark:text-zinc-300 text-center py-8">{t.empty}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map(post => {
            const href = post.category
              ? `/blogg/${post.category}/${post.slug || post.id}`
              : `/blogg/${post.slug || post.id}`;
            const postTitle = (lang === 'en' && post.titleEn) ? post.titleEn : post.title;
            const postExcerpt = (lang === 'en' && post.excerptEn) ? post.excerptEn : (post.excerpt || generateExcerpt(post.content));
            return (
              <a key={post.id} href={href}
                className="group block bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300">
                {post.coverImage && (
                  <div className="aspect-video overflow-hidden relative">
                    <Image src={post.coverImage} alt={postTitle} fill loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      style={post.coverImagePosition ? { objectPosition: post.coverImagePosition } : undefined} />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest mb-2">
                    {formatDate(post.createdAt, locale)}
                  </p>
                  <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 mb-2 group-hover:opacity-70 transition-opacity line-clamp-2">
                    {postTitle}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                    {postExcerpt}
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
function dayIndexMondayFirst(dateStr: string): number {
  const jsDay = new Date(`${dateStr}T00:00:00`).getDay();
  return (jsDay + 6) % 7;
}
function groupByWeekday(classes: UpcomingClassPreview[], dayLabels: readonly string[]): { day: string; classes: UpcomingClassPreview[] }[] {
  const buckets: UpcomingClassPreview[][] = Array.from({ length: 7 }, () => []);
  for (const c of classes) {
    if (!c.date) continue;
    buckets[dayIndexMondayFirst(c.date)].push(c);
  }
  return dayLabels
    .map((day, i) => ({ day, classes: buckets[i] }))
    .filter(d => d.classes.length > 0);
}

function formatSeminarDate(dateStr: string, locale: string): string {
  try { return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${dateStr}T00:00:00`)); }
  catch { return dateStr; }
}

function ScheduleBlockClient({ block, schedule, seminars }: { block: PageBlockSchedule; schedule: UpcomingClassPreview[]; seminars: UpcomingSeminarPreview[] }) {
  const lang = useLanguage();
  const t = useT('scheduleBlock');
  const locale = lang === 'en' ? 'en-GB' : 'sv-SE';
  const title = safeStr(block.title);
  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '48px' }), ...blockStyleToCSS(block.style) };
  const alignClass = block.style?.textAlign === 'left' ? 'text-left' : block.style?.textAlign === 'right' ? 'text-right' : 'text-center';
  const titleStyle = headlineStyleToCSS(block.style);
  delete titleStyle._mobileTextShadow;
  const typo = typographyToCSS(block.style);
  delete typo.textAlign;
  delete typo.fontSize;
  Object.assign(titleStyle, typo);
  const days = groupByWeekday(schedule, t.dayLabels);
  const showSeminars = block.showSeminars !== false;

  return (
    <section className="mx-auto max-w-5xl px-6 py-12" style={sectionStyle}>
      {title && (
        <h2 className={`text-3xl font-black uppercase tracking-tight mb-8 ${alignClass} text-zinc-900 dark:text-zinc-100`} style={titleStyle}>
          {title}
        </h2>
      )}
      {days.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-300 text-center py-8">{t.noClasses}</p>
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
      {showSeminars && seminars.length > 0 && (
        <div className="mt-10">
          <h3 className={`text-sm font-black uppercase tracking-tight mb-4 ${alignClass} text-zinc-900 dark:text-zinc-100`}>
            {t.upcomingSeminars}
          </h3>
          <div className="space-y-3">
            {seminars.map(s => {
              const row = (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-5 py-4">
                  <div>
                    <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">{s.name}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                      {formatSeminarDate(s.date, locale)} · {s.time}{s.endTime ? `–${s.endTime}` : ''}
                      {block.showInstructor !== false && s.instructor ? ` · ${s.instructor}` : ''}
                    </p>
                  </div>
                  {s.campaignSlug && (
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">{t.readMore}</span>
                  )}
                </div>
              );
              return s.campaignSlug ? (
                <Link key={s.id} href={`/event/${s.campaignSlug}`} className="block">{row}</Link>
              ) : (
                <div key={s.id}>{row}</div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

/** Block types with no translatable content at all — an image or the live
 *  class schedule is the same regardless of language, so they always render
 *  from the Swedish (canonical) block rather than the AI-translated array.
 *  This prevents them from ever going stale relative to a Swedish-side edit
 *  made after the last "translate to English" pass in the page builder. */
const LANGUAGE_INDEPENDENT_BLOCK_TYPES = new Set(['image', 'schedule']);

function getColBlocksForMerge(col: unknown): PageBlock[] {
  if (Array.isArray(col)) return col as PageBlock[];
  if (col && typeof col === 'object') {
    const obj = col as Record<string, unknown>;
    if (Array.isArray(obj.blocks)) return obj.blocks as PageBlock[];
  }
  return [];
}

function flattenBlocksById(blocks: PageBlock[], map: Map<string, PageBlock>): Map<string, PageBlock> {
  for (const block of blocks) {
    map.set(block.id, block);
    if (block.type === 'columns') {
      const cols = Array.isArray(block.columns) ? block.columns : [];
      for (const col of cols) flattenBlocksById(getColBlocksForMerge(col), map);
    }
  }
  return map;
}

/** Merges the Swedish block tree with the English translation by block id
 *  (recursing into columns), instead of switching between two whole arrays.
 *  A block added on the Swedish side after the last translation simply
 *  renders in Swedish until translated, rather than the whole English page
 *  falling back to a stale snapshot missing that block. */
function mergeLocalizedBlocks(svBlocks: PageBlock[], enBlocks: PageBlock[] | undefined, lang: Lang): PageBlock[] {
  if (lang !== 'en' || !enBlocks?.length) return svBlocks;
  const enById = flattenBlocksById(enBlocks, new Map());
  const merge = (block: PageBlock): PageBlock => {
    if (block.type === 'columns') {
      const cols = Array.isArray(block.columns) ? block.columns : [];
      // Campaign-only block types (EventRegistration/CampaignHero/etc.) can't
      // legally appear inside a Columns cell — same known type-shape gap as
      // the admin builder's columns handling, not something introduced here.
      const mergedCols = cols.map(col => getColBlocksForMerge(col).map(merge)) as unknown as PageBlockColumns['columns'];
      return { ...block, columns: mergedCols };
    }
    if (LANGUAGE_INDEPENDENT_BLOCK_TYPES.has(block.type)) return block;
    return enById.get(block.id) ?? block;
  };
  return svBlocks.map(merge);
}

export default function PageRenderer({ page, blogPosts = [], schedule = [], seminars = [] }: Props) {
  const lang = useLanguage();

  if (page.mode === 'html') {
    const html = (lang === 'en' && page.htmlContentEn) ? page.htmlContentEn : (page.htmlContent ?? '');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  const blocks = mergeLocalizedBlocks(page.blocks ?? [], page.blocksEn, lang);
  return (
    <div>
      {blocks.map(block => <BlockRenderer key={block.id} block={block} blogPosts={blogPosts} schedule={schedule} seminars={seminars} />)}
    </div>
  );
}

export function BlockRenderer({ block, blogPosts = [], schedule = [], seminars = [] }: { block: PageBlock; blogPosts?: NewsPost[]; schedule?: UpcomingClassPreview[]; seminars?: UpcomingSeminarPreview[] }) {
  switch (block.type) {
    case 'hero':     return <HeroBlock block={block} />;
    case 'text':     return <TextBlock block={block} />;
    case 'heading':  return <HeadingBlock block={block} />;
    case 'image':    return <ImageBlock block={block} />;
    case 'button':   return <ButtonBlock block={block} />;
    case 'html':     return <HtmlBlock block={block} />;
    case 'video':    return <VideoBlock block={block} />;
    case 'columns':  return <ColumnsBlock block={block} blogPosts={blogPosts} schedule={schedule} seminars={seminars} />;
    case 'spacer':   return <SpacerBlock block={block} />;
    case 'divider':  return <DividerBlock block={block} />;
    case 'cta':      return <CtaBlock block={block} />;
    case 'blog':     return <BlogBlockClient block={block} posts={blogPosts} />;
    case 'schedule': return <ScheduleBlockClient block={block} schedule={schedule} seminars={seminars} />;
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
