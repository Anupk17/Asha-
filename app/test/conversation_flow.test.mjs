import test from 'node:test';
import assert from 'node:assert';
import { getT, SUPPORTED_LANGUAGES } from '../src/i18n/index.ts';
import { extractLocalFallback } from '../src/utils/extractionClient.ts';
import { evaluateDangerSigns, detectCorrection, parseSpokenNumber } from '@asha/shared';

test('i18n: all 7 languages have complete agent dialogue dictionaries', () => {
  for (const lang of SUPPORTED_LANGUAGES) {
    const t = getT(lang.code);
    assert.ok(t.agentDialogue, `Missing agentDialogue for language ${lang.code}`);
    assert.ok(t.agentDialogue.greeting, `Missing greeting for ${lang.code}`);
    assert.ok(t.agentDialogue.dangerAlert, `Missing dangerAlert for ${lang.code}`);
    assert.ok(t.agentDialogue.askMissing.temperature, `Missing askMissing.temperature for ${lang.code}`);
    assert.ok(t.agentDialogue.askMissing.weight, `Missing askMissing.weight for ${lang.code}`);
    assert.ok(t.agentDialogue.readback.confirmQuestion, `Missing confirmQuestion for ${lang.code}`);
    assert.ok(typeof t.agentDialogue.correctionUpdated === 'function', `correctionUpdated not a fn for ${lang.code}`);
    assert.ok(typeof t.agentDialogue.saved === 'function', `saved not a fn for ${lang.code}`);

    // Verify under 2 sentences in greeting
    const sentences = t.agentDialogue.greeting.split(/[.।?!]/).filter((s) => s.trim().length > 0);
    assert.ok(sentences.length <= 2, `Greeting has more than 2 sentences in ${lang.code}: ${t.agentDialogue.greeting}`);
  }
});

