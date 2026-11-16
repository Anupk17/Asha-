import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore,
  Firestore
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'mock-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mock-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mock-asha-project',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000:web:0000000000',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch {
  // If already initialized or unsupported environment
  db = getFirestore(app);
}

const auth: Auth = getAuth(app);

export { app, db, auth };

export async function initAuth(): Promise<User | null> {
  return new Promise((resolve) => {
    // If running in purely mock mode without valid Firebase credentials
    if (firebaseConfig.apiKey === 'mock-api-key' || firebaseConfig.apiKey.startsWith('mock_')) {
      console.info('ℹ️ Running Firebase in local offline mock mode');
      const mockUser = {
        uid: 'demo-asha-worker-01',
        isAnonymous: true,
        getIdToken: async () => 'mock-jwt-token-for-dev',
      } as unknown as User;
      resolve(mockUser);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          resolve(cred.user);
        } catch (error) {
          console.warn('Anonymous sign-in failed, falling back to local guest user:', error);
          resolve(null);
        }
      }
    });
  });
}

