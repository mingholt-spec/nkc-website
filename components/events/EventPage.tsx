import Image from 'next/image';
import Link from 'next/link';
import type { Campaign, PageBlock } from '@/lib/types';
import { BlockRenderer } from '@/components/PageRenderer';

interface Props { campaign: Campaign }

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('sv-SE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function RegistrationCard({ campaign }: { campaign: Campaign }) {
  const accent = campaign.accentColor ?? '#e50401';
  const price = campaign.eventDetails?.price;
  const startDate = campaign.eventDetails?.startDate;
  const maxAttendees = campaign.eventDetails?.maxAttendees;
  const paymentLink = campaign.eventDetails?.paymentLink;
  const registrationUrl = paymentLink ?? `https://bjj-manager-pro.web.app`;

  return (
    <div
      className="rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl p-6 space-y-5"
      style={{ borderTopColor: accent, borderTopWidth: '3px' }}
    >
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Anmälan</h3>

      {startDate && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-1">Datum</p>
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 capitalize">{formatDate(startDate)}</p>
        </div>
      )}

      {price !== undefined && price > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-1">Pris</p>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">{price} <span className="text-base font-semibold text-zinc-500">kr</span></p>
        </div>
      )}

      {maxAttendees && maxAttendees > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-1">Platser</p>
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{maxAttendees} platser</p>
        </div>
      )}

      <a
        href={registrationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 rounded-xl text-center text-sm font-black uppercase tracking-widest text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: accent }}
      >
        Anmäl dig
      </a>

      <p className="text-xs text-center text-zinc-400 dark:text-zinc-500">
        Anmälan sker i vårt medlemssystem
      </p>
    </div>
  );
}

export default function EventPage({ campaign }: Props) {
  const { pageConfig, contentBlocks, mode, htmlContent } = campaign;
  const headerImage = pageConfig.headerImage;
  const isSidebar = campaign.formLayout === 'sidebar';
  const hasRegistration = !!(campaign.eventDetails || (campaign.formConfig && campaign.formConfig.length > 0));

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
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">{pageConfig.title}</h1>
          {pageConfig.description && <p className="mt-3 text-xl text-zinc-500 dark:text-zinc-400">{pageConfig.description}</p>}
        </div>
      )}

      {/* Content + optional sidebar */}
      {isSidebar && hasRegistration ? (
        <div className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Left: content */}
          <div className="min-w-0">
            {mode === 'html' && htmlContent ? (
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            ) : (
              Array.isArray(contentBlocks) && contentBlocks.map((block: PageBlock) => <BlockRenderer key={block.id} block={block} />)
            )}
          </div>

          {/* Right: sticky registration card */}
          <div className="lg:sticky lg:top-24">
            <RegistrationCard campaign={campaign} />
          </div>
        </div>
      ) : (
        <>
          {mode === 'html' && htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          ) : (
            Array.isArray(contentBlocks) && contentBlocks.map((block: PageBlock) => <BlockRenderer key={block.id} block={block} />)
          )}
        </>
      )}

      {/* Event details (only when NOT sidebar — sidebar shows these in the card) */}
      {!isSidebar && campaign.eventDetails && (
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 bg-zinc-50 dark:bg-zinc-800/50">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Eventinformation</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {campaign.eventDetails.startDate && (
                <>
                  <dt className="text-zinc-500 dark:text-zinc-400 font-medium">Datum</dt>
                  <dd className="text-zinc-800 dark:text-zinc-200 capitalize">{formatDate(campaign.eventDetails.startDate)}</dd>
                </>
              )}
              {campaign.eventDetails.price > 0 && (
                <>
                  <dt className="text-zinc-500 dark:text-zinc-400 font-medium">Pris</dt>
                  <dd className="text-zinc-800 dark:text-zinc-200">{campaign.eventDetails.price} kr</dd>
                </>
              )}
            </dl>
            {(campaign.eventDetails.paymentLink || campaign.formConfig?.length > 0) && (
              <div className="mt-6">
                <a
                  href={campaign.eventDetails.paymentLink ?? 'https://bjj-manager-pro.web.app'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 rounded-lg text-white font-bold text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: campaign.accentColor ?? '#e50401' }}
                >
                  Anmäl dig
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="mx-auto max-w-4xl px-6 pb-12">
        <Link
          href="/event"
          className="inline-flex items-center gap-2 text-sm font-bold transition-colors hover:opacity-80"
          style={{ color: campaign.accentColor ?? '#e50401' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Tillbaka till event
        </Link>
      </div>
    </div>
  );
}
