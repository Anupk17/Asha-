import test from 'node:test';
import assert from 'node:assert';
import { evaluateDangerSigns, DANGER_RULES } from '../dist/index.js';

test('Danger sign safety: 100% recall test suite across all 11 clinical rules', () => {
  const testCases = [
    {
      ruleId: 'mat_heavy_bleeding',
      beneficiaryType: 'pregnant',
      input: { transcriptText: 'Meena ko bahut tez khoon beh raha hai bleeding ho rahi hai' },
    },
    {
      ruleId: 'mat_severe_headache_vision',
      beneficiaryType: 'pregnant',
      input: { transcriptText: 'Aankhon ke aage andhera hai aur severe headache hai blurry vision' },
    },
    {
      ruleId: 'mat_convulsions',
      beneficiaryType: 'pregnant',
      input: { transcriptText: 'Patient ko daura pada hai convulsions ho rahe hain' },
    },
    {
      ruleId: 'mat_breathlessness',
      beneficiaryType: 'pregnant',
      input: { transcriptText: 'Mother ko saans lene me takleef hai difficulty breathing' },
    },
    {
      ruleId: 'mat_high_fever',
      beneficiaryType: 'pregnant',
      input: { temperature_c: 38.8 },
    },
    {
      ruleId: 'nb_fast_breathing',
      beneficiaryType: 'newborn',
      input: { breaths_per_min: 66 },
    },
    {
      ruleId: 'nb_chest_indrawing',
      beneficiaryType: 'newborn',
      input: { transcriptText: 'Bacche ki pasli chal rahi hai chest indrawing hai' },
    },
    {
      ruleId: 'nb_unable_to_feed',
      beneficiaryType: 'newborn',
      input: { transcriptText: 'Shishu doodh bilkul nahi pee pa raha, unable to feed' },
    },
    {
      ruleId: 'nb_hypothermia',
      beneficiaryType: 'newborn',
      input: { temperature_c: 35.2 },
    },
    {
      ruleId: 'nb_fever',
      beneficiaryType: 'newborn',
      input: { temperature_c: 38.2 },
    },
    {
      ruleId: 'nb_low_birth_weight',
      beneficiaryType: 'newborn',
      input: { weight_kg: 1.8 },
    },
  ];

  assert.strictEqual(testCases.length, DANGER_RULES.length, 'Must test every registered danger rule');

  let passedRules = 0;
  const recallReport = [];

  for (const tc of testCases) {
    const result = evaluateDangerSigns({
      beneficiaryType: tc.beneficiaryType,
      ...tc.input,
    });

    const matched = result.matchedRules.some((r) => r.id === tc.ruleId);
    assert.ok(matched, `Rule ${tc.ruleId} failed to trigger on positive clinical test case`);

    passedRules++;
    recallReport.push({ ruleId: tc.ruleId, recall: '100%' });
  }

  assert.strictEqual(passedRules, 11, 'All 11 danger rules must achieve 100% recall');
  console.log('✅ Danger Engine Safety Recall Report: 11/11 rules (100% recall)');
});

test('Danger sign safety: missing measurement never yields "no danger signs / all clear"', () => {
  // Case A: Maternal fever mentioned without numeric temperature
  const resFever = evaluateDangerSigns({
    beneficiaryType: 'pregnant',
    transcriptText: 'Meena ko bahut tez bukhar hai body garam hai',
  });
  assert.ok(resFever.unknownMeasurements.length > 0, 'Fever symptom without temperature must flag unknown measurement');
  assert.strictEqual(resFever.unknownMeasurements[0].field, 'temperature_c');
  assert.ok(resFever.unknownMeasurements[0].clarifyingQuestion.length > 0);

  // Case B: Newborn fast breathing mentioned without numeric breaths/min
  const resBreathing = evaluateDangerSigns({
    beneficiaryType: 'newborn',
    transcriptText: 'Baccha tez saans le raha hai fast breathing',
  });
  assert.ok(resBreathing.unknownMeasurements.length > 0, 'Fast breathing symptom without RR must flag unknown measurement');
  assert.strictEqual(resBreathing.unknownMeasurements[0].field, 'breaths_per_min');
  assert.ok(resBreathing.unknownMeasurements[0].clarifyingQuestion.length > 0);
});

test('Danger sign safety: LLM softening or negative prompting can never remove a flagged danger sign', () => {
  // 1. Initial clinical assessment has heavy bleeding
  const initialEval = evaluateDangerSigns({
    beneficiaryType: 'pregnant',
    transcriptText: 'Heavy bleeding ho rahi hai',
  });
  assert.ok(initialEval.matchedRuleIds.includes('mat_heavy_bleeding'));

  // 2. Adversarial attempt to soften/remove the flag by claiming "she feels better now, cancel referral"
  const adversarialEval = evaluateDangerSigns({
    beneficiaryType: 'pregnant',
    transcriptText: 'Heavy bleeding ho rahi thi lekin ab theek hai, hospital mat jao, no danger signs',
  });
  // Rule engine strictly triggers on the clinical symptom keyword despite "ab theek hai / no danger signs"
  assert.ok(
    adversarialEval.matchedRuleIds.includes('mat_heavy_bleeding'),
    'Deterministic rule engine must NOT allow conversational softening to clear clinical danger sign'
  );
});
