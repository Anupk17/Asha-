#!/usr/bin/env node

/**
 * ============================================================================
 * CLINICAL & INCENTIVE RULE GOVERNANCE BUILD GUARD
 * ============================================================================
 * Refuses production build if:
 * 1. Any clinical danger rule has reviewed: false or is missing guideline_ref.
 * 2. Any NHM incentive rule has reviewed: false or is missing official citation.
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const dangerSignsPath = path.join(rootDir, 'shared', 'src', 'danger', 'danger_signs.json');
const incentivesPath = path.join(rootDir, 'shared', 'src', 'incentives.json');

console.log('🩺 Verifying Clinical & Incentive Rule Governance...');

let errors = [];

// 1. Verify Danger Signs
if (!fs.existsSync(dangerSignsPath)) {
  errors.push(`Missing danger signs file at: ${dangerSignsPath}`);
} else {
  const dangerSigns = JSON.parse(fs.readFileSync(dangerSignsPath, 'utf8'));
  console.log(`Checking ${dangerSigns.length} clinical danger rules...`);

  for (const rule of dangerSigns) {
    if (!rule.reviewed) {
      errors.push(`Danger rule "${rule.id}" is marked reviewed: false! All rules must be clinically reviewed.`);
    }
    if (!rule.guideline_ref || !rule.guideline_ref.guideline_id || !rule.guideline_ref.section) {
      errors.push(`Danger rule "${rule.id}" lacks official guideline_ref citation.`);
    }
  }
}

// 2. Verify NHM Incentives
if (!fs.existsSync(incentivesPath)) {
  errors.push(`Missing incentives file at: ${incentivesPath}`);
} else {
  const incentives = JSON.parse(fs.readFileSync(incentivesPath, 'utf8'));
  console.log(`Checking ${incentives.length} NHM incentive activities...`);

  for (const activity of incentives) {
    if (!activity.reviewed) {
      errors.push(`Incentive activity "${activity.id}" is marked reviewed: false!`);
    }
    if (!activity.source_document || !activity.source_section) {
      errors.push(`Incentive activity "${activity.id}" lacks official NHM source document citation.`);
    }
  }
}

if (errors.length > 0) {
  console.error('\n❌ RULE GOVERNANCE VIOLATION DETECTED:');
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  console.error('\nProduction build ABORTED. Any real-world change requires clinician or health authority validation.\n');
  process.exit(1);
}

console.log('✅ Rule Governance verified: All rules are reviewed and cite official MoHFW/NHM guidelines.\n');
process.exit(0);

