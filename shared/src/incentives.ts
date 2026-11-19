import INCENTIVES_DATA from './incentives.json';
import { Visit } from './index';

export interface IncentiveActivity {
  id: string;
  name: string;
  activity_category: string;
  match_visit_types: string[];
  required_fields: string[];
  requires_danger_flags?: boolean;
  source_document: string;
  source_section: string;
  reviewed: boolean;
}

export interface IncompleteRecord {
  visitId: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryCode: string;
  visitType: string;
  activityName: string;
  missingFields: string[];
  date: string;
}

export interface MonthlyLedgerSummary {
  totalVisits: number;
  completeRecords: number;
  incompleteRecords: IncompleteRecord[];
  activityCounts: Array<{
    id: string;
    name: string;
    guidelineRef: string;
    count: number;
    complete: number;
    incomplete: number;
  }>;
}

export const INCENTIVE_ACTIVITIES: IncentiveActivity[] = INCENTIVES_DATA as IncentiveActivity[];

/**
 * Matches a visit to its applicable official NHM activity definition.
 */
export function matchIncentiveActivity(visit: Partial<Visit>): IncentiveActivity | null {
  const visitType = (visit.visit_type || '').toLowerCase();
  const hasDanger = (visit.danger_flags && visit.danger_flags.length > 0) || false;

  // Emergency referral takes priority if danger signs are present
  if (hasDanger) {
    const referralActivity = INCENTIVE_ACTIVITIES.find((a) => a.id === 'nhm_emergency_referral_escort');
    if (referralActivity) return referralActivity;
  }

  return (
    INCENTIVE_ACTIVITIES.find((a) =>
      a.match_visit_types.some((t) => t.toLowerCase() === visitType)
    ) || null
  );
}

/**
 * Validates whether all required fields for this activity are present.
 * Returns an array of missing field names.
 */
export function checkMissingRequiredFields(
  visit: Partial<Visit>,
  activity: IncentiveActivity
): string[] {
  const missing: string[] = [];

  for (const field of activity.required_fields) {
    const val = (visit as any)[field];
    if (val === undefined || val === null || val === '') {
      missing.push(field);
    } else if (Array.isArray(val) && val.length === 0) {
      // e.g. vaccinations_due or danger_flags
      if (field === 'danger_flags' && activity.requires_danger_flags) {
        missing.push(field);
      }
    }
  }

  return missing;
}

/**
 * Computes monthly counts and identifies incomplete records across all recorded visits.
 * Complies with strict rule: No financial advice or payment promises.
 */
export function computeMonthlyLedger(
  visits: Visit[],
  targetYearMonth?: string // e.g. "2026-11"
): MonthlyLedgerSummary {
  const filteredVisits = targetYearMonth
    ? visits.filter((v) => v.created_at && v.created_at.startsWith(targetYearMonth))
    : visits;

  const incompleteRecords: IncompleteRecord[] = [];
  const activityMap = new Map<string, { total: number; complete: number; incomplete: number }>();

  INCENTIVE_ACTIVITIES.forEach((act) => {
    activityMap.set(act.id, { total: 0, complete: 0, incomplete: 0 });
  });

  for (const visit of filteredVisits) {
    const matchedActivity = matchIncentiveActivity(visit);
    if (matchedActivity) {
      const missing = checkMissingRequiredFields(visit, matchedActivity);
      const stats = activityMap.get(matchedActivity.id)!;
      stats.total += 1;

      if (missing.length > 0) {
        stats.incomplete += 1;
        incompleteRecords.push({
          visitId: visit.id,
          beneficiaryId: visit.beneficiary_id,
          beneficiaryName: visit.beneficiary_name || 'Beneficiary',
          beneficiaryCode: visit.beneficiary_code || 'SYN-0000',
          visitType: visit.visit_type,
          activityName: matchedActivity.name,
          missingFields: missing,
          date: visit.created_at ? visit.created_at.slice(0, 10) : '',
        });
      } else {
        stats.complete += 1;
      }
    }
  }

  const activityCounts = INCENTIVE_ACTIVITIES.map((act) => {
    const stats = activityMap.get(act.id) || { total: 0, complete: 0, incomplete: 0 };
    return {
      id: act.id,
      name: act.name,
      guidelineRef: `${act.source_document} (${act.source_section})`,
      count: stats.total,
      complete: stats.complete,
      incomplete: stats.incomplete,
    };
  });

  const totalVisits = filteredVisits.length;
  const completeRecords = totalVisits - incompleteRecords.length;

  return {
    totalVisits,
    completeRecords,
    incompleteRecords,
    activityCounts,
  };
}
