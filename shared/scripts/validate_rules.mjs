import { DANGER_RULES } from '../dist/danger/engine.js';

let errors = 0;
const isProd = process.env.NODE_ENV === 'production';

for (const rule of DANGER_RULES) {
  if (!rule.guideline_ref || !rule.guideline_ref.guideline_id || !rule.guideline_ref.page) {
    console.error(`❌ Rule ${rule.id} is missing guideline citation!`);
    errors++;
  }
  if (isProd && rule.reviewed !== true) {
    console.error(`❌ Rule ${rule.id} has reviewed: false in production!`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`Validation failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log(`✅ All ${DANGER_RULES.length} danger rules validated successfully against guideline registry.`);
}

