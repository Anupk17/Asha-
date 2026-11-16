import { printClinicalRulesReviewTable, DANGER_RULES } from '../dist/danger/engine.js';

console.log('# CLINICAL DANGER-SIGN RULES REVIEW TABLE');
console.log(`Total rules loaded: ${DANGER_RULES.length}\n`);
console.log(printClinicalRulesReviewTable());

