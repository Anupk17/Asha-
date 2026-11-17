/**
 * Pure, unit-tested due-date calculation engine for ASHA Voice Register.
 * Ensures consistent Asia/Kolkata (IST, UTC+05:30) date handling across
 * month boundaries and leap years.
 */

export interface ScheduleOffsetRule {
  type: 'days' | 'weeks' | 'months' | 'weeks_before_edd';
  value: number;
  anchor: 'date_of_birth' | 'expected_delivery_date' | 'last_visit';
}

export interface GuidelineRef {
  guideline_id: string;
  section: string;
  page: string;
  version: string;
}

export interface ScheduleRule {
  id: string;
  applies_to: string[];
  category: string;
  title: string;
  description: string;
  offset_rule: ScheduleOffsetRule;
  guideline_ref: GuidelineRef;
  reviewed: boolean;
}

/**
 * Returns the current date in Asia/Kolkata (IST) as YYYY-MM-DD.
 */
export function getTodayIST(refDate: Date = new Date()): string {
  // Asia/Kolkata is UTC + 5h 30m
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const utc = refDate.getTime() + refDate.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + istOffsetMs);
  return formatISODate(istDate.getUTCFullYear(), istDate.getUTCMonth() + 1, istDate.getUTCDate());
}

/**
 * Formats year, month, day into YYYY-MM-DD.
 */
export function formatISODate(year: number, month: number, day: number): string {
  const y = String(year).padStart(4, '0');
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parses a YYYY-MM-DD string into [year, month, day] safely without timezone drift.
 */
export function parseISODateParts(isoString: string): [number, number, number] {
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid ISO date format: "${isoString}". Expected YYYY-MM-DD.`);
  }
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

/**
 * Checks whether a given year is a leap year.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns the number of days in a given month.
 */
export function getDaysInMonth(year: number, month: number): number {
  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}

/**
 * Adds an arbitrary number of days to an ISO date string (YYYY-MM-DD).
 * Handles positive or negative day counts across month and leap-year boundaries.
 */
export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = parseISODateParts(isoDate);
  // Use UTC date arithmetic to avoid daylight savings or local time zone quirks
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return formatISODate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

/**
 * Adds weeks to an ISO date string.
 */
export function addWeeks(isoDate: string, weeks: number): string {
  return addDays(isoDate, weeks * 7);
}

/**
 * Subtracts weeks from an ISO date string (used for EDD backward offsets).
 */
export function subtractWeeks(isoDate: string, weeks: number): string {
  return addDays(isoDate, -weeks * 7);
}

/**
 * Evaluates whether a due date is overdue compared to a reference date (defaults to today IST).
 */
export function isOverdue(dueDateISO: string, referenceDateISO?: string): boolean {
  const today = referenceDateISO || getTodayIST();
  return dueDateISO < today;
}

/**
 * Calculates due date for a specific guideline schedule based on beneficiary attributes.
 */
export function calculateScheduleDueDate(
  rule: ScheduleRule,
  beneficiary: { date_of_birth?: string; expected_delivery_date?: string }
): string | null {
  const { offset_rule } = rule;

  if (offset_rule.anchor === 'date_of_birth') {
    if (!beneficiary.date_of_birth) return null;

    if (offset_rule.type === 'days') {
      return addDays(beneficiary.date_of_birth, offset_rule.value);
    }
    if (offset_rule.type === 'weeks') {
      return addWeeks(beneficiary.date_of_birth, offset_rule.value);
    }
  }

  if (offset_rule.anchor === 'expected_delivery_date') {
    if (!beneficiary.expected_delivery_date) return null;

    if (offset_rule.type === 'weeks_before_edd') {
      return subtractWeeks(beneficiary.expected_delivery_date, offset_rule.value);
    }
    if (offset_rule.type === 'days') {
      return addDays(beneficiary.expected_delivery_date, offset_rule.value);
    }
  }

  return null;
}

