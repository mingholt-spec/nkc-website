import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  try {
    const body = await req.json() as Record<string, string>;
    const { campaignId, campaignName } = body;

    if (!campaignId || !body.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const STANDARD = new Set(['campaignId', 'campaignName', 'firstName', 'lastName', 'email', 'phone', 'guardianName', 'guardianEmail', 'guardianPhone']);
    const customFields: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!STANDARD.has(key) && typeof value === 'string' && value.trim()) {
        customFields[key] = value;
      }
    }

    const now = FieldValue.serverTimestamp();
    const leadId = `${campaignId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    await db.collection('leads').doc(leadId).set({
      campaignId,
      campaignName: campaignName ?? '',
      firstName: body.firstName ?? '',
      lastName: body.lastName ?? '',
      email: body.email,
      phone: body.phone ?? '',
      guardianName: body.guardianName ?? null,
      guardianEmail: body.guardianEmail ?? null,
      guardianPhone: body.guardianPhone ?? null,
      submittedAt: now,
      gdprConsentDate: now,
      status: 'new',
      source: 'nkc-website',
      ...customFields,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[event/register]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
