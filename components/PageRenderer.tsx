import type { WebsitePage, PageBlock } from '@/lib/types';
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

interface Props { page: WebsitePage }

export default function PageRenderer({ page }: Props) {
  if (page.mode === 'html' && page.htmlContent) {
    return <div dangerouslySetInnerHTML={{ __html: page.htmlContent }} />;
  }

  return (
    <div>
      {(page.blocks ?? []).map(block => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

export function BlockRenderer({ block }: { block: PageBlock }) {
  switch (block.type) {
    case 'hero':     return <HeroBlock block={block} />;
    case 'text':     return <TextBlock block={block} />;
    case 'heading':  return <HeadingBlock block={block} />;
    case 'image':    return <ImageBlock block={block} />;
    case 'button':   return <ButtonBlock block={block} />;
    case 'html':     return <HtmlBlock block={block} />;
    case 'video':    return <VideoBlock block={block} />;
    case 'columns':  return <ColumnsBlock block={block} />;
    case 'spacer':   return <SpacerBlock block={block} />;
    case 'divider':  return <DividerBlock block={block} />;
    case 'cta':      return <CtaBlock block={block} />;
    case 'form':     return null; // Forms rendered client-side
    case 'blog':     return null; // Blog block server-rendered separately
    default:         return null;
  }
}
