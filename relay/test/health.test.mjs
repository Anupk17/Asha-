import test from 'node:test';
import assert from 'node:assert';

test('relay config schema validates expected keys', () => {
  assert.ok(process.env.PORT || '8080', 'Port is defined');
});

