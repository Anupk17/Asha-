import test from 'node:test';
import assert from 'node:assert';

process.env.PORT = process.env.PORT || '8080';
process.env.GNANI_API_KEY = process.env.GNANI_API_KEY || 'dev_placeholder_gnani_key';
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'mock_anthropic_key';

const { RateLimiter } = await import('../dist/rateLimit.js');
const { extractRecord } = await import('../dist/extract.js');

test('Security: RateLimiter enforces request thresholds per user', () => {
  const limiter = new RateLimiter(5); // 5 req per min
  const userId = 'asha_worker_test';

  // First 5 requests should pass
  for (let i = 0; i < 5; i++) {
    assert.strictEqual(limiter.check(userId), true, `Request ${i + 1} should be permitted`);
  }

  // 6th request within same minute should be rejected
  assert.strictEqual(limiter.check(userId), false, '6th request must exceed rate limit');

  // Other users should still be permitted
  assert.strictEqual(limiter.check('other_asha_worker'), true, 'Independent user should not be blocked');
});

test('Security: /extract endpoint flags medical advice and drug requests with mandatory PHC referral', async () => {
  const res = await extractRecord({
    transcript: 'Meena ko bahut tez sar dard hai, kya paracetamol goli du?',
    beneficiaryType: 'pregnant',
    language: 'hi',
  });

  assert.strictEqual(res.is_blocked_medical_advice, true);
  assert.ok(res.medical_advice_refusal);
  assert.ok(res.medical_advice_refusal.includes('ANM') || res.medical_advice_refusal.includes('PHC'));
});
