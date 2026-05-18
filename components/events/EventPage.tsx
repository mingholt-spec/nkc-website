import type { Campaign } from '@/lib/types';
import EventPageClient from './EventPageClient';

interface Props { campaign: Campaign }

export default function EventPage({ campaign }: Props) {
  const { mode, htmlContent, pageConfig } = campaign;

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

  return <EventPageClient campaign={campaign} />;
}
