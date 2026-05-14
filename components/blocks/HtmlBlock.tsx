import type { PageBlockHtml } from '@/lib/types';
interface Props { block: PageBlockHtml }
export default function HtmlBlock({ block }: Props) {
  return <div dangerouslySetInnerHTML={{ __html: block.content }} />;
}
