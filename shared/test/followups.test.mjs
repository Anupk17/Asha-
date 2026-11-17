import test from 'node:test';
import assert from 'node:assert';
import {
  isLeapYear,
  getDaysInMonth,
  addDays,
  addWeeks,
  subtractWeeks,
  isOverdue,
  getTodayIST,
  calculateScheduleDueDate,
  generateFollowUpsForVisit,
  updateFollowUpStatuses,
  autoMarkFollowUpsDoneOnVisit,
  findFollowUpByVoiceCommand,
  SCHEDULES,
} from '../dist/index.js';

test('due date calculator: leap year and month length validation', () => {
  assert.strictEqual(isLeapYear(2024), true, '2024 is a leap year');
  assert.strictEqual(isLeapYear(2026), false, '2026 is not a leap year');
  assert.strictEqual(isLeapYear(2000), true, '2000 is a leap year');
  assert.strictEqual(isLeapYear(1900), false, '1900 is not a leap year');

  assert.strictEqual(getDaysInMonth(2024, 2), 29, 'Feb 2024 has 29 days');
  assert.strictEqual(getDaysInMonth(2026, 2), 28, 'Feb 2026 has 28 days');
  assert.strictEqual(getDaysInMonth(2026, 4), 30, 'April has 30 days');
  assert.strictEqual(getDaysInMonth(2026, 12), 31, 'December has 31 days');
});

test('due date calculator: edge cases across month and year boundaries', () => {
  // 1. Month boundary non-leap year (Feb 28, 2026 -> Mar 1, 2026)
  assert.strictEqual(addDays('2026-02-28', 1), '2026-03-01');

  // 2. Month boundary leap year (Feb 28, 2024 -> Feb 29, 2024 -> Mar 1, 2024)
  assert.strictEqual(addDays('2024-02-28', 1), '2024-02-29');
  assert.strictEqual(addDays('2024-02-28', 2), '2024-03-01');

  // 3. Year boundary (Dec 30, 2026 + 5 days -> Jan 4, 2027)
  assert.strictEqual(addDays('2026-12-30', 5), '2027-01-04');

  // 4. Adding 42 days (HBNC 6-week visit) to DOB 2026-10-01
  assert.strictEqual(addDays('2026-10-01', 42), '2026-11-12');

  // 5. EDD subtraction (4 weeks before EDD 2026-12-01)
  assert.strictEqual(subtractWeeks('2026-12-01', 4), '2026-11-03');
});

test('due date calculator: overdue check with reference date', () => {
  const refDate = '2026-11-16';

  assert.strictEqual(isOverdue('2026-11-14', refDate), true, 'Past date is overdue');
  assert.strictEqual(isOverdue('2026-11-16', refDate), false, 'Today is not overdue');
  assert.strictEqual(isOverdue('2026-11-20', refDate), false, 'Future date is not overdue');
});

test('followup generator: creates urgent danger referral check due the next day (+1 day)', () => {
  const refDate = '2026-11-16';
  const visit = {
    id: 'visit-danger-101',
    beneficiary_id: 'SYN-0003',
    beneficiary_name: 'Pooja Kumari',
    beneficiary_code: 'SYN-0003',
    village: 'Kishanpur',
    visit_type: 'ANC',
    danger_flags: ['Severe Headache / Blurred Vision (High BP Alert)'],
    danger_unknowns: [],
    rules_version: '2026.11',
    vaccinations_due: [],
    status: 'confirmed',
    created_at: '2026-11-16T10:00:00Z',
  };

  const tasks = generateFollowUpsForVisit({
    visit,
    referenceDateISO: refDate,
  });

  const dangerTask = tasks.find((t) => t.is_danger_referral);
  assert.ok(dangerTask, 'Must create a danger referral check task');
  assert.strictEqual(dangerTask.due_date, '2026-11-17', 'Danger referral task must be due the NEXT day (+1 day)');
  assert.strictEqual(dangerTask.type, 'Urgent Danger Sign Referral Check');
  assert.ok(dangerTask.guideline_ref.includes('Danger Signs'));
});

