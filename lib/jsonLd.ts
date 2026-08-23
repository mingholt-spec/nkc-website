import type { ClubConfig, WebsiteConfig, NewsPost, Campaign, PageBlock, PageBlockAccordion } from './types';

/** Bas-URL för alla @id/url-fält i schemat — matchar canonical-URL:erna som redan används i generateMetadata. */
const SITE_URL = 'https://www.nkc.nu';

/**
 * Sajtens organisationsidentitet — visas sitewide (root layout).
 * Dubbel @type ["SportsClub","ExerciseGym"] är avsiktligt: SportsClub är
 * semantiskt korrekt (det är en klubb, inte ett vanligt gym), men bara
 * LocalBusiness-subtyper som ExerciseGym gör att Google behandlar
 * adress/telefon som en riktig lokal verksamhet (Maps/local pack).
 * Returnerar null om klubbnamn saknas — inget påhittat schema.
 */
export function buildSportsClubSchema(club: ClubConfig, config: WebsiteConfig | null): Record<string, unknown> | null {
  if (!club.clubName) return null;

  const address = (club.address && club.city) ? {
    '@type': 'PostalAddress',
    streetAddress: club.address,
    addressLocality: club.city,
    ...(club.postalCode ? { postalCode: club.postalCode } : {}),
    addressCountry: club.country || 'SE',
  } : undefined;

  const sameAs = (config?.socialLinks || []).map(s => s.url).filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': ['SportsClub', 'ExerciseGym'],
    name: club.clubName,
    url: SITE_URL,
    ...(club.logoUrl ? { logo: club.logoUrl, image: club.logoUrl } : {}),
    ...(club.phone ? { telephone: club.phone } : {}),
    ...(club.email ? { email: club.email } : {}),
    ...(address ? { address } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/**
 * Lättviktig sitewide WebSite-identitet. Inkluderar INTE en
 * potentialAction/SearchAction (sitelinks-sökrutan i Google) eftersom
 * sajten inte har en riktig sökfunktion — att låtsas den finns skulle
 * bara ge trasiga sökresultat.
 */
export function buildWebSiteSchema(club: ClubConfig): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: club.clubName || 'NKC',
    url: SITE_URL,
  };
}

export function buildBlogPostingSchema(post: NewsPost, canonicalUrl: string, club: ClubConfig): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(post.coverImage ? { image: post.coverImage } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    ...(post.author ? { author: { '@type': 'Person', name: post.author } } : {}),
    publisher: {
      '@type': 'Organization',
      name: club.clubName || 'NKC',
      ...(club.logoUrl ? { logo: { '@type': 'ImageObject', url: club.logoUrl } } : {}),
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    url: canonicalUrl,
  };
}

/** Returnerar null om kampanjen saknar eventDetails.startDate — bara riktiga event får Event-schema. */
export function buildEventSchema(campaign: Campaign, canonicalUrl: string, club: ClubConfig): Record<string, unknown> | null {
  const details = campaign.eventDetails;
  if (!details?.startDate) return null;

  const address = (club.address && club.city) ? {
    '@type': 'PostalAddress',
    streetAddress: club.address,
    addressLocality: club.city,
    ...(club.postalCode ? { postalCode: club.postalCode } : {}),
    addressCountry: club.country || 'SE',
  } : undefined;

  const image = campaign.shareImage || campaign.pageConfig.headerImage;

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: campaign.pageConfig.title,
    ...(campaign.pageConfig.description ? { description: campaign.pageConfig.description } : {}),
    startDate: details.startDate,
    ...(details.endDate ? { endDate: details.endDate } : {}),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: club.clubName || 'NKC',
      ...(address ? { address } : {}),
    },
    ...(image ? { image } : {}),
    offers: {
      '@type': 'Offer',
      price: details.price,
      priceCurrency: 'SEK',
      availability: 'https://schema.org/InStock',
      url: canonicalUrl,
    },
    organizer: { '@type': 'Organization', name: club.clubName || 'NKC', url: SITE_URL },
  };
}

/**
 * Letar accordion-block i sidans blocks-array och mappar dem till
 * FAQPage-schema. Returnerar null om sidan inte har några (riktiga,
 * ifyllda) FAQ-block — inget tomt/påhittat schema.
 */
export function buildFAQPageSchema(blocks: PageBlock[] | undefined): Record<string, unknown> | null {
  if (!blocks || blocks.length === 0) return null;

  const accordionBlocks = blocks.filter((b): b is PageBlockAccordion => b.type === 'accordion');
  const questions = accordionBlocks
    .flatMap(b => b.items)
    .filter(item => item.question?.trim() && item.answer?.trim());

  if (questions.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export interface BreadcrumbItem { name: string; url: string }

export function buildBreadcrumbListSchema(items: BreadcrumbItem[]): Record<string, unknown> | null {
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
