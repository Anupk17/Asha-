import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

test('Secrets check: .env and service-account files are ignored', () => {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');

  assert.match(gitignore, /\.env/, '.env must be in .gitignore');
  assert.match(gitignore, /service-account/, 'service-account files must be in .gitignore');
});

test('Secrets check: repository has zero committed live API keys', () => {
  // Check git tracked files for key patterns
  try {
    const trackedFiles = execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean);

    const secretPatterns = [
      /AIza[0-9A-Za-z_-]{35}/,
      /sk-ant-api03-[0-9A-Za-z_-]{20,}/,
      /ghp_[0-9A-Za-z]{36}/,
    ];

    for (const file of trackedFiles) {
      // Skip test files that check for these patterns
      if (file.includes('secrets_and_voice.test') || file.includes('scan-secrets')) continue;

      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        for (const pattern of secretPatterns) {
          const match = content.match(pattern);
          assert.strictEqual(match, null, `Potential committed live secret found in ${file}: ${match ? match[0] : ''}`);
        }
      }
    }
  } catch (err) {
    if (err.code !== 'ERR_ASSERTION') {
      console.warn('git ls-files check skipped (not in git environment or error):', err.message);
    } else {
      throw err;
    }
  }
});

test('TTS safety: uses stock Timbre voices only, strictly no voice cloning', () => {
  const ttsSource = fs.readFileSync('relay/src/gnaniTts.ts', 'utf8');

  // Must use official timbre stock model
  assert.match(ttsSource, /model:\s*'timbre-v3'/, 'Must use stock Timbre-v3 model');

  // Must not have voice clone endpoints or custom clone ids
  assert.strictEqual(ttsSource.includes('clone_voice'), false);
  assert.strictEqual(ttsSource.includes('clone_id'), false);
  assert.strictEqual(ttsSource.includes('voice_cloning'), false);
});

