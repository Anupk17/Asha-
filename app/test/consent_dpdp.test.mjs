import test from 'node:test';
import assert from 'node:assert';
import { getT, SUPPORTED_LANGUAGES } from '../src/i18n/index.ts';

test('Consent screen and DPDP data minimisation across all 7 languages', () => {
  for (const langObj of SUPPORTED_LANGUAGES) {
    const lang = langObj.code;
    const t = getT(lang);

    // 1. Consent Screen required sections
    assert.ok(t.consent.welcomeTitle.length > 0, `welcomeTitle missing for ${lang}`);
    assert.ok(t.consent.voiceAiTitle.length > 0, `voiceAiTitle missing for ${lang}`);
    assert.ok(t.consent.voiceAiDesc.length > 0, `voiceAiDesc missing for ${lang}`);
    assert.ok(t.consent.locationTitle.length > 0, `locationTitle missing for ${lang}`);
    assert.ok(t.consent.locationDesc.length > 0, `locationDesc missing for ${lang}`);
    assert.ok(t.consent.medicalTitle.length > 0, `medicalTitle missing for ${lang}`);
    assert.ok(t.consent.medicalDesc.length > 0, `medicalDesc missing for ${lang}`);

    // 2. DPDP Act Right to Erasure / Delete All Data
    assert.ok(t.settings.deleteDataBtn.length > 0, `deleteDataBtn missing for ${lang}`);
    assert.ok(t.settings.deleteDataConfirm.length > 0, `deleteDataConfirm missing for ${lang}`);
    assert.ok(t.settings.deleteSuccess.length > 0, `deleteSuccess missing for ${lang}`);

    // 3. Clinical disclaimer in Settings
    assert.ok(t.settings.disclaimerMedical.length > 0, `disclaimerMedical missing for ${lang}`);
  }
});

