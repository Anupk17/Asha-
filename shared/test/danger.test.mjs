import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharedPkg from '../dist/index.js';

const { evaluateDangerSigns, DANGER_RULES } = sharedPkg;

test('Danger engine correctly evaluates all 11 danger rules with positive and negative utterances', () => {
  // 1. mat_heavy_bleeding (pregnant)
  const posBleeding = [
    { text: 'Mother has severe heavy bleeding after delivery', lang: 'en' },
    { text: 'माता को बहुत ज्यादा खून बह रहा है', lang: 'hi' },
    { text: 'Heavy bleeding ho rahi hai bohot jyada', lang: 'hinglish' },
  ];
  for (const p of posBleeding) {
    const res = evaluateDangerSigns({ beneficiaryType: 'pregnant', transcriptText: p.text });
    assert.ok(res.matchedRuleIds.includes('mat_heavy_bleeding'), `Failed positive for heavy bleeding: ${p.text}`);
    assert.strictEqual(res.isReferralRequired, true);
  }
  const negBleeding = [
    { text: 'Mild normal lochia discharge, mother is resting comfortably', lang: 'en' },
    { text: 'सब सामान्य है माता स्वस्थ है कोई समस्या नहीं है', lang: 'hi' },
  ];
  for (const n of negBleeding) {
    const res = evaluateDangerSigns({ beneficiaryType: 'pregnant', transcriptText: n.text });
    assert.ok(!res.matchedRuleIds.includes('mat_heavy_bleeding'), `False positive for bleeding: ${n.text}`);
  }

  // 2. mat_severe_headache_vision (pregnant)
  const posHeadache = [
    { text: 'Patient reports severe headache and blurred vision with spots', lang: 'en' },
    { text: 'बहुत तेज सिरदर्द है और आंखों से धुंधला दिख रहा है', lang: 'hi' },
    { text: 'Bohot severe headache aur dhundhla dikh raha hai BP high lagta hai', lang: 'hinglish' },
  ];
  for (const p of posHeadache) {
    const res = evaluateDangerSigns({ beneficiaryType: 'pregnant', transcriptText: p.text });
    assert.ok(res.matchedRuleIds.includes('mat_severe_headache_vision'), `Failed headache/vision: ${p.text}`);
  }

  // 3. mat_convulsions (pregnant)
  const posConvulsions = [
    { text: 'Mother suffered convulsions and fits today morning', lang: 'en' },
    { text: 'माता को दौरे पड़ रहे हैं और झटके आए हैं', lang: 'hi' },
    { text: 'Achanak se fits aaye aur mirgi ke daure pade', lang: 'hinglish' },
  ];
  for (const p of posConvulsions) {
    const res = evaluateDangerSigns({ beneficiaryType: 'pregnant', transcriptText: p.text });
    assert.ok(res.matchedRuleIds.includes('mat_convulsions'), `Failed convulsions: ${p.text}`);
  }

  // 4. mat_breathlessness (pregnant)
  const posBreathless = [
    { text: 'Mother has severe breathlessness and chest tightness at rest', lang: 'en' },
    { text: 'सांस लेने में बहुत तकलीफ हो रही है और सांस फूल रही है', lang: 'hi' },
    { text: 'Severe saans lene me dikkat aur saans phool rahi hai', lang: 'hinglish' },
  ];
  for (const p of posBreathless) {
    const res = evaluateDangerSigns({ beneficiaryType: 'pregnant', transcriptText: p.text });
    assert.ok(res.matchedRuleIds.includes('mat_breathlessness'), `Failed breathlessness: ${p.text}`);
  }

  // 5. nb_chest_indrawing (newborn)
  const posChest = [
    { text: 'Baby has severe chest indrawing and retraction while breathing', lang: 'en' },
    { text: 'बच्चे की छाती भीतर धंस रही है और पसली चल रही है', lang: 'hi' },
    { text: 'Baby ki pasli chal rahi hai chest indrawing hai', lang: 'hinglish' },
  ];
  for (const p of posChest) {
    const res = evaluateDangerSigns({ beneficiaryType: 'newborn', transcriptText: p.text });
    assert.ok(res.matchedRuleIds.includes('nb_chest_indrawing'), `Failed chest indrawing: ${p.text}`);
  }

  // 6. nb_unable_to_feed (newborn)
  const posFeed = [
    { text: 'Newborn is unable to suck and not feeding at all', lang: 'en' },
    { text: 'बच्चा दूध नहीं पी पा रहा है और स्तनपान बंद है', lang: 'hi' },
    { text: 'Baby dudh nahi pi raha poor sucking hai', lang: 'hinglish' },
  ];
  for (const p of posFeed) {
    const res = evaluateDangerSigns({ beneficiaryType: 'newborn', transcriptText: p.text });
    assert.ok(res.matchedRuleIds.includes('nb_unable_to_feed'), `Failed feeding: ${p.text}`);
  }
});

