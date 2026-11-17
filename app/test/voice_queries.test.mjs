import test from 'node:test';
import assert from 'node:assert';
import { processVoiceQuery } from '../src/utils/voiceQueries.ts';

const SAMPLE_FOLLOWUPS = [
  {
    id: 'fu-1',
    beneficiary_id: 'SYN-0001',
    beneficiary_name: 'Meena Devi',
    beneficiary_code: 'SYN-0001',
    village: 'Rampur',
    type: 'ANC Checkup 3',
    due_date: '2026-11-16', // Today
    status: 'pending',
    source: 'guideline_schedule',
    created_at: '2026-11-01',
  },
  {
    id: 'fu-2',
    beneficiary_id: 'SYN-0002',
    beneficiary_name: 'Sunita Devi',
    beneficiary_code: 'SYN-0002',
    village: 'Rampur',
    type: 'ANC Checkup 2',
    due_date: '2026-11-16', // Today
    status: 'pending',
    source: 'guideline_schedule',
    created_at: '2026-11-01',
  },
  {
    id: 'fu-3',
    beneficiary_id: 'SYN-0003',
    beneficiary_name: 'Pooja Kumari',
    beneficiary_code: 'SYN-0003',
    village: 'Kishanpur',
    type: 'Referral Check',
    due_date: '2026-11-14', // Overdue
    status: 'overdue',
    source: 'visit_record',
    is_danger_referral: true,
    created_at: '2026-11-01',
  },
  {
    id: 'fu-4',
    beneficiary_id: 'SYN-0004',
    beneficiary_name: 'Aarav Singh',
    beneficiary_code: 'SYN-0004',
    village: 'Kishanpur',
    type: 'HBNC Day 7',
    due_date: '2026-11-17', // Tomorrow
    status: 'pending',
    source: 'guideline_schedule',
    created_at: '2026-11-01',
  },
  {
    id: 'fu-5',
    beneficiary_id: 'SYN-0005',
    beneficiary_name: 'Kavita Kumari',
    beneficiary_code: 'SYN-0005',
    village: 'Rampur',
    type: 'UIP 6-Week Immunization',
    due_date: '2026-11-16', // Today
    status: 'pending',
    source: 'guideline_schedule',
    created_at: '2026-11-01',
  },
  {
    id: 'fu-6',
    beneficiary_id: 'SYN-0006',
    beneficiary_name: 'Geeta Sharma',
    beneficiary_code: 'SYN-0006',
    village: 'Chandpur',
    type: 'PNC Day 14',
    due_date: '2026-11-16', // Today (4th for today)
    status: 'pending',
    source: 'guideline_schedule',
    created_at: '2026-11-01',
  },
];

const REF_DATE = '2026-11-16';

test('voice query: "Aaj kiske follow-up pending hain?" answers with max 2 sentences and first 3 names when > 3 items', () => {
  const result = processVoiceQuery('Aaj kiske follow-up pending hain?', SAMPLE_FOLLOWUPS, 'en', REF_DATE);

  assert.strictEqual(result.type, 'today_pending');
  assert.strictEqual(result.matchedTasks.length, 4);

  // Requirement: at most 2 spoken sentences
  const sentences = result.spokenResponse.split(/[.!?]/).filter((s) => s.trim().length > 0);
  assert.ok(sentences.length <= 2, `Must be at most 2 sentences: got ${sentences.length}`);

  // Requirement: if > 3 items, say count and first 3 names
  assert.ok(result.spokenResponse.includes('4 visits'));
  assert.ok(result.spokenResponse.includes('Meena Devi'));
  assert.ok(result.spokenResponse.includes('Sunita Devi'));
  assert.ok(result.spokenResponse.includes('Kavita Kumari'));
  assert.ok(result.spokenResponse.includes('1 more'));
  assert.ok(result.spokenResponse.includes('screen'));
});

test('voice query: "Kal kiska visit hai?" answers tomorrow\'s visits', () => {
  const result = processVoiceQuery('Kal kiska visit hai?', SAMPLE_FOLLOWUPS, 'en', REF_DATE);

  assert.strictEqual(result.type, 'tomorrow_visits');
  assert.strictEqual(result.matchedTasks.length, 1);
  assert.ok(result.spokenResponse.includes('Aarav Singh'));
});

test('voice query: "Overdue kaun hai?" answers overdue visits', () => {
  const result = processVoiceQuery('Overdue kaun hai?', SAMPLE_FOLLOWUPS, 'en', REF_DATE);

  assert.strictEqual(result.type, 'overdue');
  assert.strictEqual(result.matchedTasks.length, 1);
  assert.ok(result.spokenResponse.includes('Pooja Kumari'));
});

test('voice query: "Meena ka next visit kab hai?" looks up specific beneficiary schedule', () => {
  const result = processVoiceQuery('Meena ka next visit kab hai?', SAMPLE_FOLLOWUPS, 'en', REF_DATE);

  assert.strictEqual(result.type, 'beneficiary_next');
  assert.strictEqual(result.targetBeneficiary, 'Meena Devi');
  assert.ok(result.spokenResponse.includes('2026-11-16'));
  assert.ok(result.spokenResponse.includes('ANC Checkup 3'));
});

test('voice query: "Meena ka visit ho gaya" identifies spoken completion', () => {
  const result = processVoiceQuery('Meena ka visit ho gaya', SAMPLE_FOLLOWUPS, 'en', REF_DATE);

  assert.strictEqual(result.type, 'mark_done');
  assert.ok(result.markedDoneTask);
  assert.strictEqual(result.markedDoneTask.beneficiary_name, 'Meena Devi');
  assert.ok(result.spokenResponse.includes('Confirmed'));
});

test('voice query: Hindi voice queries with respectful tone', () => {
  const resHindi = processVoiceQuery('आज किसके फॉलो-अप पेंडिंग हैं?', SAMPLE_FOLLOWUPS, 'hi', REF_DATE);
  assert.strictEqual(resHindi.type, 'today_pending');
  assert.ok(resHindi.spokenResponse.includes('आज'));
  assert.ok(resHindi.spokenResponse.includes('Meena') || resHindi.spokenResponse.includes('मीना'));

  const resOverdue = processVoiceQuery('ओवरड्यू कौन है?', SAMPLE_FOLLOWUPS, 'hi', REF_DATE);
  assert.strictEqual(resOverdue.type, 'overdue');
  assert.ok(resOverdue.spokenResponse.includes('Pooja Kumari'));
});
