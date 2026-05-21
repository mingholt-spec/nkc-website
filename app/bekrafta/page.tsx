import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function BekraftaPlatsPage({ searchParams }: Props) {
  const { token } = await searchParams;

  let title = '';
  let message = '';
  let success = false;

  if (!token) {
    title = 'Ogiltig länk';
    message = 'Token saknas i länken.';
  } else if (!db) {
    title = 'Serverfel';
    message = 'Något gick fel. Försök igen om en stund.';
  } else {
    try {
      const snap = await db.collection('leads')
        .where('waitlistConfirmToken', '==', token)
        .limit(1)
        .get();

      if (snap.empty) {
        title = 'Länken är inte längre giltig';
        message = 'Platsen har redan bekräftats eller länken har gått ut. Kontakta oss om du har frågor.';
      } else {
        const leadDoc = snap.docs[0];
        const lead = leadDoc.data();
        const firstName: string = lead.firstName || '';
        const campaignName: string = lead.campaignName || 'eventet';

        if (lead.status !== 'waitlisted') {
          title = 'Platsen är redan bekräftad';
          message = `${firstName ? `Hej ${firstName}! ` : ''}Du är redan bokad på ${campaignName}. Vi ses där!`;
          success = true;
        } else {
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
          await batch.commit();

          title = 'Platsen är bekräftad!';
          message = `${firstName ? `Hej ${firstName}! ` : ''}Du är nu bokad på ${campaignName}. Vi ses där!`;
          success = true;
        }
      }
    } catch {
      title = 'Serverfel';
      message = 'Något gick fel. Försök igen om en stund.';
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
