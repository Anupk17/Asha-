import test from 'node:test';
import assert from 'node:assert';
import { getT, SUPPORTED_LANGUAGES } from '../src/i18n/index.ts';

test('AI disclosure is present in the first turn across all 7 languages', () => {
  assert.strictEqual(SUPPORTED_LANGUAGES.length, 7, 'Must support 7 languages');

  for (const langObj of SUPPORTED_LANGUAGES) {
    const lang = langObj.code;
    const t = getT(lang);

    const greeting = t.agentDialogue.greeting;
    assert.ok(greeting && greeting.length > 0, `Greeting must be defined for language: ${lang}`);

    // 1. Must disclose AI identity
    const hasAiMention = /AI|एआई|ఏఐ|ಎಐ|എഐ/i.test(greeting);
    assert.ok(hasAiMention, `Greeting for ${lang} must mention AI: "${greeting}"`);

    // 2. Must explicitly state no medical advice
    const noAdvicePatterns = [
      /no medical advice/i,
      /चिकित्सीय सलाह नहीं/,
      /மருத்துவ ஆலோசனை வழங்குவதில்லை/,
      /వైద్య సలహాలు ఇవ్వను/,
      /ಯಾವುದೇ ವೈದ್ಯಕೀಯ ಸಲಹೆ ನೀಡುವುದಿಲ್ಲ/,
      /ചികിത്സാ ഉപദേശങ്ങൾ നൽകുന്നില്ല/,
      /कोणताही वैद्यकीय सल्ला देत नाही/,
    ];

    const hasNoAdviceDisclaimer = noAdvicePatterns.some((pattern) => pattern.test(greeting));
    assert.ok(hasNoAdviceDisclaimer, `Greeting for ${lang} must include no medical advice disclaimer: "${greeting}"`);

    // 3. Brevity check: Under 3 sentences
    const sentenceCount = greeting.split(/[.!?।]/).filter((s) => s.trim().length > 0).length;
    assert.ok(sentenceCount <= 2, `Greeting for ${lang} must be concise (max 2 sentences), got ${sentenceCount}`);
  }
});
