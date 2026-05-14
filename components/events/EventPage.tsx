import Image from 'next/image';
import type { Campaign, PageBlock } from '@/lib/types';
import { BlockRenderer } from '@/components/PageRenderer';

interface Props { campaign: Campaign }

export default function EventPage({ campaign }: Props) {
  const { pageConfig, contentBlocks, mode, htmlContent } = campaign;
  const headerImage = pageConfig.headerImage;

  return (
    <div>
      {/* Header */}
      {headerImage && (
        <div className="relative aspect-video max-h-[60vh] bg-zinc-900 overflow-hidden">
          <Image src={headerImage} alt={pageConfig.title} fill priority className="object-cover opacity-70" sizes="100vw" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/80">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">{pageConfig.title}</h1>
            {pageConfig.description && (
              <p className="mt-3 text-lg text-white/80 max-w-2xl">{pageConfig.description}</p>
            )}
          </div>
        </div>
      )}

      {!headerImage && (
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="text-4xl font-bold text-zinc-900">{pageConfig.title}</h1>
          {pageConfig.description && <p className="mt-3 text-xl text-zinc-500">{pageConfig.description}</p>}
        </div>
      )}

      {/* Content */}
      {mode === 'html' && htmlContent ? (
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      ) : (
        contentBlocks?.map((block: PageBlock) => <BlockRenderer key={block.id} block={block} />)
      )}

      {/* Event details */}
      {campaign.eventDetails && (
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="rounded-xl border border-zinc-200 p-6 bg-zinc-50">
            <h2 className="text-xl font-bold text-zinc-900 mb-4">Eventinformation</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {campaign.eventDetails.startDate && (
                <>
                  <dt className="text-zinc-500 font-medium">Datum</dt>
                  <dd className="text-zinc-800">
                    {new Date(campaign.eventDetails.startDate).toLocaleDateString('sv-SE', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </dd>
                </>
              )}
              {campaign.eventDetails.price > 0 && (
                <>
                  <dt className="text-zinc-500 font-medium">Pris</dt>
                  <dd className="text-zinc-800">{campaign.eventDetails.price} kr</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
