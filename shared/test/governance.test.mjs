import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('Rule governance: refuses build if any danger rule has reviewed:false or missing guideline_ref', () => {
  const dangerSigns = JSON.parse(fs.readFileSync('src/danger/danger_signs.json', 'utf8'));

  assert.ok(dangerSigns.length >= 11, 'Must have at least 11 danger signs');

  for (const rule of dangerSigns) {
    assert.strictEqual(rule.reviewed, true, `Rule ${rule.id} must be reviewed:true`);
    assert.ok(rule.guideline_ref, `Rule ${rule.id} must have guideline_ref`);
    assert.ok(rule.guideline_ref.guideline_id, `Rule ${rule.id} must have guideline_id`);
    assert.ok(rule.guideline_ref.section, `Rule ${rule.id} must have guideline section`);
  }
});

test('Rule governance: refuses build if any incentive activity has reviewed:false or missing source_document', () => {
  const incentives = JSON.parse(fs.readFileSync('src/incentives.json', 'utf8'));

  assert.ok(incentives.length >= 5, 'Must have at least 5 NHM incentive activities');

  for (const item of incentives) {
    assert.strictEqual(item.reviewed, true, `Incentive ${item.id} must be reviewed:true`);
    assert.ok(item.source_document, `Incentive ${item.id} must cite official source_document`);
    assert.ok(item.source_section, `Incentive ${item.id} must cite official source_section`);
  }
});
