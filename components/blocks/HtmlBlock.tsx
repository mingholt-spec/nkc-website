import type { PageBlockHtml } from '@/lib/types';
import { safeStr } from '@/lib/utils';

interface Props { block: PageBlockHtml }

export default function HtmlBlock({ block }: Props) {
  const html = safeStr(block.code);
  if (!html) return null;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