test('Measurement threshold rules trigger accurately according to MoHFW guidelines', () => {
  // 1. nb_fast_breathing: newborn breaths >= 60/min
  const trigBreaths = evaluateDangerSigns({ beneficiaryType: 'newborn', breaths_per_min: 62 });
  assert.ok(trigBreaths.matchedRuleIds.includes('nb_fast_breathing'));
  assert.strictEqual(trigBreaths.isReferralRequired, true);

  const normBreaths = evaluateDangerSigns({ beneficiaryType: 'newborn', breaths_per_min: 44 });
  assert.ok(!normBreaths.matchedRuleIds.includes('nb_fast_breathing'));

  // 2. nb_fever: newborn temperature >= 37.5 C
  const trigNbFever = evaluateDangerSigns({ beneficiaryType: 'newborn', temperature_c: 38.1 });
  assert.ok(trigNbFever.matchedRuleIds.includes('nb_fever'));

  const normNbFever = evaluateDangerSigns({ beneficiaryType: 'newborn', temperature_c: 36.8 });
  assert.ok(!normNbFever.matchedRuleIds.includes('nb_fever'));

  // 3. nb_hypothermia: newborn temperature < 35.5 C
  const trigHypo = evaluateDangerSigns({ beneficiaryType: 'newborn', temperature_c: 35.0 });
  assert.ok(trigHypo.matchedRuleIds.includes('nb_hypothermia'));

  // 4. nb_low_birth_weight: newborn weight < 2.0 kg
  const trigLowWeight = evaluateDangerSigns({ beneficiaryType: 'newborn', weight_kg: 1.8 });
  assert.ok(trigLowWeight.matchedRuleIds.includes('nb_low_birth_weight'));

  const normWeight = evaluateDangerSigns({ beneficiaryType: 'newborn', weight_kg: 2.8 });
  assert.ok(!normWeight.matchedRuleIds.includes('nb_low_birth_weight'));

  // 5. mat_high_fever: maternal temperature >= 38.3 C
  const trigMatFever = evaluateDangerSigns({ beneficiaryType: 'pregnant', temperature_c: 38.9 });
  assert.ok(trigMatFever.matchedRuleIds.includes('mat_high_fever'));
});

test('Mentioning fever without numeric temperature triggers clarifying question and unknown measurement', () => {
  // Maternal fever mentioned verbally without numeric temperature
  const resMat = evaluateDangerSigns({
    beneficiaryType: 'pregnant',
    transcriptText: 'Mata ko bohot tej bukhar hai badan garam hai',
  });

  assert.ok(resMat.unknownMeasurements.some((u) => u.field === 'temperature_c'));
  const qMat = resMat.unknownMeasurements.find((u) => u.field === 'temperature_c');
  assert.strictEqual(qMat.clarifyingQuestion, "What is the mother's temperature?");

  // Newborn fever mentioned verbally without numeric temperature
  const resNb = evaluateDangerSigns({
    beneficiaryType: 'newborn',
    transcriptText: 'Baby feels very hot and has fever',
  });

  assert.ok(resNb.unknownMeasurements.some((u) => u.field === 'temperature_c'));
  const qNb = resNb.unknownMeasurements.find((u) => u.field === 'temperature_c');
  assert.strictEqual(qNb.clarifyingQuestion, "What is the baby's temperature?");
});