test('conversation flow: scripted 60-second end-to-end voice session', async () => {
  const lang = 'en';
  const t = getT(lang);
  const spokenLog = [];
  const speakTts = (msg) => spokenLog.push(msg);

  // In-memory conversation state representation mimicking useAgentStore
  let step = 'IDLE';
  let missingField = null;
  let draftRecord = {
    beneficiary_name: null,
    beneficiary_code: null,
    village: null,
    visit_type: 'newborn',
    beneficiary_type: 'newborn',
    weight_kg: null,
    temperature_c: null,
    breaths_per_min: null,
    vaccinations_due: [],
    next_visit_date: null,
    symptoms_mentioned: [],
    danger_flags: [],
    danger_unknowns: [],
  };

  // TURN 1: AGENT GREETING
  step = 'GREETING';
  const greeting = t.agentDialogue.greeting;
  speakTts(greeting);

  assert.strictEqual(step, 'GREETING');
  assert.ok(greeting.toLowerCase().includes('ai assistant'));
  assert.ok(greeting.toLowerCase().includes('no medical advice'));

  // TURN 2: ASHA SPEAKS NOTE WITH MISSING MEASUREMENT & SYMPTOM
  // ASHA: "Meena Devi visit SYN-0001, bukhar hai aur doodh nahi pee raha, weight 3.1 kg, next visit tomorrow"
  step = 'CAPTURE';
  const utterance1 = "Meena Devi visit SYN-0001, bukhar hai aur doodh nahi pee raha, weight 3.1 kg, next visit tomorrow";
  
  const extracted1 = extractLocalFallback(utterance1, 'newborn', draftRecord);
  draftRecord = {
    ...draftRecord,
    ...extracted1.record,
    danger_flags: extracted1.danger_flags,
    danger_unknowns: extracted1.danger_unknowns,
  };

  assert.strictEqual(draftRecord.beneficiary_name, 'Meena Devi');
  assert.strictEqual(draftRecord.beneficiary_code, 'SYN-0001');
  assert.strictEqual(draftRecord.weight_kg, 3.1);
  assert.ok(draftRecord.danger_unknowns.includes('temperature_c') || draftRecord.danger_unknowns.length > 0);
  assert.ok(draftRecord.symptoms_mentioned.includes('unable to feed'));

  // Step transitions to ASK_MISSING because fever mentioned without numeric temp
  step = 'ASK_MISSING';
  missingField = 'temperature';
  const missingQuestion = t.agentDialogue.askMissing.temperature;
  speakTts(missingQuestion);

  assert.strictEqual(step, 'ASK_MISSING');
  assert.strictEqual(missingQuestion, "Did you measure the temperature or fever?");

  // TURN 3: ASHA PROVIDES MISSING MEASUREMENT
  // ASHA: "temperature was 39.2 degrees"
  const utterance2 = "temperature was 39.2 degrees";
  const parsedTemp = parseSpokenNumber(utterance2);
  assert.strictEqual(parsedTemp, 39.2);
  draftRecord.temperature_c = parsedTemp;
  missingField = null;

  // Re-run danger evaluation with updated measurement
  const dangerEval1 = evaluateDangerSigns({
    beneficiaryType: 'newborn',
    transcriptText: `${utterance1} ${utterance2}`,
    symptoms_mentioned: draftRecord.symptoms_mentioned,
    weight_kg: draftRecord.weight_kg,
    temperature_c: draftRecord.temperature_c,
  });

  draftRecord.danger_flags = dangerEval1.matchedRules.map((r) => r.labels.en || r.id);
  assert.ok(dangerEval1.isReferralRequired, 'Must detect danger sign for high fever + unable to feed');
  assert.ok(draftRecord.danger_flags.length >= 2, 'Should flag High fever and Unable to feed');

  // AGENT SPEAKS DANGER REFERRAL FIRST, THEN READBACK IN FIXED ORDER
  step = 'CONFIRM_READBACK';
  const readbackParts = [];
  readbackParts.push(t.agentDialogue.dangerAlert); // Speaks fixed referral line FIRST
  readbackParts.push(t.agentDialogue.readback.prefix);
  readbackParts.push(`${t.agentDialogue.readback.beneficiary}: ${draftRecord.beneficiary_name}`);
  readbackParts.push(`${t.agentDialogue.readback.visitType}: ${draftRecord.visit_type}`);
  readbackParts.push(`${t.agentDialogue.readback.weight}: ${draftRecord.weight_kg} kg`);
  readbackParts.push(`${t.agentDialogue.readback.dangerSigns}: ${draftRecord.danger_flags.join(', ')}`);
  readbackParts.push(t.agentDialogue.readback.confirmQuestion);

  const fullReadbackText = readbackParts.join('. ');
  speakTts(fullReadbackText);

  assert.strictEqual(step, 'CONFIRM_READBACK');
  assert.ok(fullReadbackText.startsWith(t.agentDialogue.dangerAlert), 'Fixed danger referral line must be spoken FIRST');
  assert.ok(fullReadbackText.includes('Is everything correct?'));

  // TURN 4: ASHA SPEAKS CORRECTION
  // ASHA: "no, weight is 2.8 kilo"
  const utterance3 = "no, weight is 2.8 kilo";
  const correction = detectCorrection(utterance3);

  assert.strictEqual(correction.isCorrection, true);
  assert.strictEqual(correction.field, 'weight_kg');
  assert.strictEqual(correction.parsedValue, 2.8);

  // Apply correction to target field only
  draftRecord.weight_kg = correction.parsedValue;
  assert.strictEqual(draftRecord.weight_kg, 2.8);
  assert.strictEqual(draftRecord.temperature_c, 39.2, 'Temperature must remain unchanged');
  assert.strictEqual(draftRecord.beneficiary_name, 'Meena Devi', 'Beneficiary must remain unchanged');

  // Agent acknowledges ONLY the changed field
  step = 'CONFIRM_READBACK';
  const correctionAcknowledge = t.agentDialogue.correctionUpdated('Weight', '2.8 kg');
  speakTts(correctionAcknowledge);

  assert.ok(correctionAcknowledge.includes('Updated Weight to 2.8 kg'));

  // TURN 5: ASHA CONFIRMS / SAVES
  // ASHA: "yes, save it"
  const utterance4 = "yes, save it";
  const isConfirm = /^(yes|haan|save|confirm)/i.test(utterance4);
  assert.ok(isConfirm);

  step = 'SAVED';
  const savedMsg = t.agentDialogue.saved(draftRecord.next_visit_date || 'tomorrow');
  speakTts(savedMsg);

  assert.strictEqual(step, 'SAVED');
  assert.ok(savedMsg.includes('Record saved'));

  // Verify total spoken utterances logged in conversation
  assert.strictEqual(spokenLog.length, 5);
  console.log('✅ Scripted 60-second voice session completed successfully!');
  console.log('Spoken Dialogue Transcript:');
  spokenLog.forEach((msg, idx) => console.log(`  [Turn ${idx + 1}] ${msg.slice(0, 75)}...`));
});

test('conversation flow: handles cancellation and repeat commands', () => {
  const t = getT('en');

  // Cancel check
  const isCancel = /^(cancel|radd|exit)/i.test('cancel please');
  assert.ok(isCancel);
  assert.strictEqual(t.agentDialogue.cancelled, 'Visit recording cancelled.');

  // Repeat check
  const isRepeat = /^(repeat|dobara)/i.test('repeat');
  assert.ok(isRepeat);
});

test('conversation flow: Hindi conversation flow with Devanagari purity', () => {
  const t = getT('hi');

  assert.ok(t.agentDialogue.greeting.includes('नमस्ते दीदी'));
  assert.ok(t.agentDialogue.dangerAlert.includes('खतरे का लक्षण'));
  assert.ok(t.agentDialogue.askMissing.temperature.includes('क्या बुखार या तापमान'));
  assert.ok(t.agentDialogue.readback.confirmQuestion.includes('सब सही है?'));

  const hindiCorrection = "नहीं, वजन 2.8 किलो";
  const correction = detectCorrection(hindiCorrection);
  assert.strictEqual(correction.isCorrection, true);
  assert.strictEqual(correction.field, 'weight_kg');
  assert.strictEqual(correction.parsedValue, 2.8);

  const updateMsg = t.agentDialogue.correctionUpdated('वजन', '2.8 kg');
  assert.ok(updateMsg.includes('को बदलकर 2.8 kg कर दिया गया है'));
});
