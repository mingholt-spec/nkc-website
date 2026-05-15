import type { Campaign, PageBlock } from '@/lib/types';
import { BlockRenderer } from '@/components/PageRenderer';
import EventPageClient from './EventPageClient';

interface Props { campaign: Campaign }

export default function EventPage({ campaign }: Props) {
  const { contentBlocks, mode, htmlContent, pageConfig } = campaign;

  // HTML/iframe mode — handled entirely client-side
  if (mode === 'html' && htmlContent) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <iframe
          srcDoc={htmlContent}
          sandbox="allow-scripts allow-forms allow-same-origin"
          style={{ width: '100%', minHeight: '100vh', border: 'none', display: 'block' }}
          title={pageConfig.title}
        />
      </div>
    );
  }

  // Render content blocks on the server (avoids pulling firebase-admin into client bundle)
  const renderedBlocks = Array.isArray(contentBlocks) && contentBlocks.length > 0
    ? contentBlocks.map((block: PageBlock) => <BlockRenderer key={block.id} block={block} />)
    : pageConfig.description
      ? <p className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 text-zinc-600 dark:text-zinc-400 leading-relaxed text-base sm:text-lg font-medium">{pageConfig.description}</p>
      : null;

  return (
    <EventPageClient campaign={campaign}>
      {renderedBlocks}
    </EventPageClient>
  );
}
