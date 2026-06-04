import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  try {
    const body = await req.json() as Record<string, string>;
    const { campaignId, campaignName } = body;
    const email = (body.email ?? '').trim().toLowerCase();

    if (!campaignId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Duplicate check: same email already registered (non-waitlisted) for this campaign
    const dupSnap = await db.collection('leads')
      .where('email', '==', email)
      .where('campaignId', '==', campaignId)
      .limit(1)
      .get();
    if (!dupSnap.empty) {
      const existingStatus = dupSnap.docs[0].data().status as string;
      if (existingStatus === 'waitlisted') {
        return NextResponse.json({ alreadyWaitlisted: true });
      }
      return NextResponse.json({ alreadyRegistered: true });
    }

    // Read campaign to get auto-tags
    let campaignTags: string[] = [];
    try {
      const campSnap = await db.collection('campaigns').doc(campaignId).get();
      if (campSnap.exists) {
        campaignTags = campSnap.data()?.tags ?? [];
      }
    } catch { /* ignore — tags are best-effort */ }

    const STANDARD = new Set(['campaignId', 'campaignName', 'firstName', 'lastName', 'email', 'phone', 'guardianName', 'guardianEmail', 'guardianPhone', 'gdprConsentDate', 'preOrders', 'status']);
    const customFields: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!STANDARD.has(key) && typeof value === 'string' && value.trim()) {
        customFields[key] = value;
      }
    }

    const eventEntry = {
      id: `${campaignId}-${Date.now()}`,
      name: campaignName ?? 'Okänd kampanj',
      date: todayString(),
      paid: 0,
    };

    const now = FieldValue.serverTimestamp();

    // Upsert: find existing lead by email, merge if found
    const existingSnap = await db.collection('leads')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      const existingRef = existingSnap.docs[0].ref;
      const existingData = existingSnap.docs[0].data();

      const existingTags: string[] = existingData.tags ?? [];
      const mergedTags = Array.from(new Set([...existingTags, ...campaignTags]));

      const existingHistory: { id: string }[] = existingData.eventHistory ?? [];
      const existingIds = new Set(existingHistory.map((e) => e.id));
      const mergedHistory = existingIds.has(eventEntry.id)
        ? existingHistory
        : [...existingHistory, eventEntry];

      await existingRef.update({
        campaignId,
        campaignName: campaignName ?? existingData.campaignName ?? '',
        firstName: body.firstName || existingData.firstName || '',
        lastName: body.lastName || existingData.lastName || '',
        phone: body.phone || existingData.phone || '',
        guardianName: body.guardianName ?? existingData.guardianName ?? null,
        guardianEmail: body.guardianEmail ?? existingData.guardianEmail ?? null,
        guardianPhone: body.guardianPhone ?? existingData.guardianPhone ?? null,
        tags: mergedTags,
        eventHistory: mergedHistory,
        source: 'nkc-website',
        ...(Object.keys(customFields).length > 0 ? { customFields: { ...(existingData.customFields ?? {}), ...customFields } } : {}),
      });
    } else {
      const leadId = `${campaignId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await db.collection('leads').doc(leadId).set({
        campaignId,
        campaignName: campaignName ?? '',
        firstName: body.firstName ?? '',
        lastName: body.lastName ?? '',
        email,
        phone: body.phone ?? '',
        guardianName: body.guardianName ?? null,
        guardianEmail: body.guardianEmail ?? null,
        guardianPhone: body.guardianPhone ?? null,
        tags: campaignTags,
        eventHistory: [eventEntry],
        submittedAt: now,
        gdprConsentDate: now,
        status: 'new',
        source: 'nkc-website',
        ...(Object.keys(customFields).length > 0 ? { customFields } : {}),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[event/register]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
