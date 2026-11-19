import { test } from 'node:test';
import assert from 'node:assert';
import {
  INCENTIVE_ACTIVITIES,
  matchIncentiveActivity,
  checkMissingRequiredFields,
  computeMonthlyLedger,
} from '../dist/index.js';

test('incentive ledger: all registered activities cite official guidelines and reviewed:true', () => {
  assert.ok(INCENTIVE_ACTIVITIES.length >= 4, 'Expected at least 4 activities');

  for (const act of INCENTIVE_ACTIVITIES) {
    assert.ok(act.id, 'Missing activity ID');
    assert.ok(act.name, `Missing name for ${act.id}`);
    assert.ok(act.source_document, `Missing source_document for ${act.id}`);
    assert.ok(act.source_section, `Missing source_section for ${act.id}`);
    assert.ok(act.required_fields && act.required_fields.length > 0, `Missing required_fields for ${act.id}`);
    assert.strictEqual(act.reviewed, true, `Activity ${act.id} must be reviewed:true`);
  }
});

test('incentive ledger: matchIncentiveActivity correctly matches visits', () => {
  const ancVisit = { visit_type: 'ANC' };
  const matchedANC = matchIncentiveActivity(ancVisit);
  assert.ok(matchedANC);
  assert.strictEqual(matchedANC.id, 'nhm_anc_full_care');

  const hbncVisit = { visit_type: 'HBNC' };
  const matchedHBNC = matchIncentiveActivity(hbncVisit);
  assert.ok(matchedHBNC);
  assert.strictEqual(matchedHBNC.id, 'nhm_hbnc_home_visits');

  const immuVisit = { visit_type: 'immunisation' };
  const matchedImmu = matchIncentiveActivity(immuVisit);
  assert.ok(matchedImmu);
  assert.strictEqual(matchedImmu.id, 'nhm_routine_immunisation');

  // Danger sign referral takes priority
  const dangerVisit = { visit_type: 'ANC', danger_flags: ['severe_headache_blurred_vision'] };
  const matchedDanger = matchIncentiveActivity(dangerVisit);
  assert.ok(matchedDanger);
  assert.strictEqual(matchedDanger.id, 'nhm_emergency_referral_escort');
});

test('incentive ledger: checkMissingRequiredFields detects missing mandatory items', () => {
  const ancActivity = INCENTIVE_ACTIVITIES.find((a) => a.id === 'nhm_anc_full_care');
  assert.ok(ancActivity);

  // Missing weight and next visit date
  const incompleteVisit = {
    beneficiary_name: 'Pooja Kumari',
    village: 'Kishanpur',
    weight_kg: null,
    next_visit_date: undefined,
  };

  const missing = checkMissingRequiredFields(incompleteVisit, ancActivity);
  assert.ok(missing.includes('weight_kg'));
  assert.ok(missing.includes('next_visit_date'));
  assert.ok(!missing.includes('beneficiary_name'));
  assert.ok(!missing.includes('village'));

  // Complete visit
  const completeVisit = {
    beneficiary_name: 'Pooja Kumari',
    village: 'Kishanpur',
    weight_kg: 52.5,
    next_visit_date: '2026-11-20',
  };
  const noneMissing = checkMissingRequiredFields(completeVisit, ancActivity);
  assert.strictEqual(noneMissing.length, 0);
});

test('incentive ledger: computeMonthlyLedger calculates accurate counts and incomplete list', () => {
  const syntheticVisits = [
    {
      id: 'v-1',
      beneficiary_id: 'b-1',
      beneficiary_name: 'Meena Devi',
      beneficiary_code: 'SYN-0001',
      village: 'Rampur',
      visit_type: 'ANC',
      weight_kg: 54.0,
      next_visit_date: '2026-11-20',
      created_at: '2026-11-10T10:00:00Z',
    },
    {
      id: 'v-2',
      beneficiary_id: 'b-2',
      beneficiary_name: 'Rekha Pal',
      beneficiary_code: 'SYN-0005',
      village: 'Rampur',
      visit_type: 'ANC',
      weight_kg: null, // missing weight
      next_visit_date: '2026-11-22',
      created_at: '2026-11-12T10:00:00Z',
    },
    {
      id: 'v-3',
      beneficiary_id: 'b-3',
      beneficiary_name: 'Baby Sunita',
      beneficiary_code: 'SYN-0002',
      village: 'Rampur',
      visit_type: 'HBNC',
      weight_kg: 3.1,
      temperature_c: 36.8,
      breaths_per_min: 44,
      created_at: '2026-11-14T10:00:00Z',
    },
  ];

  const ledger = computeMonthlyLedger(syntheticVisits, '2026-11');
  assert.strictEqual(ledger.totalVisits, 3);
  assert.strictEqual(ledger.completeRecords, 2);
  assert.strictEqual(ledger.incompleteRecords.length, 1);
  assert.strictEqual(ledger.incompleteRecords[0].beneficiaryName, 'Rekha Pal');
  assert.ok(ledger.incompleteRecords[0].missingFields.includes('weight_kg'));
});
