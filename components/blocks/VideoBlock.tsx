import type { PageBlockVideo } from '@/lib/types';
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
  return (
    <div className="mx-auto max-w-4xl px-6 py-4">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
        {embedUrl ? (
          <iframe src={embedUrl} title={block.caption ?? 'Video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
        ) : (
          <video src={block.url} controls autoPlay={block.autoplay} loop={block.loop} muted={block.muted} className="w-full h-full object-cover" />
        )}
      </div>
      {block.caption && <p className="mt-2 text-sm text-zinc-400 text-center">{block.caption}</p>}
    </div>
  );
}
