import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schedulesPath = path.join(__dirname, '../src/followups/schedules.json');
const schedules = JSON.parse(fs.readFileSync(schedulesPath, 'utf-8'));

console.log('\n========================================================================================');
console.log('             MOHFW / UIP CLINICAL FOLLOW-UP & IMMUNISATION SCHEDULES REGISTRY          ');
console.log('========================================================================================\n');

console.log(
  '| ' +
  'ID'.padEnd(18) + ' | ' +
  'Applies To'.padEnd(12) + ' | ' +
  'Offset Rule'.padEnd(20) + ' | ' +
  'Guideline ID'.padEnd(18) + ' | ' +
  'Sec/Pg'.padEnd(10) + ' | ' +
  'Reviewed'.padEnd(8) + ' |'
);
console.log('|' + '-'.repeat(20) + '|' + '-'.repeat(14) + '|' + '-'.repeat(22) + '|' + '-'.repeat(20) + '|' + '-'.repeat(12) + '|' + '-'.repeat(10) + '|');

for (const s of schedules) {
  const offsetStr = `${s.offset_rule.value} ${s.offset_rule.type} (${s.offset_rule.anchor})`;
  console.log(
    '| ' +
    s.id.padEnd(18) + ' | ' +
    s.applies_to.join(',').padEnd(12) + ' | ' +
    offsetStr.slice(0, 20).padEnd(20) + ' | ' +
    s.guideline_ref.guideline_id.padEnd(18) + ' | ' +
    `${s.guideline_ref.section}/p.${s.guideline_ref.page}`.padEnd(10) + ' | ' +
    String(s.reviewed).padEnd(8) + ' |'
  );
}

console.log('\nTotal Schedules Registered:', schedules.length);
console.log('========================================================================================\n');

