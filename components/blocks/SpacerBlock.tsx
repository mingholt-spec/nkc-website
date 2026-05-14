import type { PageBlockSpacer } from '@/lib/types';
interface Props { block: PageBlockSpacer }
const heightMap = { sm: 'h-8', md: 'h-16', lg: 'h-24', xl: 'h-32' };
export default function SpacerBlock({ block }: Props) {
  return <div className={heightMap[block.height ?? 'md']} aria-hidden />;
}
