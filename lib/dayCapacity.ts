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

/** eventDetails.maxAttendeesByDay (B106) — override av taket för EN specifik dag,
 *  t.ex. "vi släpper 4 platser till på lördag" efter att eventet redan är live.
 *  Saknas för en dag = använd det vanliga maxAttendees, oförändrat. */
export function effectiveMaxAttendeesForDay(
  date: string,
  maxAttendees: number,
  maxAttendeesByDay: Record<string, number> | undefined,
): number {
  return maxAttendeesByDay?.[date] ?? maxAttendees;
}

/** En per-dags effektivt max <= 0 (eller saknas helt) betyder "ingen gräns" för
 *  just den dagen — matchar bjj-premiums tolkning av 0/saknas som obegränsat. */
export function splitAttendingDays(
  attendingDays: string[],
  maxAttendees: number,
  registrationCountByDay: Record<string, number> | undefined,
  maxAttendeesByDay?: Record<string, number>,
): SplitAttendingDaysResult {
  const counts = registrationCountByDay ?? {};
  const confirmedDays: string[] = [];
  const waitlistedDays: string[] = [];
  for (const date of attendingDays) {
    const effectiveMax = effectiveMaxAttendeesForDay(date, maxAttendees, maxAttendeesByDay);
    if (!effectiveMax || effectiveMax <= 0) {
      confirmedDays.push(date);
      continue;
    }
    const current = counts[date] ?? 0;
    if (current < effectiveMax) confirmedDays.push(date);
    else waitlistedDays.push(date);
  }
  return { confirmedDays, waitlistedDays };
}
