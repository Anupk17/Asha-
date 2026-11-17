import { Visit, FollowUp, Beneficiary } from '../index.js';
import { addDays, getTodayIST, calculateScheduleDueDate, ScheduleRule } from './calculator.js';
import schedulesData from './schedules.json';

export const SCHEDULES: ScheduleRule[] = schedulesData as ScheduleRule[];

export interface GenerateFollowupsOptions {
  visit: Visit;
  beneficiary?: Beneficiary | null;
  existingFollowUps?: FollowUp[];
  referenceDateISO?: string;
}

/**
 * Client-side follow-up task generation engine.
 * Generates tasks from:
 * (a) Spoken next_visit_date
 * (b) Vaccinations due
 * (c) Guideline schedules using DOB or EDD
 * (d) Referral check task due the next day (+1 day) whenever a danger sign was flagged.
 * Strictly prevents duplicate tasks.
 */
export function generateFollowUpsForVisit(options: GenerateFollowupsOptions): FollowUp[] {
  const { visit, beneficiary, existingFollowUps = [], referenceDateISO } = options;
  const today = referenceDateISO || getTodayIST();
  const newTasks: FollowUp[] = [];

  const bName = visit.beneficiary_name || beneficiary?.name || 'Beneficiary';
  const bCode = visit.beneficiary_code || beneficiary?.code || 'SYN-0001';
  const bId = visit.beneficiary_id || beneficiary?.id || bCode;
  const village = visit.village || beneficiary?.village || 'Rampur';

  // Helper to prevent duplicate tasks
  const isDuplicate = (type: string, dueDate: string): boolean => {
    return (
      existingFollowUps.some(
        (f) =>
          f.beneficiary_code === bCode &&
          f.type.toLowerCase().trim() === type.toLowerCase().trim() &&
          f.due_date === dueDate &&
          f.status !== 'done' &&
          f.status !== 'cancelled'
      ) ||
      newTasks.some(
        (t) =>
          t.beneficiary_code === bCode &&
          t.type.toLowerCase().trim() === type.toLowerCase().trim() &&
          t.due_date === dueDate
      )
    );
  };

  // (d) Priority 1: Referral check task due the NEXT DAY (+1 day) whenever a danger sign was flagged!
  if (visit.danger_flags && visit.danger_flags.length > 0) {
    const nextDay = addDays(today, 1);
    const dangerType = 'Urgent Danger Sign Referral Check';

    if (!isDuplicate(dangerType, nextDay)) {
      newTasks.push({
        id: `fu-danger-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        visit_id: visit.id,
        beneficiary_id: bId,
        beneficiary_name: bName,
        beneficiary_code: bCode,
        village,
        type: dangerType,
        due_date: nextDay,
        status: 'pending',
        source: 'visit_record',
        guideline_ref: 'MoHFW Maternal/Child Danger Signs Protocol (Follow-up within 24-48 hours)',
        is_danger_referral: true,
        created_at: new Date().toISOString(),
      });
    }
  }

  // (a) Task from the spoken next_visit_date
  if (visit.next_visit_date) {
    const taskType = `${visit.visit_type} Follow-up Visit`;
    if (!isDuplicate(taskType, visit.next_visit_date)) {
      newTasks.push({
        id: `fu-spoken-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        visit_id: visit.id,
        beneficiary_id: bId,
        beneficiary_name: bName,
        beneficiary_code: bCode,
        village,
        type: taskType,
        due_date: visit.next_visit_date,
        status: 'pending',
        source: 'visit_record',
        guideline_ref: 'ASHA Home Visit Protocol',
        is_danger_referral: false,
        created_at: new Date().toISOString(),
      });
    }
  }

  // (b) Tasks from vaccinations_due
  if (visit.vaccinations_due && visit.vaccinations_due.length > 0) {
    for (const vax of visit.vaccinations_due) {
      const vaxTaskType = `Vaccination: ${vax}`;
      // Schedule for next visit date or next weekly immunization day (default +7 days)
      const vaxDueDate = visit.next_visit_date || addDays(today, 7);

      if (!isDuplicate(vaxTaskType, vaxDueDate)) {
        newTasks.push({
          id: `fu-vax-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          visit_id: visit.id,
          beneficiary_id: bId,
          beneficiary_name: bName,
          beneficiary_code: bCode,
          village,
          type: vaxTaskType,
          due_date: vaxDueDate,
          status: 'pending',
          source: 'visit_record',
          guideline_ref: 'Universal Immunization Programme (UIP Schedule 2023)',
          is_danger_referral: false,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  // (c) Guideline schedules using date_of_birth or expected_delivery_date
  if (beneficiary) {
    const bType = beneficiary.type;
    const applicableSchedules = SCHEDULES.filter((s) => s.applies_to.includes(bType));

    for (const schedule of applicableSchedules) {
      const calculatedDate = calculateScheduleDueDate(schedule, beneficiary);
      if (calculatedDate && calculatedDate >= today) {
        if (!isDuplicate(schedule.title, calculatedDate)) {
          newTasks.push({
            id: `fu-sched-${schedule.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            visit_id: visit.id,
            beneficiary_id: bId,
            beneficiary_name: bName,
            beneficiary_code: bCode,
            village,
            type: schedule.title,
            due_date: calculatedDate,
            status: 'pending',
            source: 'guideline_schedule',
            guideline_ref: `${schedule.guideline_ref.guideline_id} (Sec ${schedule.guideline_ref.section}, p.${schedule.guideline_ref.page})`,
            is_danger_referral: false,
            created_at: new Date().toISOString(),
          });
        }
      }
    }
  }

  return newTasks;
}
