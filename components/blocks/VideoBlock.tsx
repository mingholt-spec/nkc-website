import type { PageBlockVideo } from '@/lib/types';
import VideoEmbed from './VideoEmbed';
import { spacingToStyle, hasSpacing } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS } from './blockStyle';

interface Props { block: PageBlockVideo }

function getEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export default function VideoBlock({ block }: Props) {
  const embedUrl = getEmbedUrl(block.url);
  const hasCustomPadding = hasSpacing(block.spacing);
  const sectionStyle = { ...spacingToStyle(block.spacing, undefined, { x: '24px', y: '16px' }), ...blockStyleToCSS(block.style) };
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);
  return (
    <div id={`block-${block.id}`} className={`mx-auto max-w-4xl ${hasCustomPadding ? '' : 'px-6 py-4'}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      {embedUrl ? (
        <VideoEmbed embedUrl={embedUrl} caption={block.caption} />
      ) : (
        <>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
            <video src={block.url} controls autoPlay={block.autoplay} loop={block.loop} muted={block.muted} className="w-full h-full object-cover" />
          </div>
          {block.caption && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 text-center">{block.caption}</p>}
        </>
      )}
    </div>
  );
}
