import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Submission endpoint for the freely-placeable PageBlockLeadForm block
 * (used on regular website pages and, optionally, campaign pages).
 * Mirrors the email-normalization + upsert-by-email pattern in
 * app/api/event/register/route.ts — see nkc-website/CLAUDE.md "Two
 * registration paths" for why these two upsert flows must stay in sync
 * with bjj-premium/api/campaigns.ts's addLead/upsertLead/submitLeadFormEntry.
 *
 * Unlike /api/event/register, this has no campaign-specific concepts
 * (no duplicate-per-campaign check, no eventHistory entry, no
 * registrationCloseDate) — it's a plain lead capture.
 */

const KNOWN_KEYS = new Set(['firstName', 'lastName', 'email', 'phone', 'guardianName', 'guardianEmail', 'guardianPhone']);

export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  try {
    const body = await req.json() as { values?: Record<string, string>; tags?: string[]; campaignId?: string; campaignName?: string };
    const values = body.values ?? {};

    const known: Record<string, string> = {};
    const customFields: Record<string, string> = {};
    for (const [key, raw] of Object.entries(values)) {
      const val = typeof raw === 'string' ? raw.trim() : '';
      if (!val) continue;
      if (KNOWN_KEYS.has(key)) {
        known[key] = (key === 'email' || key === 'guardianEmail') ? val.toLowerCase() : val;
      } else {
        customFields[key] = val;
      }
    }

    if (!known.email && !known.guardianEmail) {
      return NextResponse.json({ error: 'E-post saknas' }, { status: 400 });
    }

    const tags = Array.isArray(body.tags) ? body.tags : [];
    const email = known.email || '';
    const now = FieldValue.serverTimestamp();

    const existingSnap = email
      ? await db.collection('leads').where('email', '==', email).limit(1).get()
      : null;

    if (existingSnap && !existingSnap.empty) {
      const existingRef = existingSnap.docs[0].ref;
      const existingData = existingSnap.docs[0].data();
      const existingTags: string[] = existingData.tags ?? [];
      const mergedTags = Array.from(new Set([...existingTags, ...tags]));

      await existingRef.update({
        firstName: known.firstName || existingData.firstName || '',
        lastName: known.lastName || existingData.lastName || '',
        phone: known.phone || existingData.phone || '',
        guardianName: known.guardianName ?? existingData.guardianName ?? null,
        guardianEmail: known.guardianEmail ?? existingData.guardianEmail ?? null,
        guardianPhone: known.guardianPhone ?? existingData.guardianPhone ?? null,
        tags: mergedTags,
        source: 'nkc-website',
        ...(body.campaignId ? { campaignId: body.campaignId, campaignName: body.campaignName ?? existingData.campaignName ?? '' } : {}),
        ...(Object.keys(customFields).length > 0 ? { customFields: { ...(existingData.customFields ?? {}), ...customFields } } : {}),
      });
    } else {
      const leadId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await db.collection('leads').doc(leadId).set({
        firstName: known.firstName ?? '',
        lastName: known.lastName ?? '',
        email,
        phone: known.phone ?? '',
        guardianName: known.guardianName ?? null,
        guardianEmail: known.guardianEmail ?? null,
        guardianPhone: known.guardianPhone ?? null,
        tags,
        eventHistory: [],
        submittedAt: now,
        gdprConsentDate: now,
        status: 'new',
        source: 'nkc-website',
        ...(body.campaignId ? { campaignId: body.campaignId, campaignName: body.campaignName ?? '' } : {}),
        ...(Object.keys(customFields).length > 0 ? { customFields } : {}),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[lead-form/submit]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
