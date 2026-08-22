import type { PageBlockSpacer } from '@/lib/types';
import { spacingToStyle } from './blockSpacing';
import { blockStyleToCSS } from './blockStyle';
interface Props { block: PageBlockSpacer }
const heightMap = { sm: 'h-8', md: 'h-16', lg: 'h-24', xl: 'h-32' };
export default function SpacerBlock({ block }: Props) {
  const sectionStyle = { ...spacingToStyle(block.spacing), ...blockStyleToCSS(block.style) };
  return <div className={heightMap[block.height ?? 'md']} style={sectionStyle} aria-hidden />;
}
