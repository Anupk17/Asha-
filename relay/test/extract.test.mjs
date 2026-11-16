import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractRecord } from '../dist/extract.js';

test('extractRecord extracts fields and runs danger engine deterministically', async () => {
  const req = {
    transcript: 'Meena Devi ka visit kiya SYN-0001, vajan 54 point 5 kilo, tapman 37.0 tha, agle somvar ko aayenge',
    beneficiaryType: 'pregnant',
  };

  const res = await extractRecord(req);
  assert.ok(res.record);
  assert.strictEqual(res.record.weight_kg, 54.5);
  assert.strictEqual(res.record.temperature_c, 37.0);
  assert.ok(res.record.next_visit_date);
  assert.strictEqual(res.danger_flags.length, 0);
  assert.strictEqual(res.is_correction, false);
});

test('extractRecord flags danger signs with guideline citations when symptoms are spoken', async () => {
  const req = {
    transcript: 'माता को बहुत तेज सिरदर्द है और आंखों से धुंधला दिख रहा है',
    beneficiaryType: 'pregnant',
  };

  const res = await extractRecord(req);
  assert.ok(res.danger_flags.includes('mat_severe_headache_vision'));
  assert.ok(res.followups_to_create.some((f) => f.is_danger_referral));
});

test('extractRecord identifies spoken correction "no, weight is 2.8 kilo" and updates only target field', async () => {
  const req = {
    transcript: 'no, weight is 2.8 kilo',
    beneficiaryType: 'newborn',
    currentRecord: {
      beneficiary_name: 'Sunita Baby',
      beneficiary_code: 'SYN-0002',
      weight_kg: 3.5,
      temperature_c: 37.0,
      breaths_per_min: 44,
    },
  };

  const res = await extractRecord(req);
  assert.strictEqual(res.is_correction, true);
  assert.strictEqual(res.record.weight_kg, 2.8);
  assert.strictEqual(res.record.beneficiary_name, 'Sunita Baby');
  assert.strictEqual(res.record.temperature_c, 37.0);
  assert.strictEqual(res.record.breaths_per_min, 44);
});

test('extractRecord flags danger_unknowns and generates clarifying question when fever is mentioned without numeric temp', async () => {
  const req = {
    transcript: 'Baby feels very hot and has high fever',
    beneficiaryType: 'newborn',
  };

  const res = await extractRecord(req);
  assert.ok(res.danger_unknowns.includes('temperature_c'));
  assert.ok(res.clarifying_questions.length > 0);
  assert.strictEqual(res.clarifying_questions[0], "What is the baby's temperature?");
});
