// Shared public types (subset of bjj-premium/types.ts)

export type SpacingSize = '0' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type BlockSpacing = { top?: SpacingSize; right?: SpacingSize; bottom?: SpacingSize; left?: SpacingSize };
export type BlockBase = { name?: string };
export type HeadingSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

export type BlockStyleOptions = {
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
  style?: BlockStyleOptions; spacing?: BlockSpacing;
};

export type PageBlockHeading = {
  id: string; type: 'heading'; name?: string;
  text: string; level?: 1 | 2 | 3 | 4 | 5 | 6;
  color?: string; align?: 'left' | 'center' | 'right';
  size?: HeadingSize; style?: BlockStyleOptions; spacing?: BlockSpacing;
};

export type PageBlockText = {
  id: string; type: 'text'; name?: string;
  content: string;
  style?: BlockStyleOptions; spacing?: BlockSpacing;
};

export type PageBlockImage = {
  id: string; type: 'image'; name?: string;
  src: string; alt?: string; caption?: string;
  width?: string;
  rounded?: boolean; shadow?: boolean;
  style?: BlockStyleOptions; spacing?: BlockSpacing;
};

export type PageBlockButton = {
  id: string; type: 'button'; name?: string;
  text: string; url: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
  style?: BlockStyleOptions; spacing?: BlockSpacing;
};

export type PageBlockDivider = {
  id: string; type: 'divider'; name?: string;
  style?: BlockStyleOptions; spacing?: BlockSpacing;
};

export type PageBlockSpacer = {
  id: string; type: 'spacer'; name?: string;
  height?: 'sm' | 'md' | 'lg' | 'xl';
  style?: BlockStyleOptions; spacing?: BlockSpacing;
};

export type PageBlockCta = {
  id: string; type: 'cta'; name?: string;
  title: string; subtitle?: string;
  buttonText: string; buttonUrl: string;
  backgroundImage?: string; backgroundColor?: string;
  style?: BlockStyleOptions; spacing?: BlockSpacing;
};

export type PageBlockHtml = {
  id: string; type: 'html'; name?: string;
  code: string;
  style?: BlockStyleOptions; spacing?: BlockSpacing;
};

export type PageBlockBlog = {
  id: string; type: 'blog'; name?: string;
  title?: string; count?: number; category?: string;
  style?: BlockStyleOptions; spacing?: BlockSpacing;
};

export type PageBlockVideo = {
  id: string; type: 'video'; name?: string;
  url: string; caption?: string;
  autoplay?: boolean; loop?: boolean; muted?: boolean;
  style?: BlockStyleOptions; spacing?: BlockSpacing;
};

export type FormFieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number' | 'file' | 'hidden';

export interface FormField {
  id: string; type: FormFieldType; label: string;
  placeholder?: string; required?: boolean;
  options?: string[];
  validation?: { minLength?: number; maxLength?: number; pattern?: string };
  defaultValue?: string;
  width?: 'full' | 'half';
}

export interface FormBlock {
  id: string; type: 'form'; name?: string;
  title?: string; description?: string;
  fields: FormField[];
  submitLabel?: string;
  successMessage?: string;
  redirectUrl?: string;
  emailNotification?: string;
  style?: BlockStyleOptions; spacing?: BlockSpacing;
}

export type PageBlockLeaf =
  | PageBlockHero | PageBlockHeading | PageBlockText | PageBlockImage
  | PageBlockButton | PageBlockDivider | PageBlockSpacer | PageBlockCta
  | PageBlockHtml | PageBlockBlog | PageBlockVideo;

export type PageBlockColumns = {
  id: string; type: 'columns'; name?: string;
  columns: PageBlockLeaf[][];
  columnCount?: 2 | 3 | 4;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  style?: BlockStyleOptions; spacing?: BlockSpacing;
};

export type PageBlock = PageBlockLeaf | PageBlockColumns | FormBlock;

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
  pageConfig: {
    title: string; description: string;
    headerImage?: string; instructor?: string;
    metaTitle?: string; metaDescription?: string;
    titleSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  };
  contentBlocks?: PageBlock[];
  formLayout?: 'stacked' | 'sidebar';
  formConfig: CampaignFormField[];
  eventDetails?: {
    price: number; maxAttendees: number;
    startDate: string; endDate?: string;
    schedule: CampaignScheduleDay[]; classId: string;
    paymentLink?: string; stripePriceId?: string;
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
