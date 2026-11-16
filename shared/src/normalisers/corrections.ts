import { parseSpokenNumber } from './numbers.js';
import { parseRelativeDate } from './dates.js';

export interface CorrectionResult {
  isCorrection: boolean;
  field: string | null;
  parsedValue: any;
  rawFragment: string;
}

const CORRECTION_START_TRIGGERS = [
  'no', 'nahi', 'nahin', 'नहीं', 'galat', 'गलत', 'actually', 'badlo', 'बदलो',
  'change', 'wrong', 'mistake', 'correct karo', 'sorry', 'correction'
];

/**
 * Detects whether an utterance is a spoken correction and extracts the specific field and replacement value.
 * e.g., "no, weight is 2.8 kilo" -> { field: 'weight_kg', parsedValue: 2.8 }
 * Note: Must not falsely trigger on symptom phrases like "doodh nahi pee raha" (unable to feed).
 */
export function detectCorrection(utterance: string): CorrectionResult {
  if (!utterance) {
    return { isCorrection: false, field: null, parsedValue: null, rawFragment: '' };
  }

  const clean = utterance.toLowerCase().trim();

  // Exclude common negative symptom phrases (e.g. "doodh nahi", "nahi pee", "hosh nahi")
  const isNegativeSymptomOnly =
    clean.includes('doodh nahi') ||
    clean.includes('nahi pee') ||
    clean.includes('nahi pi') ||
    clean.includes('hosh nahi');

  // Check if utterance starts with a correction trigger or has a clause starting with a correction trigger
  const hasTrigger = CORRECTION_START_TRIGGERS.some((trig) => {
    // Unicode-aware word boundary matching at start, space, or punctuation
    const regex = new RegExp(`(?:^|[\\s,;!?.])` + trig + `(?:$|[\\s,;!?.])`, 'iu');
    return regex.test(clean);
  });

  if (!hasTrigger || (isNegativeSymptomOnly && !clean.match(/^(?:no|nahi|nahin|नहीं|galat|गलत|actually|badlo|change)/iu))) {
    return { isCorrection: false, field: null, parsedValue: null, rawFragment: '' };
  }

  // 1. Weight Correction
  if (clean.includes('weight') || clean.includes('vajan') || clean.includes('kilo') || clean.includes('kg') || clean.includes('वजन') || clean.includes('किलो')) {
    const weightMatch =
      clean.match(/(?:weight|vajan|kilo|kg|वजन|किलो)\s*(?:is|tha|hai|hoga|=|:)?\s*(\d+(?:\s*(?:point|\.)\s*\d+)?)/) ||
      clean.match(/(\d+(?:\s*(?:point|\.)\s*\d+)?)\s*(?:kilo|kg|किलो)/);

    const num = weightMatch ? parseSpokenNumber(weightMatch[1]) : parseSpokenNumber(clean);
    if (num !== null) {
      return { isCorrection: true, field: 'weight_kg', parsedValue: num, rawFragment: utterance };
    }
  }

  // 2. Temperature Correction
  if (clean.includes('temperature') || clean.includes('tapman') || clean.includes('bukhar') || clean.includes('fever') || clean.includes('taap') || clean.includes('तापमान') || clean.includes('बुखार')) {
    const tempMatch =
      clean.match(/(?:temperature|tapman|bukhar|fever|taap|तापमान|बुखार)\s*(?:is|tha|hai|hoga|=|:)?\s*(\d+(?:\s*(?:point|\.)\s*\d+)?)/) ||
      clean.match(/(\d+(?:\s*(?:point|\.)\s*\d+)?)\s*(?:degree|celsius|fahrenheit|डिग्री)/);

    const num = tempMatch ? parseSpokenNumber(tempMatch[1]) : parseSpokenNumber(clean);
    if (num !== null) {
      return { isCorrection: true, field: 'temperature_c', parsedValue: num, rawFragment: utterance };
    }
  }

  // 3. Breaths / Respiration Correction
  if (clean.includes('breath') || clean.includes('saans') || clean.includes('respiration') || clean.includes('सांस')) {
    const breathsMatch =
      clean.match(/(?:breath|breaths|saans|सांस)\s*(?:is|tha|hai|hoga|per minute|prati minute)?\s*(\d+)/) ||
      clean.match(/(\d+)\s*(?:breaths|saans|सांस)/);

    const num = breathsMatch ? parseSpokenNumber(breathsMatch[1]) : parseSpokenNumber(clean);
    if (num !== null) {
      return { isCorrection: true, field: 'breaths_per_min', parsedValue: Math.round(num), rawFragment: utterance };
    }
  }

  // 4. Date Correction
  if (clean.includes('date') || clean.includes('tarikh') || clean.includes('tareekh') || clean.includes('somvar') || clean.includes('kal') || clean.includes('तारीख') || clean.includes('कल')) {
    const iso = parseRelativeDate(clean);
    if (iso !== null) {
      return { isCorrection: true, field: 'next_visit_date', parsedValue: iso, rawFragment: utterance };
    }
  }

  return { isCorrection: true, field: null, parsedValue: null, rawFragment: utterance };
}
