import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('Reminder wording safety review: polite, supportive, zero pressure or punitive language', () => {
  const reminderFile = fs.readFileSync('app/src/utils/reminderService.ts', 'utf8');

  // Forbidden coercive / threatening words
  const punitiveWords = [
    /\bpenalty\b/i,
    /\bfine\b/i,
    /\bsuspend\b/i,
    /\bpunish\b/i,
    /\baction will be taken\b/i,
    /\bfailure to comply\b/i,
    /\bdisciplinary\b/i,
    /दण्ड/,
    /जुर्माना/,
    /कार्रवाई/,
    /தண்டனை/,
    /అపరాధం/,
    /ದಂಡ/,
    /ശിക്ഷ/,
    /दंड/,
  ];

  for (const pattern of punitiveWords) {
    assert.strictEqual(
      pattern.test(reminderFile),
      false,
      `ReminderService must not contain punitive term matching ${pattern}`
    );
  }

  // Required polite & respectful phrases
  assert.match(reminderFile, /Wishing you a safe day/i, 'Must include supportive greeting');
  assert.match(reminderFile, /Please visit when convenient/i, 'Must be respectful of ASHA workload');
  assert.match(reminderFile, /Gentle Reminder/i, 'Must frame notices as gentle reminders');
});
