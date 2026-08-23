// Shared public types (subset of bjj-premium/types.ts)

export type SpacingSize = '0' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type BlockSpacing = { top?: SpacingSize; right?: SpacingSize; bottom?: SpacingSize; left?: SpacingSize };
export type BlockBase = { name?: string };
export type HeadingSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

/** Bas-fälten för ett blocks stil — se BlockStyleOptions (samma shape återanvänds för hover/responsive, en nivå djupt). */
export type BlockStyleBase = {
  borderWidth?: '0' | '1' | '2' | '3' | '4';
  borderColor?: string;
  borderRadius?: '0' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  backgroundColor?: string;
  headlineColor?: string;
  textShadow?: 'none' | 'sm' | 'md' | 'lg' | 'glow';
  textOutline?: boolean;
  textOutlineColor?: string;
  textOutlineWidth?: '1' | '2' | '3';
  textOutlineTarget?: 'all' | 'title' | 'subtitle';
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: HeadingSize;
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
  letterSpacing?: 'tight' | 'normal' | 'wide' | 'wider';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
};

export type BlockStyleOptions = BlockStyleBase & {
  /** Stil som appliceras bara vid :hover (samma fält-shape som grundstilen). */
  hover?: BlockStyleBase;
  /** Stil-overrides per brytpunkt (mobil ≤768px, surfplatta ≤1024px). */
  responsive?: { mobile?: BlockStyleBase; tablet?: BlockStyleBase };
};

