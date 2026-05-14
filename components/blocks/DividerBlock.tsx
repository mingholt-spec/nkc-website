import type { PageBlockDivider } from '@/lib/types';
interface Props { block: PageBlockDivider }
export default function DividerBlock({ block: _ }: Props) {
  return <div className="mx-auto max-w-4xl px-6 py-2"><hr className="border-zinc-200" /></div>;
}
