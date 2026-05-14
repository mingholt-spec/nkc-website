import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let _db: Firestore | null = null;

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (privateKey && process.env.FIREBASE_CLIENT_EMAIL) {
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID ?? 'bjj-manager-pro',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }

  // Firebase App Hosting / Cloud Run: Application Default Credentials
  return initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? 'bjj-manager-pro' });
}

try {
  const app = getAdminApp();
  _db = getFirestore(app);
} catch (e) {
  // No credentials in local build — pages will return empty data
  console.warn('[firebase-admin] Not initialized (missing credentials). Pages will be empty during local build.');
}

export const db: Firestore | null = _db;
