/**
 * Health vocabulary and post-correction mapping for ASHA Voice Register.
 * Ensures canonical representation of health terms, vaccines, and facility types.
 */

export const HEALTH_VOCABULARY = [
  'TT injection',
  'TT booster',
  'ANC checkup',
  'PNC checkup',
  'IFA tablets',
  'BCG',
  'OPV',
  'Hep B',
  'HBNC',
  'HBYC',
  'PHC',
  'CHC',
  'ASHA',
  'ANM',
  'Pentavalent',
  'Rotavirus',
  'Measles Rubella',
  'MR 1',
  'Vitamin A',
  'DPT booster',
] as const;

export const POST_CORRECTION_MAP: Record<string, string> = {
  // TT Variations
  '\\btt\\s*tika\\b': 'TT injection',
  '\\btt\\s*ka\\s*tika\\b': 'TT injection',
  '\\btt\\s*dose\\b': 'TT injection',
  '\\btt\\s*injection\\b': 'TT injection',
  '\\btt\\s*booster\\b': 'TT booster',

  // IFA Variations
  '\\bifa\\s*goli\\b': 'IFA tablets',
  '\\bifa\\s*ki\\s*goli\\b': 'IFA tablets',
  '\\biron\\s*goli\\b': 'IFA tablets',
  '\\bifa\\s*tablets?\\b': 'IFA tablets',

  // Program / Facility Acronyms
  '\\bh\\s*b\\s*n\\s*c\\b': 'HBNC',
  '\\bhbnc\\b': 'HBNC',
  '\\bh\\s*b\\s*y\\s*c\\b': 'HBYC',
  '\\bhbyc\\b': 'HBYC',
  '\\bp\\s*h\\s*c\\b': 'PHC',
  '\\bphc\\b': 'PHC',
  '\\bc\\s*h\\s*c\\b': 'CHC',
  '\\bchc\\b': 'CHC',
  '\\ba\\s*s\\s*h\\s*a\\b': 'ASHA',
  '\\ba\\s*n\\s*m\\b': 'ANM',
  '\\banm\\b': 'ANM',

  // Vaccines
  '\\bb\\s*c\\s*g\\b': 'BCG',
  '\\bbcg\\b': 'BCG',
  '\\bo\\s*p\\s*v\\b': 'OPV',
  '\\bopv\\b': 'OPV',
  '\\bhep\\s*b\\b': 'Hep B',
  '\\bhepatitis\\s*b\\b': 'Hep B',
  '\\bpenta\\b': 'Pentavalent',
  '\\bpentavalent\\b': 'Pentavalent',
  '\\brota\\b': 'Rotavirus',
  '\\brotavirus\\b': 'Rotavirus',
  '\\bmr\\s*1\\b': 'MR 1',
  '\\bmeasles\\s*rubella\\b': 'Measles Rubella',
  '\\bdpt\\s*booster\\b': 'DPT booster',
};

/**
 * Normalises recognized voice transcripts to standard health nomenclature.
 * Never throws, safe on empty or malformed strings.
 */
export function applyVocabularyPostCorrection(transcript: string): string {
  if (!transcript) return '';

  let cleaned = transcript;
  for (const [pattern, canonical] of Object.entries(POST_CORRECTION_MAP)) {
    try {
      const regex = new RegExp(pattern, 'gi');
      cleaned = cleaned.replace(regex, canonical);
    } catch {
      // Ignore pattern compilation error if any
    }
  }

  return cleaned.trim();
}

