import test from 'node:test';
import assert from 'node:assert';
import { applyVocabularyPostCorrection } from '../dist/vocab.js';

test('applyVocabularyPostCorrection maps common mishearings to canonical health terms', () => {
  assert.strictEqual(
    applyVocabularyPostCorrection('patient ko tt tika aur ifa goli di'),
    'patient ko TT injection aur IFA tablets di'
  );

  assert.strictEqual(
    applyVocabularyPostCorrection('h b n c visit at p h c center'),
    'HBNC visit at PHC center'
  );

  assert.strictEqual(
    applyVocabularyPostCorrection('bcg and opv given'),
    'BCG and OPV given'
  );
});

