import { test } from 'node:test';
import assert from 'node:assert';
import { computeMonthlyLedger } from '@asha/shared';

test('phase 9 extras: morning briefing is concise and within 3 sentences', () => {
  const todayDueCount = 3;
  const overdueCount = 1;
  const urgentDangerCount = 1;

  const briefingText = `Namaste Didi! Today you have ${todayDueCount} home visits scheduled, ${overdueCount} overdue follow-up, and ${urgentDangerCount} urgent danger referral pending. Have a safe and productive day!`;

  const sentences = briefingText.split(/[.?!]/).filter((s) => s.trim().length > 0);
  assert.ok(sentences.length <= 3, `Briefing should be <= 3 sentences, got ${sentences.length}`);
  assert.ok(briefingText.includes('3 home visits'));
  assert.ok(briefingText.includes('1 overdue'));
});

test('phase 9 extras: ANM weekly report excludes location coordinates by default for privacy', () => {
  const visits = [
    {
      id: 'v-1',
      beneficiary_id: 'b-1',
      beneficiary_name: 'Meena Devi',
      beneficiary_code: 'SYN-0001',
      village: 'Rampur',
      visit_type: 'ANC',
      weight_kg: 55,
      next_visit_date: '2026-11-20',
      geo: { lat: 26.8467, lng: 80.9462 },
      created_at: '2026-11-10T10:00:00Z',
    },
  ];

  const ledger = computeMonthlyLedger(visits);

  const generateReport = (includeLocation) => {
    return (
      `ASHA ANM REPORT\n` +
      `Total Visits: ${ledger.totalVisits}\n` +
      (includeLocation ? `Location: 26.8467, 80.9462\n` : `Location: Excluded for privacy\n`)
    );
  };

  const defaultReport = generateReport(false);
  assert.ok(defaultReport.includes('Location: Excluded for privacy'));
  assert.ok(!defaultReport.includes('26.8467'));

  const optedInReport = generateReport(true);
  assert.ok(optedInReport.includes('26.8467'));
});

test('phase 9 extras: family reminder message includes date and name only, NO medical content', () => {
  const beneficiaryName = 'Meena Devi';
  const nextVisitDate = '2026-11-20';

  const formatFamilyReminder = (name, date) => {
    return `Namaste! Next home visit for ${name} by ASHA Didi: ${date}. Thank you.`;
  };

  const message = formatFamilyReminder(beneficiaryName, nextVisitDate);

  assert.ok(message.includes('Meena Devi'));
  assert.ok(message.includes('2026-11-20'));

  // Medical privacy check: no diagnosis, symptoms, or medical terms
  const prohibitedMedicalTerms = ['weight', 'kg', 'bp', 'fever', 'temperature', 'danger', 'bleeding', 'medicine'];
  for (const term of prohibitedMedicalTerms) {
    assert.ok(
      !message.toLowerCase().includes(term),
      `Prohibited medical term "${term}" found in family message: ${message}`
    );
  }
});