test('followup generator: newborn visit creates HBNC and UIP schedule tasks without duplicates', () => {
  const refDate = '2026-11-16';
  const beneficiary = {
    id: 'b-001',
    code: 'SYN-0004',
    name: 'Aarav Singh',
    type: 'newborn',
    village: 'Kishanpur',
    language: 'hi',
    date_of_birth: '2026-11-10', // Born 6 days ago
    created_at: '2026-11-10T00:00:00Z',
  };

  const visit = {
    id: 'visit-nb-102',
    beneficiary_id: 'SYN-0004',
    beneficiary_name: 'Aarav Singh',
    beneficiary_code: 'SYN-0004',
    village: 'Kishanpur',
    visit_type: 'newborn',
    weight_kg: 3.1,
    vaccinations_due: ['OPV-0', 'BCG'],
    next_visit_date: '2026-11-24',
    danger_flags: [],
    danger_unknowns: [],
    rules_version: '2026.11',
    status: 'confirmed',
    created_at: '2026-11-16T10:00:00Z',
  };

  const tasks = generateFollowUpsForVisit({
    visit,
    beneficiary,
    referenceDateISO: refDate,
  });

  // 1. Spoken next visit task
  const spokenTask = tasks.find((t) => t.type === 'newborn Follow-up Visit');
  assert.ok(spokenTask, 'Must create task for spoken next visit date');
  assert.strictEqual(spokenTask.due_date, '2026-11-24');

  // 2. Vaccination tasks
  const opvTask = tasks.find((t) => t.type.includes('OPV-0'));
  assert.ok(opvTask, 'Must create task for OPV-0');

  // 3. Guideline schedule tasks (Day 7 is 2026-11-17, Day 14 is 2026-11-24, Day 28 is 2026-12-08)
  const hbncDay7 = tasks.find((t) => t.type.includes('Day 7'));
  assert.ok(hbncDay7, 'Must generate Day 7 HBNC visit');
  assert.strictEqual(hbncDay7.due_date, '2026-11-17');

  // 4. Duplicate prevention test
  const duplicateRunTasks = generateFollowUpsForVisit({
    visit,
    beneficiary,
    existingFollowUps: tasks,
    referenceDateISO: refDate,
  });

  assert.strictEqual(duplicateRunTasks.length, 0, 'No duplicate tasks should be created when existing tasks are provided');
});

test('followup status: auto-updates pending to overdue and marks completed on visit', () => {
  const today = '2026-11-16';
  const followUps = [
    {
      id: 'task-1',
      beneficiary_id: 'SYN-0001',
      beneficiary_name: 'Meena Devi',
      beneficiary_code: 'SYN-0001',
      village: 'Rampur',
      type: 'ANC Checkup 3',
      due_date: '2026-11-14', // 2 days ago
      status: 'pending',
      source: 'guideline_schedule',
      created_at: '2026-11-01',
    },
    {
      id: 'task-2',
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
      id: 'task-3',
      beneficiary_id: 'SYN-0003',
      beneficiary_name: 'Pooja Kumari',
      beneficiary_code: 'SYN-0003',
      village: 'Kishanpur',
      type: 'ANC Checkup 4',
      due_date: '2026-11-20', // Future
      status: 'pending',
      source: 'guideline_schedule',
      created_at: '2026-11-01',
    },
  ];

  // 1. Check auto-overdue progression
  const updated = updateFollowUpStatuses(followUps, today);
  assert.strictEqual(updated[0].status, 'overdue', 'Past task must become overdue');
  assert.strictEqual(updated[1].status, 'pending', 'Due today remains pending');
  assert.strictEqual(updated[2].status, 'pending', 'Future task remains pending');

  // 2. Check auto-complete on confirmed visit
  const confirmedVisit = {
    id: 'visit-done-999',
    beneficiary_id: 'SYN-0001',
    beneficiary_code: 'SYN-0001',
    beneficiary_name: 'Meena Devi',
    visit_type: 'ANC',
    danger_flags: [],
    danger_unknowns: [],
    rules_version: '2026.11',
    vaccinations_due: [],
    status: 'confirmed',
    created_at: '2026-11-16T12:00:00Z',
    confirmed_at: '2026-11-16T12:05:00Z',
  };

  const markedDone = autoMarkFollowUpsDoneOnVisit(updated, confirmedVisit);
  assert.strictEqual(markedDone[0].status, 'done', 'Task for Meena Devi must be marked done upon confirmed visit');
  assert.strictEqual(markedDone[0].completed_at, '2026-11-16T12:05:00Z');
  assert.strictEqual(markedDone[1].status, 'pending', 'Other beneficiaries remain unaffected');
});

test('voice queries: handles "Meena ka visit ho gaya" spoken completion matching', () => {
  const followUps = [
    {
      id: 'fu-meena',
      beneficiary_id: 'SYN-0001',
      beneficiary_name: 'Meena Devi',
      beneficiary_code: 'SYN-0001',
      village: 'Rampur',
      type: 'ANC Follow-up Checkup',
      due_date: '2026-11-16',
      status: 'pending',
      source: 'visit_record',
      created_at: '2026-11-10',
    },
    {
      id: 'fu-pooja',
      beneficiary_id: 'SYN-0003',
      beneficiary_name: 'Pooja Kumari',
      beneficiary_code: 'SYN-0003',
      village: 'Kishanpur',
      type: 'Referral Check',
      due_date: '2026-11-15',
      status: 'overdue',
      source: 'visit_record',
      created_at: '2026-11-10',
    },
  ];

  // Voice completion query for Meena
  const match1 = findFollowUpByVoiceCommand(followUps, 'Meena ka visit ho gaya');
  assert.ok(match1.matchedTask);
  assert.strictEqual(match1.matchedTask.id, 'fu-meena');
  assert.strictEqual(match1.beneficiaryName, 'Meena Devi');

  // Voice completion query for Pooja
  const match2 = findFollowUpByVoiceCommand(followUps, 'Pooja done');
  assert.ok(match2.matchedTask);
  assert.strictEqual(match2.matchedTask.id, 'fu-pooja');

  // Irrelevant utterance
  const match3 = findFollowUpByVoiceCommand(followUps, 'Good morning');
  assert.strictEqual(match3.matchedTask, null);
});