export type PageBlockHero = {
  id: string; type: 'hero'; name?: string;
  title: string; subtitle?: string;
  backgroundImage?: string; backgroundVideo?: string; backgroundOverlay?: number;
  backgroundPosition?: string;
  height?: 'sm' | 'md' | 'lg' | 'full';
  textAlign?: 'left' | 'center' | 'right';
  ctaText?: string; ctaUrl?: string; ctaStyle?: string;
  secondaryCtaText?: string; secondaryCtaUrl?: string;
  titleColor?: string; subtitleColor?: string; ctaColor?: string;
  titleSize?: HeadingSize; subtitleSize?: HeadingSize;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockHeading = {
  id: string; type: 'heading'; name?: string;
  text: string; level?: 1 | 2 | 3 | 4 | 5 | 6;
  textColor?: string; align?: 'left' | 'center' | 'right';
  fontSize?: HeadingSize; style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockText = {
  id: string; type: 'text'; name?: string;
  content: string;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockImage = {
  id: string; type: 'image'; name?: string;
  src: string; alt?: string; caption?: string;
  width?: string;
  rounded?: boolean; shadow?: boolean;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockButton = {
  id: string; type: 'button'; name?: string;
  text: string; url: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockDivider = {
  id: string; type: 'divider'; name?: string;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockSpacer = {
  id: string; type: 'spacer'; name?: string;
  height?: 'sm' | 'md' | 'lg' | 'xl';
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockCta = {
  id: string; type: 'cta'; name?: string;
  title: string; subtitle?: string;
  buttonText: string; buttonUrl: string;
  backgroundImage?: string; backgroundColor?: string;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockHtml = {
  id: string; type: 'html'; name?: string;
  code: string;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockBlog = {
  id: string; type: 'blog'; name?: string;
  title?: string; titleSize?: HeadingSize; titleAlign?: 'left' | 'center' | 'right';
  postsToShow?: number;
  layout?: 'grid' | 'list';
  showExcerpt?: boolean; showCoverImage?: boolean; showDate?: boolean; showAuthor?: boolean;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockVideo = {
  id: string; type: 'video'; name?: string;
  url: string; caption?: string;
  title?: string; titleSize?: HeadingSize; maxWidth?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  rounded?: boolean; shadow?: boolean;
  autoplay?: boolean; loop?: boolean; muted?: boolean;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export interface LeadFormField {
  id: string;
  /** Stable machine key — set once when the field is created, never changes
   *  even if the label is edited later. 'email' is reserved for the
   *  required contact-email field; 'guardianInfo'-type fields ignore this
   *  in favor of fixed sub-keys (guardianName/guardianEmail/guardianPhone). */
  key: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'guardianInfo';
  label: string;
  placeholder?: string;
  required?: boolean;
}

export type PageBlockLeadForm = {
  id: string; type: 'leadForm'; name?: string;
  title?: string; description?: string;
  fields: LeadFormField[];
  submitLabel?: string; successMessage?: string;
  /** Tags applied to the lead created on submit. */
  tags?: string[];
  /** If set, navigates the visitor here right after a successful submit
   *  instead of showing successMessage inline. Used to chain funnel steps. */
  redirectUrl?: string;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

/** Marker block — no own content. Renders the campaign's existing
 *  registration/waitlist card (schedule, price, Stripe, waitlist) at the
 *  position in `contentBlocks` where this block is placed, instead of a
 *  fixed layout position. Only meaningful inside a campaign event page. */
export type PageBlockEventRegistration = {
  id: string; type: 'eventRegistration'; name?: string;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

/** Marker block — campaign hero banner (image, title, instructor). No own
 *  content, reads from campaign.pageConfig. */
export type PageBlockCampaignHero = {
  id: string; type: 'campaignHero'; name?: string;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

/** Marker block — schedule/price/spots-left row. No own content, reads
 *  from campaign.eventDetails. */
export type PageBlockCampaignQuickInfo = {
  id: string; type: 'campaignQuickInfo'; name?: string;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

/** Marker block — share buttons (Facebook/X/WhatsApp/copy link). */
export type PageBlockShareButtons = {
  id: string; type: 'shareButtons'; name?: string;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export interface TestimonialItem {
  id: string;
  quote: string;
  authorName: string;
  authorRole?: string;
  authorImage?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
}

export type PageBlockTestimonial = {
  id: string; type: 'testimonial'; name?: string;
  title?: string; titleSize?: HeadingSize;
  items: TestimonialItem[];
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  interval?: string;
  features: string[];
  highlighted?: boolean;
  buttonText?: string;
  buttonUrl?: string;
}

export type PageBlockPricing = {
  id: string; type: 'pricing'; name?: string;
  title?: string; titleSize?: HeadingSize;
  tiers: PricingTier[];
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

export type PageBlockAccordion = {
  id: string; type: 'accordion'; name?: string;
  title?: string; titleSize?: HeadingSize;
  items: AccordionItem[];
  allowMultipleOpen?: boolean;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockQuote = {
  id: string; type: 'quote'; name?: string;
  text: string;
  author?: string;
  role?: string;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockCountdown = {
  id: string; type: 'countdown'; name?: string;
  title?: string; titleSize?: HeadingSize;
  targetDate: string;
  expiredText?: string;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockBadge = {
  id: string; type: 'badge'; name?: string;
  text: string;
  backgroundColor?: string; textColor?: string;
  align?: 'left' | 'center' | 'right';
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockInstructor = {
  id: string; type: 'instructor'; name?: string;
  instructorName: string;
  role?: string;
  image?: string;
  bio?: string;
  socialLinks?: SocialLink[];
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export interface ProgressStep {
  id: string;
  label: string;
}

export type PageBlockProgress = {
  id: string; type: 'progress'; name?: string;
  steps: ProgressStep[];
  currentStep: number;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export interface GalleryImage {
  id: string;
  src: string;
  alt?: string;
  caption?: string;
}

export type PageBlockGallery = {
  id: string; type: 'gallery'; name?: string;
  title?: string; titleSize?: HeadingSize;
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export interface TabItem {
  id: string;
  label: string;
  content: string;
}

export type PageBlockTabs = {
  id: string; type: 'tabs'; name?: string;
  tabs: TabItem[];
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockSocialFeed = {
  id: string; type: 'socialFeed'; name?: string;
  title?: string; titleSize?: HeadingSize;
  platform: SocialPlatform;
  profileUrl: string;
  embedUrl?: string;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockMap = {
  id: string; type: 'map'; name?: string;
  title?: string; titleSize?: HeadingSize;
  address?: string;
  embedUrl?: string;
  height?: string;
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlockLeaf =
  | PageBlockHero | PageBlockHeading | PageBlockText | PageBlockImage
  | PageBlockButton | PageBlockDivider | PageBlockSpacer | PageBlockCta
  | PageBlockHtml | PageBlockBlog | PageBlockVideo | PageBlockLeadForm
  | PageBlockTestimonial | PageBlockPricing | PageBlockAccordion | PageBlockQuote
  | PageBlockCountdown | PageBlockBadge | PageBlockInstructor | PageBlockProgress
  | PageBlockGallery | PageBlockTabs | PageBlockSocialFeed | PageBlockMap;

/** Vad en Kolumner-cell kan innehålla — ett vanligt block eller ett nästlat Kolumner-block. */
export type ColumnCellBlock = PageBlockLeaf | PageBlockColumns;

export type PageBlockColumns = {
  id: string; type: 'columns'; name?: string;
  /** En cell kan innehålla vanliga block ELLER ett nästlat Kolumner-block
   *  (kort-i-kort, sektioner-i-sektioner) — genuint rekursivt. */
  columns: ColumnCellBlock[][];
  columnCount?: 2 | 3 | 4;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  style?: BlockStyleOptions; padding?: BlockSpacing; margin?: BlockSpacing;
};

export type PageBlock = PageBlockLeaf | PageBlockColumns | PageBlockEventRegistration
  | PageBlockCampaignHero | PageBlockCampaignQuickInfo | PageBlockShareButtons;

export interface NewsPost {
  id: string; title: string; content: string;
  authorId: string; author?: string;
  createdAt: string; publishedAt?: string;
  isPinned: boolean;
  coverImage?: string; coverImagePosition?: string;
  coverImageHeight?: 'sm' | 'md' | 'lg' | 'full';
  excerpt?: string; slug?: string;
  isPublished?: boolean; tags?: string[];
  category?: string; updatedAt?: string;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  showBanners?: boolean;
  metaTitle?: string; metaDescription?: string;
  titleEn?: string; contentEn?: string; excerptEn?: string;
}

export interface WebsitePage {
  id: string; title: string; slug: string;
  mode?: 'blocks' | 'html';
  isHomepage: boolean; isPublished: boolean;
  metaTitle?: string; metaDescription?: string; ogImage?: string;
  blocks: PageBlock[];
  htmlContent?: string;
  createdAt: string; updatedAt: string; sortOrder: number;
  titleEn?: string; metaTitleEn?: string; metaDescriptionEn?: string;
  blocksEn?: PageBlock[]; htmlContentEn?: string;
}

export interface NavigationItem {
  id: string; label: string; labelEn?: string;
  pageId?: string; anchorBlockId?: string;
  isExternal?: boolean; externalUrl?: string;
  children?: NavigationItem[];
}

export interface WebsiteTheme {
  primaryColor: string; secondaryColor: string;
  backgroundColor: string; textColor: string;
  headingFont: string; bodyFont: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  maxWidth: '960px' | '1024px' | '1280px' | '1440px';
  darkMode?: 'off' | 'on' | 'user';
  darkBackground?: string; darkTextColor?: string;
}

export type SocialPlatform = 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'x' | 'linkedin' | 'whatsapp';
export interface SocialLink { platform: SocialPlatform; url: string }

export interface BlogBanner {
  id: string; title: string;
  imageUrl?: string; linkUrl?: string; htmlCode?: string;
  position: 'sidebar' | 'inline'; isActive: boolean;
}

export interface WebsiteConfig {
  theme: WebsiteTheme;
  navigation: NavigationItem[];
  seoDefaults?: { title?: string; description?: string; ogImage?: string };
  headerConfig?: { logoUrl?: string; showClubName?: boolean; sticky?: boolean };
  footerConfig?: { text?: string; links?: { label: string; url: string }[]; showPoweredBy?: boolean; showClubInfo?: boolean };
  socialLinks?: SocialLink[];
  socialDisplay?: { header?: boolean; footer?: boolean; pages?: boolean };
  socialIconStyle?: 'mono' | 'color';
  blogConfig?: { sidebarEnabled?: boolean; banners?: BlogBanner[] };
  analytics?: { measurementId?: string; enableBuiltIn?: boolean };
  integrations?: {
    facebookPixelId?: string;
    googleTagManagerId?: string;
    headScript?: string;
    bodyScript?: string;
    chatWidgetScript?: string;
    chatWidgetEnabled?: boolean;
  };
  customDomain?: { domain: string; redirectDomain?: string; status: string };
}

export interface ClubConfig {
  clubName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  logoUrl?: string;
  faviconUrl?: string;
  websiteEnabled?: boolean;
  showClubInfoInFooter?: boolean;
  organization_number?: string;
  country?: string;
}

export interface CampaignFormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'guardianInfo';
  name: string;
  label: string;
  required: boolean;
}

export interface CampaignScheduleDay {
  date: string;
  time: string;
  endTime?: string;
}

export interface Campaign {
  id: string; name: string; slug: string;
  goal: 'event' | 'leadCapture';
  tags?: string[]; accentColor?: string; shareImage?: string;
  registrationCount?: number;
  waitlistEnabled?: boolean;
  waitlistCount?: number;
  pageConfig: {
    title: string; description: string;
    headerImage?: string; instructor?: string;
    metaTitle?: string; metaDescription?: string;
    titleSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  };
  contentBlocks?: PageBlock[];
  formLayout?: 'stacked' | 'sidebar';
  formConfig: CampaignFormField[];
  submitButtonText?: string;
  formHeading?: string;
  /** 'light' forces the registration form to stay light even on a dark page design
   *  or with the site's dark mode toggled on. 'auto' (default) follows the site theme. */
  formTheme?: 'auto' | 'light';
  eventDetails?: {
    price: number; maxAttendees: number;
    startDate: string; endDate?: string;
    schedule: CampaignScheduleDay[]; classId: string;
    paymentLink?: string; stripePriceId?: string;
    registrationCloseDate?: string;
  };
  guestInstructorInviteId?: string;
  guestProducts?: string[];
  guestInstructorName?: string;
  guestPaymentInfo?: string;
  useStripeForMerch?: boolean;
  mode?: 'blocks' | 'html';
  htmlContent?: string;
  contentBlocksEn?: PageBlock[];
  htmlContentEn?: string;
  pageConfig_titleEn?: string;
  pageConfig_descriptionEn?: string;
}
