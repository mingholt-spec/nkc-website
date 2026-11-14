/**
 * Dagkombinationer för flerdagarsevent — mirrors bjj-premium's
 * utils/dayCombos.ts (prisberäknings-delen; kombinations-GENERERING för
 * admin-tabellen lever bara i bjj-premium, admin redigerar aldrig kampanjer
 * härifrån). Ren funktion, inga React-beroenden.
 *
 * `comboKey` är de valda datumen sorterade och kommaseparerade — samma
 * format som formulärets dagväljare skickar i `attendingDays`.
 */

export function comboKeyFromDates(dates: string[]): string {
  return [...dates].sort().join(',');
}

export function comboKeyFromAttendingDays(attendingDays: string | undefined): string {
  if (!attendingDays) return '';
  return comboKeyFromDates(attendingDays.split(',').filter(Boolean));
}

/** Slår upp rätt pris för den valda dagkombinationen. Faller tillbaka på
 *  `flatPrice` (dagens beteende) om inga pris-per-kombination är satta, eller
 *  om just den kombinationen saknar en egen rad. */
export function resolveComboPrice(
  attendingDays: string | undefined,
  dayComboPricing: { comboKey: string; price: number }[] | undefined,
  flatPrice: number,
): number {
  if (!dayComboPricing || dayComboPricing.length === 0) return flatPrice;
  const comboKey = comboKeyFromAttendingDays(attendingDays);
  const match = dayComboPricing.find(row => row.comboKey === comboKey);
  return match ? match.price : flatPrice;
}
