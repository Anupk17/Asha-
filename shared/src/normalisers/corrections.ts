import { parseSpokenNumber } from './numbers.js';
import { parseRelativeDate } from './dates.js';

export interface CorrectionResult {
  isCorrection: boolean;
  field: string | null;
  parsedValue: any;
  rawFragment: string;
}

const CORRECTION_TRIGGERS = [
  'no', 'nahi', 'nahin', 'galat', 'actually', 'badlo', 'change', 'wrong', 'mistake', 'correct karo'
];

/**
 * Detects whether an utterance is a spoken correction and extracts the specific field and replacement value.
 * e.g., "no, weight is 2.8 kilo" -> { field: 'weight_kg', parsedValue: 2.8 }
 */
export function detectCorrection(utterance: string): CorrectionResult {
  if (!utterance) {
    return { isCorrection: false, field: null, parsedValue: null, rawFragment: '' };
  }

  const clean = utterance.toLowerCase().trim();
  const hasTrigger = CORRECTION_TRIGGERS.some((trig) => {
    const regex = new RegExp(`\\b${trig}\\b`, 'i');
    return regex.test(clean);
  });

  if (!hasTrigger) {
    return { isCorrection: false, field: null, parsedValue: null, rawFragment: '' };
  }

  // 1. Weight Correction
  if (clean.includes('weight') || clean.includes('vajan') || clean.includes('kilo') || clean.includes('kg')) {
    const num = parseSpokenNumber(clean);
    if (num !== null) {
      return { isCorrection: true, field: 'weight_kg', parsedValue: num, rawFragment: utterance };
    }
  }

  // 2. Temperature Correction
  if (clean.includes('temperature') || clean.includes('tapman') || clean.includes('bukhar') || clean.includes('fever')) {
    const num = parseSpokenNumber(clean);
    if (num !== null) {
      return { isCorrection: true, field: 'temperature_c', parsedValue: num, rawFragment: utterance };
    }
  }

  // 3. Breaths / Respiration Correction
  if (clean.includes('breath') || clean.includes('saans') || clean.includes('respiration')) {
    const num = parseSpokenNumber(clean);
    if (num !== null) {
      return { isCorrection: true, field: 'breaths_per_min', parsedValue: Math.round(num), rawFragment: utterance };
    }
  }

  // 4. Date Correction
  if (clean.includes('date') || clean.includes('tarikh') || clean.includes('tareekh') || clean.includes('somvar') || clean.includes('kal')) {
    const iso = parseRelativeDate(clean);
    if (iso !== null) {
      return { isCorrection: true, field: 'next_visit_date', parsedValue: iso, rawFragment: utterance };
    }
  }

  return { isCorrection: true, field: null, parsedValue: null, rawFragment: utterance };
}

