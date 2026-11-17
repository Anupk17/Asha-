import { FollowUp, Visit } from '../index.js';
import { getTodayIST, isOverdue } from './calculator.js';

/**
 * Automatically updates status from 'pending' to 'overdue' when due_date has passed.
 */
export function updateFollowUpStatuses(followUps: FollowUp[], referenceDateISO?: string): FollowUp[] {
  const today = referenceDateISO || getTodayIST();

  return followUps.map((item) => {
    if (item.status === 'pending' && isOverdue(item.due_date, today)) {
      return { ...item, status: 'overdue' as const };
    }
    return item;
  });
}

/**
 * Automatically marks pending/overdue follow-ups as 'done' when a new confirmed visit
 * for that beneficiary is recorded within the window.
 */
export function autoMarkFollowUpsDoneOnVisit(followUps: FollowUp[], visit: Visit): FollowUp[] {
  const completedAt = visit.confirmed_at || new Date().toISOString();
  const bCode = visit.beneficiary_code;
  const bId = visit.beneficiary_id;

  return followUps.map((item) => {
    const isSameBeneficiary =
      (bCode && item.beneficiary_code === bCode) ||
      (bId && item.beneficiary_id === bId);

    if (!isSameBeneficiary || item.status === 'done') {
      return item;
    }

    // Match if task type corresponds to visit type or general follow-up
    const itemTypeLower = item.type.toLowerCase();
    const visitTypeLower = (visit.visit_type || '').toLowerCase();

    const isMatchingType =
      itemTypeLower.includes(visitTypeLower) ||
      itemTypeLower.includes('follow-up') ||
      itemTypeLower.includes('visit') ||
      itemTypeLower.includes('checkup');

    if (isMatchingType) {
      return {
        ...item,
        status: 'done' as const,
        completed_at: completedAt,
      };
    }

    return item;
  });
}

/**
 * Parses a voice completion command like "Meena ka visit ho gaya" or "Pooja done"
 * and locates the matching pending or overdue follow-up task.
 */
export function findFollowUpByVoiceCommand(
  followUps: FollowUp[],
  spokenText: string
): { matchedTask: FollowUp | null; beneficiaryName: string | null } {
  const clean = spokenText.toLowerCase().trim();

  // Check if utterance is a completion command
  const isDoneCommand =
    clean.includes('ho gaya') ||
    clean.includes('done') ||
    clean.includes('complete') ||
    clean.includes('ho chuka') ||
    clean.includes('khatam') ||
    clean.includes('kar diya');

  if (!isDoneCommand) {
    return { matchedTask: null, beneficiaryName: null };
  }

  // Look for beneficiary name mentions
  const activeTasks = followUps.filter((f) => f.status === 'pending' || f.status === 'overdue');

  for (const task of activeTasks) {
    const firstName = task.beneficiary_name.split(' ')[0].toLowerCase();
    const code = task.beneficiary_code.toLowerCase();

    if (clean.includes(firstName) || clean.includes(code)) {
      return { matchedTask: task, beneficiaryName: task.beneficiary_name };
    }
  }

  return { matchedTask: null, beneficiaryName: null };
}
