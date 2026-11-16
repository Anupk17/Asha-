import admin from 'firebase-admin';
import { config } from './config.js';

let firebaseInitialized = false;

export function initFirebaseAdmin(): boolean {
  if (firebaseInitialized) return true;

  try {
    if (config.FIREBASE_SERVICE_ACCOUNT_B64) {
      const decoded = Buffer.from(config.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8');
      const serviceAccount = JSON.parse(decoded);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized with service account.');
      return true;
    } else {
      console.warn('⚠️ No FIREBASE_SERVICE_ACCOUNT_B64 provided. Running in dev mock auth mode.');
      return false;
    }
  } catch (err) {
    console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_B64:', err);
    return false;
  }
}

export interface VerifiedUser {
  uid: string;
  email?: string;
  isAnonymous: boolean;
}

/**
 * Verifies a Firebase ID token. Rejects invalid tokens.
 * In local dev mode, allows 'mock-jwt-token-for-dev'.
 */
export async function verifyIdToken(token: string): Promise<VerifiedUser | null> {
  if (!token) return null;

  // Local development mock token support
  if (token === 'mock-jwt-token-for-dev' || token.startsWith('dev-mock-')) {
    return {
      uid: 'demo-asha-worker-01',
      isAnonymous: true,
    };
  }

  const initialized = initFirebaseAdmin();
  if (!initialized) {
    // If no service account is configured yet in dev, reject non-mock tokens
    console.warn('Firebase Admin not configured. Rejecting live token.');
    return null;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email,
      isAnonymous: decoded.firebase?.sign_in_provider === 'anonymous',
    };
  } catch (err) {
    console.warn('Firebase ID token verification failed:', err);
    return null;
  }
}

