import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('firestore.rules file structure and security policy', () => {
  const content = fs.readFileSync('firestore.rules', 'utf8');

  // Must declare rules_version 2
  assert.match(content, /rules_version\s*=\s*'2';/);

  // Must scope user data to request.auth.uid == userId
  assert.match(content, /match\s+\/users\/\{userId\}\/\{document=\*\*\}/);
  assert.match(content, /request\.auth\s*!=\s*null/);
  assert.match(content, /request\.auth\.uid\s*==\s*userId/);

  // Must deny all other paths by default
  assert.match(content, /match\s+\/\{document=\*\*\}/);
  assert.match(content, /allow\s+read,\s*write:\s*false;/);
});

// Mock simulation of Firestore rule evaluator
function evaluateFirestoreRule(path, authUid) {
  const userMatch = path.match(/^\/users\/([^/]+)(\/.*)?$/);
  if (userMatch) {
    const targetUserId = userMatch[1];
    if (authUid && authUid === targetUserId) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'unauthorized or user mismatch' };
  }
  return { allowed: false, reason: 'default deny' };
}

test('firestore security rule logic simulation', () => {
  const uidA = 'user_asha_001';
  const uidB = 'user_asha_002';

  // Allowed: User A accesses their own beneficiaries
  const req1 = evaluateFirestoreRule(`/users/${uidA}/beneficiaries/SYN-0001`, uidA);
  assert.strictEqual(req1.allowed, true);

  // Allowed: User A accesses their own visits
  const req2 = evaluateFirestoreRule(`/users/${uidA}/visits/v-123`, uidA);
  assert.strictEqual(req2.allowed, true);

  // Denied: User A tries to read User B's beneficiaries
  const req3 = evaluateFirestoreRule(`/users/${uidB}/beneficiaries/SYN-0001`, uidA);
  assert.strictEqual(req3.allowed, false);

  // Denied: Unauthenticated user accesses User A
  const req4 = evaluateFirestoreRule(`/users/${uidA}/beneficiaries/SYN-0001`, null);
  assert.strictEqual(req4.allowed, false);

  // Denied: Any root collection outside users/{uid}
  const req5 = evaluateFirestoreRule('/global_patients/123', uidA);
  assert.strictEqual(req5.allowed, false);
});

