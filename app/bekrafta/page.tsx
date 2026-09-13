import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getServerLanguage } from '@/lib/server-language';
import { getT } from '@/lib/translations';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ token?: string; lang?: string }>;
}

export default async function BekraftaPlatsPage({ searchParams }: Props) {
  const [{ token, lang: langParam }, cookieLang] = await Promise.all([searchParams, getServerLanguage()]);
  // The confirmation email link encodes ?lang= explicitly (sendWaitlistNotification in
  // bjj-premium/api/campaigns.ts) — that survives being opened on a different device/browser
  // than the one used to sign up, unlike the flowroll_lang cookie, so it takes priority.
  const lang = langParam === 'en' ? 'en' : cookieLang;
  const t = getT('bekrafta', lang);

  let title = '';
  let message = '';
  let success = false;

  if (!token) {
    title = t.invalidLinkTitle;
    message = t.invalidLinkMessage;
  } else if (!db) {
    title = t.serverErrorTitle;
    message = t.serverErrorMessage;
  } else {
    try {
      const snap = await db.collection('leads')
        .where('waitlistConfirmToken', '==', token)
        .limit(1)
        .get();

      if (snap.empty) {
        title = t.linkExpiredTitle;
        message = t.linkExpiredMessage;
      } else {
        const leadDoc = snap.docs[0];
        const lead = leadDoc.data();
        const firstName: string = lead.firstName || '';
        const campaignName: string = lead.campaignName || t.eventFallback;

        if (lead.status !== 'waitlisted') {
          title = t.alreadyBookedTitle;
          message = t.alreadyBookedMessage(firstName, campaignName);
          success = true;
        } else {
          // Read Resend config for from/replyTo
          let fromStr: string | undefined;
          let replyTo: string | undefined;
          try {
            const cfgSnap = await db.collection('config').doc('resend').get();
            if (cfgSnap.exists) {
              const cfg = cfgSnap.data() ?? {};
              if (cfg.enabled && cfg.senderName && cfg.senderEmail) {
                fromStr = `${cfg.senderName} <${cfg.senderEmail}>`;
              }
              if (cfg.replyToEmail) replyTo = cfg.replyToEmail as string;
            }
          } catch { /* best-effort */ }

          const name = firstName || (lead.email as string) || '';
          const confirmHtml = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#18181b;padding:32px 24px">
  <h2 style="font-size:24px;font-weight:900;margin:0 0 20px;letter-spacing:-0.5px">${t.emailHeading}</h2>
  <p style="margin:0 0 12px;font-size:16px">${t.emailGreeting(name)}</p>
  <p style="margin:0 0 16px;font-size:16px;line-height:1.6">${t.emailBody(campaignName)}</p>
  <p style="margin:32px 0 0;color:#71717a;font-size:12px;line-height:1.5">${t.emailFooter}</p>
</div>`;

          const batch = db.batch();
          batch.update(leadDoc.ref, {
            status: 'booked',
            waitlistConfirmToken: FieldValue.delete(),
            waitlistConfirmedAt: new Date().toISOString(),
          });
          if (lead.campaignId) {
            batch.update(db.doc(`campaigns/${lead.campaignId}`), {
              waitlistCount: FieldValue.increment(-1),
              registrationCount: FieldValue.increment(1),
            });
          }
          const mailRef = db.collection('mail_queue').doc();
          batch.set(mailRef, {
            to: [lead.email as string],
            message: { subject: t.emailSubject(campaignName), html: confirmHtml },
            ...(fromStr ? { from: fromStr } : {}),
            ...(replyTo ? { replyTo } : {}),
            source: 'waitlist_confirmed',
            createdAt: new Date().toISOString(),
          });
          await batch.commit();

          title = t.confirmedTitle;
          message = t.confirmedMessage(firstName, campaignName);
          success = true;
        }
      }
    } catch {
      title = t.serverErrorTitle;
      message = t.serverErrorMessage;
    }
  }

  const icon = success
    ? (
      <svg style={{ width: 56, height: 56, color: '#f59e0b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ) : (
      <svg style={{ width: 56, height: 56, color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );

  return (
    <div style={{
      margin: 0, padding: 0, background: '#fafafa',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '48px 32px',
        maxWidth: 440, width: '90%', textAlign: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}>
        {icon}
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#18181b', margin: '16px 0 10px', letterSpacing: '-0.5px' }}>
          {title}
        </h1>
        <p style={{ fontSize: 16, color: '#52525b', lineHeight: 1.6, margin: 0 }}>
          {message}
        </p>
      </div>
    </div>
  );
}
