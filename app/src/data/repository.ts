import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Beneficiary, Visit, FollowUp, AuditLog, UserSettings } from '@asha/shared';
import { MOCK_BENEFICIARIES, MOCK_VISITS, MOCK_FOLLOWUPS } from './mockData';

// Local storage backup keys for offline or mock mode when Firebase is not connected to cloud
const LOCAL_STORAGE_KEY_PREFIX = 'asha_v5_';

// Auto-clean any legacy stale storage keys from previous development iterations
if (typeof localStorage !== 'undefined') {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('asha_db_') ||
          key.startsWith('asha_v2_') ||
          key.startsWith('asha_v3_') ||
          key.startsWith('asha_v4_'))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore
  }
}

function getLocal<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading local storage for ${key}:`, e);
  }
  return fallback;
}

function setLocal<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error writing local storage for ${key}:`, e);
  }
}

// Check if we are running in mock or unauthenticated dev mode
const isMockMode = () => {
  return import.meta.env.VITE_FIREBASE_API_KEY === 'mock-api-key' ||
         import.meta.env.VITE_FIREBASE_API_KEY?.startsWith('mock_');
};

/* ==================== BENEFICIARIES ==================== */

export async function getBeneficiaries(uid: string): Promise<Beneficiary[]> {
  let list: Beneficiary[];
  if (isMockMode()) {
    list = getLocal<Beneficiary>(`beneficiaries_${uid}`, MOCK_BENEFICIARIES);
  } else {
    try {
      const colRef = collection(db, `users/${uid}/beneficiaries`);
      const snap = await getDocs(colRef);
      const fetched: Beneficiary[] = [];
      snap.forEach((d) => fetched.push({ ...(d.data() as Beneficiary), id: d.id }));
      setLocal(`beneficiaries_${uid}`, fetched);
      list = fetched;
    } catch (err) {
      console.warn('Firestore read failed (offline mode):', err);
      list = getLocal<Beneficiary>(`beneficiaries_${uid}`, MOCK_BENEFICIARIES);
    }
  }

  // Deduplicate by code
  const seen = new Set<string>();
  const deduplicated: Beneficiary[] = [];
  for (const b of list) {
    const key = b.code || b.id;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(b);
    }
  }
  return deduplicated;
}

export async function getBeneficiary(uid: string, id: string): Promise<Beneficiary | null> {
  const all = await getBeneficiaries(uid);
  return all.find((b) => b.id === id) || null;
}

export async function saveBeneficiary(uid: string, b: Beneficiary): Promise<void> {
  const current = await getBeneficiaries(uid);
  const exists = current.findIndex((item) => item.id === b.id);
  let updated: Beneficiary[];
  if (exists >= 0) {
    updated = [...current];
    updated[exists] = b;
  } else {
    updated = [b, ...current];
  }
  setLocal(`beneficiaries_${uid}`, updated);

  if (!isMockMode()) {
    try {
      const docRef = doc(db, `users/${uid}/beneficiaries`, b.id);
      await setDoc(docRef, b, { merge: true });
    } catch (err) {
      console.warn('Firestore write queued in offline cache:', err);
    }
  }

  await logAuditEvent(uid, 'beneficiary_saved', { id: b.id, code: b.code, name: b.name });
}

/* ==================== VISITS ==================== */

