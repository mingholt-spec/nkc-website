import type { PageBlockSocialFeed } from '@/lib/types';
import { safeStr } from '@/lib/utils';
import { spacingToStyle } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS, headingSizeCls, typographyToCSS } from './blockStyle';

interface Props { block: PageBlockSocialFeed }

const PLATFORM_LABELS: Record<string, string> = {
  facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube',
  tiktok: 'TikTok', x: 'X', linkedin: 'LinkedIn', whatsapp: 'WhatsApp',
};

export default function SocialFeedBlock({ block }: Props) {
  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '48px' }), ...blockStyleToCSS(block.style) };
  const typo = typographyToCSS(block.style);
  delete typo.textAlign;
  delete typo.fontSize;
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);
  const title = safeStr(block.title);
  const platformLabel = PLATFORM_LABELS[block.platform] || block.platform;

  return (
    <section id={`block-${block.id}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <div className="max-w-2xl mx-auto text-center px-6">
        {title && (
          <h2 className={`${headingSizeCls(block.titleSize, '2xl')} font-black uppercase tracking-tight mb-6 text-zinc-900 dark:text-zinc-100`} style={typo}>
            {title}
          </h2>
        )}
        {block.embedUrl ? (
          <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
            <iframe src={block.embedUrl} className="w-full" style={{ height: '500px', border: 'none' }} loading="lazy" title={`${platformLabel}-flöde`} />
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 p-10">
            <svg className="w-10 h-10 mx-auto mb-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342a4 4 0 100-2.684m0 2.684a4 4 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a4 4 0 105.367-5.367 4 4 0 00-5.367 5.367zm0 9.632a4 4 0 105.367 5.367 4 4 0 00-5.367-5.367z" /></svg>
            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300 mb-4">Följ oss på {platformLabel}</p>
            {block.profileUrl && (
              <a href={block.profileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity">
                Följ oss
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
