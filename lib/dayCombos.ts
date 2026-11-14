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

export interface ComboPriceRow {
  comboKey: string;
  price: number;
  memberPrice?: number;
}

/** Slår upp rätt pris för den valda dagkombinationen OCH medlemskapsstatus.
 *  Faller tillbaka på `flatPrice`/`flatMemberPrice` om inga pris-per-
 *  kombination är satta, eller om just den kombinationen saknar en egen
 *  rad. `isMember` kommer här bara från /api/event/check-member-pricing —
 *  rent informativt (den här sidan gör ingen dynamisk Stripe-checkout). */
export function resolveComboPrice(params: {
  attendingDays: string | undefined;
  dayComboPricing: ComboPriceRow[] | undefined;
  flatPrice: number;
  flatMemberPrice?: number;
  isMember: boolean;
}): number {
  const { attendingDays, dayComboPricing, flatPrice, flatMemberPrice, isMember } = params;

  if (!dayComboPricing || dayComboPricing.length === 0) {
    return isMember && flatMemberPrice !== undefined ? flatMemberPrice : flatPrice;
  }

  const comboKey = comboKeyFromAttendingDays(attendingDays);
  const match = dayComboPricing.find(row => row.comboKey === comboKey);
  if (!match) return flatPrice;
  return isMember && match.memberPrice !== undefined ? match.memberPrice : match.price;
}
