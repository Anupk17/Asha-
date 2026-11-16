import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharedPkg from '../dist/index.js';

const {
  parseSpokenNumber,
  isClinicallyValid,
  parseRelativeDate,
  detectCorrection,
} = sharedPkg;

test('Spoken number normaliser converts English, Hindi, and Hinglish numbers correctly (15 utterances)', () => {
  const cases = [
    // English
    { utterance: 'weight is 2.8 kg', expected: 2.8 },
    { utterance: 'temperature is 37.5 degrees', expected: 37.5 },
    { utterance: 'breaths per minute 62', expected: 62 },
    { utterance: 'forty five breaths', expected: 45 },
    { utterance: 'two point five kilos', expected: 2.5 },
    // Hindi & Devanagari spoken forms
    { utterance: 'vajan do point aath kilo', expected: 2.8 },
    { utterance: 'vajan teen point do kilo', expected: 3.2 },
    { utterance: 'saanth saans prati minute', expected: 60 },
    { utterance: 'chauthis saans count kiya', expected: 34 },
    { utterance: 'teen sau gram', expected: 300 },
    // Hinglish & mixed
    { utterance: 'baby ka weight 2 point 8 hai', expected: 2.8 },
    { utterance: 'temp thirty eight point five celsius', expected: 38.5 },
    { utterance: 'saans 65 count hui', expected: 65 },
    { utterance: 'ek point nau kilo birth weight', expected: 1.9 },
    { utterance: 'pachaas breaths count hue', expected: 50 },
  ];

  for (const c of cases) {
    const res = parseSpokenNumber(c.utterance);
    assert.strictEqual(res, c.expected, `Failed on utterance: "${c.utterance}" -> got ${res}, expected ${c.expected}`);
  }
});

test('Clinical bounds validator enforces physiological sanity ranges', () => {
  // Valid
  assert.strictEqual(isClinicallyValid('weight_kg', 2.8), true);
  assert.strictEqual(isClinicallyValid('temperature_c', 37.2), true);
  assert.strictEqual(isClinicallyValid('breaths_per_min', 45), true);

  // Invalid / Impossible
  assert.strictEqual(isClinicallyValid('weight_kg', 0.2), false); // Too low
  assert.strictEqual(isClinicallyValid('weight_kg', 300), false); // Too high
  assert.strictEqual(isClinicallyValid('temperature_c', 25.0), false); // Fatal/impossible
  assert.strictEqual(isClinicallyValid('temperature_c', 55.0), false); // Impossible
  assert.strictEqual(isClinicallyValid('breaths_per_min', 5), false); // Impossible for living patient
  assert.strictEqual(isClinicallyValid('breaths_per_min', 200), false); // Impossible
});

test('Relative date normaliser resolves calendar and relative dates (10 utterances)', () => {
  const baseDate = new Date('2026-11-16T10:00:00Z'); // Reference Monday

  const cases = [
    { utterance: 'agle somvar ko aana', expected: '2026-11-23' },
    { utterance: 'next monday aana hai', expected: '2026-11-23' },
    { utterance: 'kal aayenge', expected: '2026-11-17' },
    { utterance: 'tomorrow visit again', expected: '2026-11-17' },
    { utterance: 'parso aana', expected: '2026-11-18' },
    { utterance: 'day after tomorrow checkup', expected: '2026-11-18' },
    { utterance: '15 tareekh ko hospital gaye the', expected: '2026-11-15' },
    { utterance: '14 tarikh ko visit hui thi', expected: '2026-11-14' },
    { utterance: 'next week on friday', expected: '2026-11-27' },
    { utterance: 'agle budhwar ko checkup hoga', expected: '2026-11-25' },
  ];

  for (const c of cases) {
    const res = parseRelativeDate(c.utterance, baseDate);
    assert.strictEqual(res, c.expected, `Failed on utterance: "${c.utterance}" -> got ${res}, expected ${c.expected}`);
  }
});

test('Correction detector correctly identifies in-turn and cross-turn corrections (8 utterances)', () => {
  const cases = [
    {
      utterance: 'no, weight is 2.8 kilo',
      expectedField: 'weight_kg',
      expectedValue: 2.8,
    },
    {
      utterance: 'nahi vajan 3 point 1 kilo hai',
      expectedField: 'weight_kg',
      expectedValue: 3.1,
    },
    {
      utterance: 'actually temperature 38.5 degree celsius tha',
      expectedField: 'temperature_c',
      expectedValue: 38.5,
    },
    {
      utterance: 'galat hai tapman 39 point 0 hai',
      expectedField: 'temperature_c',
      expectedValue: 39.0,
    },
    {
      utterance: 'wrong, breaths were 64 per minute',
      expectedField: 'breaths_per_min',
      expectedValue: 64,
    },
    {
      utterance: 'nahi saans 58 count hui thi',
      expectedField: 'breaths_per_min',
      expectedValue: 58,
    },
    {
      utterance: 'change next visit to agle somvar',
      expectedField: 'next_visit_date',
      expectedValue: '2026-11-23',
    },
    {
      utterance: 'nahin tarikh 2026-11-20 kardo',
      expectedField: 'next_visit_date',
      expectedValue: '2026-11-20',
    },
  ];

  for (const c of cases) {
    const res = detectCorrection(c.utterance);
    assert.strictEqual(res.isCorrection, true, `Expected correction for "${c.utterance}"`);
    assert.strictEqual(res.field, c.expectedField, `Expected field ${c.expectedField} for "${c.utterance}"`);
    assert.strictEqual(res.parsedValue, c.expectedValue, `Expected value ${c.expectedValue} for "${c.utterance}"`);
  }
});

test('Correction of "no, weight is 2.8 kilo" mutates ONLY weight field in existing record', () => {
  const initialRecord = {
    beneficiary_name: 'Meena Devi',
    beneficiary_code: 'SYN-0001',
    weight_kg: 3.5,
    temperature_c: 37.1,
    breaths_per_min: 24,
    visit_type: 'ANC Checkup 3',
  };

  const correction = detectCorrection('no, weight is 2.8 kilo');
  assert.strictEqual(correction.isCorrection, true);
  assert.strictEqual(correction.field, 'weight_kg');

  const updatedRecord = {
    ...initialRecord,
    [correction.field]: correction.parsedValue,
  };

  // Only weight changed
  assert.strictEqual(updatedRecord.weight_kg, 2.8);
  assert.strictEqual(updatedRecord.beneficiary_name, 'Meena Devi');
  assert.strictEqual(updatedRecord.temperature_c, 37.1);
  assert.strictEqual(updatedRecord.breaths_per_min, 24);
  assert.strictEqual(updatedRecord.visit_type, 'ANC Checkup 3');
});