export async function getVisits(uid: string, beneficiaryId?: string): Promise<Visit[]> {
  let list: Visit[] = [];
  if (isMockMode()) {
    list = getLocal<Visit>(`visits_${uid}`, MOCK_VISITS);
  } else {
    try {
      const colRef = collection(db, `users/${uid}/visits`);
      const q = beneficiaryId
        ? query(colRef, where('beneficiary_id', '==', beneficiaryId), orderBy('created_at', 'desc'))
        : query(colRef, orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      snap.forEach((d) => list.push({ ...(d.data() as Visit), id: d.id }));
      setLocal(`visits_${uid}`, list);
    } catch (err) {
      console.warn('Firestore visits read failed (using local cache):', err);
      list = getLocal<Visit>(`visits_${uid}`, MOCK_VISITS);
    }
  }

  if (beneficiaryId) {
    return list.filter((v) => v.beneficiary_id === beneficiaryId);
  }
  return list;
}

export async function saveVisit(uid: string, visit: Visit): Promise<void> {
  const current = await getVisits(uid);
  const updated = [visit, ...current.filter((v) => v.id !== visit.id)];
  setLocal(`visits_${uid}`, updated);

  if (!isMockMode()) {
    try {
      const docRef = doc(db, `users/${uid}/visits`, visit.id);
      await setDoc(docRef, visit, { merge: true });
    } catch (err) {
      console.warn('Firestore write queued in offline cache:', err);
    }
  }

  await logAuditEvent(uid, 'visit_confirmed', {
    id: visit.id,
    beneficiary_id: visit.beneficiary_id,
    danger_flags_count: visit.danger_flags?.length || 0,
  });
}

/* ==================== FOLLOW-UPS ==================== */

export async function getFollowUps(uid: string): Promise<FollowUp[]> {
  let list: FollowUp[];
  if (isMockMode()) {
    list = getLocal<FollowUp>(`followups_${uid}`, MOCK_FOLLOWUPS);
  } else {
    try {
      const colRef = collection(db, `users/${uid}/followups`);
      const q = query(colRef, orderBy('due_date', 'asc'));
      const snap = await getDocs(q);
      const fetched: FollowUp[] = [];
      snap.forEach((d) => fetched.push({ ...(d.data() as FollowUp), id: d.id }));
      setLocal(`followups_${uid}`, fetched);
      list = fetched;
    } catch (err) {
      console.warn('Firestore follow-ups read failed:', err);
      list = getLocal<FollowUp>(`followups_${uid}`, MOCK_FOLLOWUPS);
    }
  }

  // Deduplicate by code and due date so conflicting legacy items never double-display
  const seen = new Set<string>();
  const deduplicated: FollowUp[] = [];
  for (const item of list) {
    const key = `${item.beneficiary_code || item.beneficiary_name}_${item.due_date}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(item);
    }
  }
  return deduplicated;
}

export async function saveFollowUp(uid: string, followUp: FollowUp): Promise<void> {
  const current = await getFollowUps(uid);
  const updated = [...current.filter((f) => f.id !== followUp.id), followUp];
  setLocal(`followups_${uid}`, updated);

  if (!isMockMode()) {
    try {
      const docRef = doc(db, `users/${uid}/followups`, followUp.id);
      await setDoc(docRef, followUp, { merge: true });
    } catch (err) {
      console.warn('Firestore follow-up write queued:', err);
    }
  }
}

export async function markFollowUpDone(uid: string, id: string): Promise<void> {
  const current = await getFollowUps(uid);
  const completedAt = new Date().toISOString();
  const updated = current.map((f) =>
    f.id === id ? { ...f, status: 'done' as const, completed_at: completedAt } : f
  );
  setLocal(`followups_${uid}`, updated);

  if (!isMockMode()) {
    try {
      const docRef = doc(db, `users/${uid}/followups`, id);
      await updateDoc(docRef, { status: 'done', completed_at: completedAt });
    } catch (err) {
      console.warn('Firestore follow-up update queued:', err);
    }
  }

  await logAuditEvent(uid, 'followup_done', { id, completed_at: completedAt });
}

/* ==================== AUDIT LOG ==================== */

export async function logAuditEvent(uid: string, event: string, detail: any): Promise<void> {
  const item: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    event,
    detail,
    at: new Date().toISOString(),
  };

  const logs = getLocal<AuditLog>(`audit_${uid}`, []);
  logs.unshift(item);
  setLocal(`audit_${uid}`, logs.slice(0, 100)); // retain last 100

  if (!isMockMode()) {
    try {
      const docRef = doc(db, `users/${uid}/audit_log`, item.id);
      await setDoc(docRef, item);
    } catch (err) {
      console.warn('Firestore audit log write queued:', err);
    }
  }
}

export async function getAuditLogs(uid: string): Promise<AuditLog[]> {
  return getLocal<AuditLog>(`audit_${uid}`, []);
}

/* ==================== SETTINGS ==================== */

export async function getUserSettings(uid: string): Promise<UserSettings> {
  const defaults: UserSettings = {
    language: 'en',
    noise_mode: true,
    show_latency: true,
    location_sharing: true,
    location_precision: 'village',
    reminder_time: '08:00',
  };

  if (isMockMode()) {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}settings_${uid}`);
    return raw ? JSON.parse(raw) : defaults;
  }

  try {
    const docRef = doc(db, `users/${uid}/settings`, 'preferences');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserSettings;
    }
  } catch (err) {
    console.warn('Firestore settings read failed:', err);
  }
  return defaults;
}

export async function updateUserSettings(uid: string, settings: Partial<UserSettings>): Promise<void> {
  const current = await getUserSettings(uid);
  const updated = { ...current, ...settings };
  localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}settings_${uid}`, JSON.stringify(updated));

  if (!isMockMode()) {
    try {
      const docRef = doc(db, `users/${uid}/settings`, 'preferences');
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.warn('Firestore settings write queued:', err);
    }
  }
}

/* ==================== DELETE ALL MY DATA ==================== */

export async function deleteAllUserData(uid: string): Promise<void> {
  // 1. Clear local storage caches
  const keysToRemove = [
    `beneficiaries_${uid}`,
    `visits_${uid}`,
    `followups_${uid}`,
    `audit_${uid}`,
    `settings_${uid}`,
  ];
  keysToRemove.forEach((k) => localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + k));

  // 2. Batched delete on Firestore
  if (!isMockMode()) {
    try {
      const collections = ['beneficiaries', 'visits', 'followups', 'audit_log', 'settings'];
      for (const colName of collections) {
        const colRef = collection(db, `users/${uid}/${colName}`);
        const snap = await getDocs(colRef);
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }
      }
    } catch (err) {
      console.error('Error during Firestore batch deletion:', err);
      throw err;
    }
  }

  console.info(`✅ Successfully purged all user data for ${uid}`);
}

