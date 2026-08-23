import type { PageBlockVideo } from '@/lib/types';
import VideoEmbed from './VideoEmbed';
import { spacingToStyle, hasSpacing } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS } from './blockStyle';

interface Props { block: PageBlockVideo }

const ASPECT_MAP: Record<string, string> = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
};

const TITLE_SIZE_MAP: Record<string, string> = { xs: 'text-base', sm: 'text-lg', base: 'text-xl', lg: 'text-2xl', xl: 'text-3xl', '2xl': 'text-4xl', '3xl': 'text-5xl', '4xl': 'text-6xl' };

function getEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export default function VideoBlock({ block }: Props) {
  const embedUrl = getEmbedUrl(block.url);
  const hasCustomPadding = hasSpacing(block.padding);
  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '16px' }), ...blockStyleToCSS(block.style) };
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);
  const aspectClass = ASPECT_MAP[block.aspectRatio ?? '16:9'] ?? 'aspect-video';
  const rounded = block.rounded !== false;
  const shadow = block.shadow === true;
  const titleSizeClass = TITLE_SIZE_MAP[block.titleSize ?? 'lg'] ?? 'text-2xl';

  return (
    <div id={`block-${block.id}`} className={`mx-auto ${hasCustomPadding ? '' : 'px-6 py-4'}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <div className="mx-auto" style={{ maxWidth: block.maxWidth || '768px' }}>
        {block.title && (
          <h3 className={`${titleSizeClass} font-black uppercase tracking-tight mb-4 text-zinc-900 dark:text-white`}>
            {block.title}
          </h3>
        )}
        {embedUrl ? (
          <VideoEmbed embedUrl={embedUrl} caption={block.caption} aspectClass={aspectClass} rounded={rounded} shadow={shadow} />
        ) : (
          <>
            <div className={`relative ${aspectClass} overflow-hidden bg-zinc-900 ${rounded ? 'rounded-xl' : ''} ${shadow ? 'shadow-lg' : ''}`}>
              <video src={block.url} controls autoPlay={block.autoplay} loop={block.loop} muted={block.muted} className="w-full h-full object-cover" />
            </div>
            {block.caption && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 text-center">{block.caption}</p>}
          </>
        )}
      </div>
    </div>
  );
}
