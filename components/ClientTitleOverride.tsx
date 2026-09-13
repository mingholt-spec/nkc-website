'use client';
import { useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';

interface Props {
  enTitle?: string;
}

/**
 * Patches the browser tab title for returning visitors who previously chose
 * English — without touching generateMetadata(). Reading the language cookie
 * there would force the whole route out of static rendering/ISR (verified:
 * flips "/" and "/blogg" from ○ Static to ƒ Dynamic in `next build` output),
 * which matters a lot here since fast static pages are a real SEO/ranking
 * advantage for this site. First paint / crawlers always see the Swedish
 * title from the static HTML; a JS-executing returning English visitor gets
 * it corrected within a tick of hydration. No enTitle means no English
 * variant exists for this content — leave the Swedish title as the best
 * available fallback, same as the rest of the audit's precedent.
 */
export default function ClientTitleOverride({ enTitle }: Props) {
  const lang = useLanguage();
  useEffect(() => {
    if (lang === 'en' && enTitle) document.title = enTitle;
  }, [lang, enTitle]);
  return null;
}
