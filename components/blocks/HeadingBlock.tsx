import type { PageBlockHeading } from '@/lib/types';
interface Props { block: PageBlockHeading }
const sizeMap: Record<string, string> = {
  xs: 'text-lg', sm: 'text-xl', base: 'text-2xl', lg: 'text-3xl',
  xl: 'text-4xl', '2xl': 'text-5xl', '3xl': 'text-6xl', '4xl': 'text-7xl',
};
const Tag = ({ level, ...props }: { level: number } & React.HTMLAttributes<HTMLHeadingElement>) => {
  const H = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return <H {...props} />;
};
export default function HeadingBlock({ block }: Props) {
  const sizeClass = sizeMap[block.size ?? 'xl'] ?? 'text-4xl';
  return (
    <div className="mx-auto max-w-4xl px-6 py-4" style={{ textAlign: block.align ?? 'left' }}>
      <Tag level={block.level ?? 2} className={`font-bold ${sizeClass}`} style={{ color: block.color }}>
        {block.text}
      </Tag>
    </div>
  );
}
