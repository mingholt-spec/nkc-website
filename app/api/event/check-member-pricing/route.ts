import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * Publik, oautentiserad endpoint som LÅTER anmälningsformuläret visa rätt
 * medlemspris LIVE innan besökaren skickar in anmälan — svarar ENDAST med
 * ett booleskt isMember, aldrig någon annan data om personen. Mirrors
 * bjj-premiums checkMemberPricing Cloud Function (samma users-collection,
 * samma Firestore-projekt) — nkc-website har redan egen firebase-admin-
 * åtkomst för /api/event/register, så ingen anledning att gå via en
 * Cloud Function-anrop mellan de två apparna för detta.
 *
 * VIKTIGT: detta svar litas ALDRIG på för någon faktisk betalning — denna
 * sida gör ingen dynamisk Stripe-checkout alls (se EventPageClient.tsx),
 * priset här är rent informativt.
 */
export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  try {
    const body = await req.json() as { email?: string };
    const email = (body.email ?? '').trim().toLowerCase();
    if (!email || email.length > 254) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Grov per-IP-begränsning (max 20 anrop/10 min) — samma rate_limits-
    // collection/nyckelformat som bjj-premiums checkMemberPricing, så de
    // aldrig kan krocka med varandra oavsett vilken app som fick anropet.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitRef = db.collection('rate_limits').doc(`memberPricing_${ip}`);
    const windowMs = 10 * 60 * 1000;
    const now = Date.now();
    const allowed = await db.runTransaction(async (tx) => {
      const snap = await tx.get(rateLimitRef);
      const rl = snap.exists ? snap.data()! : { count: 0, windowStart: now };
      const withinWindow = now - rl.windowStart < windowMs;
      const count = withinWindow ? rl.count : 0;
      if (count >= 20) return false;
      tx.set(rateLimitRef, { count: count + 1, windowStart: withinWindow ? rl.windowStart : now });
      return true;
    });
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const snap = await db.collection('users').where('email', '==', email).limit(1).get();
    return NextResponse.json({ isMember: !snap.empty });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
