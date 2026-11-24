/**
 * Per-dags-kapacitet för flerdagarsevent (B105) — mirrors bjj-premium's
 * utils/dayCapacity.ts. Ren funktion, inga React-/Firestore-beroenden.
 *
 * eventDetails.maxAttendees tolkas PER DAG (inte längre en delad pott för
 * hela eventet) — en anmälan delas upp: dagar som redan nått taket hamnar
 * på väntelista, övriga bekräftas direkt. Enkeldagsevent berörs inte i
 * praktiken (per dag = totalt).
 */

export interface SplitAttendingDaysResult {
  confirmedDays: string[];
  waitlistedDays: string[];
}

/** `maxAttendees <= 0` (eller saknas) betyder "ingen gräns" — matchar bjj-
 *  premiums tolkning av 0/saknas som obegränsat. */
export function splitAttendingDays(
  attendingDays: string[],
  maxAttendees: number,
  registrationCountByDay: Record<string, number> | undefined,
): SplitAttendingDaysResult {
  if (!maxAttendees || maxAttendees <= 0) {
    return { confirmedDays: [...attendingDays], waitlistedDays: [] };
  }
  const counts = registrationCountByDay ?? {};
  const confirmedDays: string[] = [];
  const waitlistedDays: string[] = [];
  for (const date of attendingDays) {
    const current = counts[date] ?? 0;
    if (current < maxAttendees) confirmedDays.push(date);
    else waitlistedDays.push(date);
  }
  return { confirmedDays, waitlistedDays };
}
