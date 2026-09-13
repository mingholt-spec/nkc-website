import { cookies } from 'next/headers';
import type { Lang } from './language-context';

/**
 * Server-side counterpart to useLanguage()/useStoredLanguage(). The site's
 * only language mechanism is client-side (localStorage, set by
 * PublicLayoutClient's toggleLanguage) — anything rendered on the server
 * before hydration (metadata, JSON-LD, fully server-rendered pages like
 * /bekrafta) has no way to know the visitor's language without this cookie,
 * which toggleLanguage mirrors alongside localStorage for exactly this
 * purpose. Absent for first-time visitors, shared links, and crawlers —
 * defaults to 'sv', identical to today's behavior for those cases.
 */
export async function getServerLanguage(): Promise<Lang> {
  const store = await cookies();
  return store.get('flowroll_lang')?.value === 'en' ? 'en' : 'sv';
}
