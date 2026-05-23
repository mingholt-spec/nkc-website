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

    // Check if a waitlisted lead already exists for this email + campaign
    const existingSnap = await db.collection('leads')
      .where('email', '==', email)
      .where('campaignId', '==', campaignId)
      .where('status', '==', 'waitlisted')
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      // Already on the waitlist — return success without creating a duplicate
      return NextResponse.json({ success: true });
    }

    const eventEntry = {
      id: `${campaignId}-${Date.now()}`,
      name: campaignName ?? 'Okänd kampanj',
      date: todayString(),
      paid: 0,
    };

    const now = FieldValue.serverTimestamp();

    const todayStr = new Date().toISOString().slice(0, 10);
    const leadId = `${campaignId}_wl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await db.collection('leads').doc(leadId).set({
      campaignId,
      campaignName: campaignName ?? '',
      firstName: body.firstName ?? '',
      lastName: body.lastName ?? '',
      email,
      phone: body.phone ?? '',
      eventHistory: [eventEntry],
      submittedAt: now,
      createdAt: todayStr,
      gdprConsentDate: now,
      status: 'waitlisted',
      source: 'nkc-website',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[event/waitlist]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
