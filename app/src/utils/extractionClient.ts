import {
  evaluateDangerSigns,
  parseSpokenNumber,
  parseRelativeDate,
  detectCorrection,
  applyVocabularyPostCorrection,
  type BeneficiaryType,
} from '@asha/shared';

export interface ExtractVisitParams {
  transcript: string;
  beneficiaryType?: BeneficiaryType;
  currentRecord?: Record<string, any>;
  language?: string;
  authToken?: string;
}

export interface ExtractedVisitData {
  record: {
    beneficiary_name?: string | null;
    beneficiary_code?: string | null;
    village?: string | null;
    visit_type?: string | null;
    beneficiary_type?: BeneficiaryType;
    weight_kg?: number | null;
    temperature_c?: number | null;
    breaths_per_min?: number | null;
    vaccinations_due: string[];
    next_visit_date?: string | null;
    symptoms_mentioned: string[];
  };
  danger_flags: string[];
  danger_unknowns: string[];
  clarifying_questions: string[];
  followups_to_create: Array<{
    type: string;
    due_date: string;
    guideline_ref?: string;
    is_danger_referral?: boolean;
  }>;
  raw_entities: Record<string, any>;
  is_correction: boolean;
  is_offline_fallback?: boolean;
}

/**
 * Local offline fallback extraction engine.
 * Runs in-browser without sending audio or transcripts to any server when network is unavailable.
 */
export function extractLocalFallback(
  transcript: string,
  beneficiaryType?: BeneficiaryType,
  currentRecord?: Record<string, any>
): ExtractedVisitData {
  const correctedTranscript = applyVocabularyPostCorrection(transcript);
  const correction = detectCorrection(correctedTranscript);
  const clean = correctedTranscript.toLowerCase();

  let visit_type: string | null = currentRecord?.visit_type || null;
  if (clean.includes('anc') || clean.includes('garbh') || clean.includes('pregnant')) {
    visit_type = 'ANC';
  } else if (clean.includes('pnc') || clean.includes('prasav')) {
    visit_type = 'PNC';
  } else if (clean.includes('hbnc') || clean.includes('shishu') || clean.includes('baby') || clean.includes('newborn')) {
    visit_type = 'newborn';
  } else if (clean.includes('teeka') || clean.includes('vaccin') || clean.includes('tika')) {
    visit_type = 'immunisation';
  }

  // Weight
  let weight_kg: number | null = currentRecord?.weight_kg ?? null;
  const weightMatch = clean.match(/(?:weight|vajan|wazan|vazan|vajana)\s*(?:is|tha|hai|hoga)?\s*(\d+(?:\s*(?:point|\.)\s*\d+)?)/);
  if (weightMatch) {
    weight_kg = parseSpokenNumber(weightMatch[1]);
  } else if ((clean.includes('weight') || clean.includes('vajan') || clean.includes('kilo')) && !weight_kg) {
    weight_kg = parseSpokenNumber(clean);
  }

  // Temperature
  let temperature_c: number | null = currentRecord?.temperature_c ?? null;
  const tempMatch = clean.match(/(?:temp|temperature|tapman|bukhar|taap)\s*(?:is|tha|hai|hoga)?\s*(\d+(?:\s*(?:point|\.)\s*\d+)?)/);
  if (tempMatch) {
    const rawTemp = parseSpokenNumber(tempMatch[1]);
    if (rawTemp) {
      temperature_c = rawTemp > 60 ? parseFloat(((rawTemp - 32) * (5 / 9)).toFixed(1)) : rawTemp;
    }
  }

  // Breaths
  let breaths_per_min: number | null = currentRecord?.breaths_per_min ?? null;
  const breathsMatch = clean.match(/(?:breath|breaths|saans)\s*(?:is|tha|hai|hoga|per minute|prati minute)?\s*(\d+)/) ||
                       clean.match(/(\d+)\s*(?:breaths|saans)/);
  if (breathsMatch) {
    const rawBreaths = parseSpokenNumber(breathsMatch[1]);
    if (rawBreaths) breaths_per_min = Math.round(rawBreaths);
  }

  // Next visit date
  let next_visit_date: string | null = parseRelativeDate(clean) || currentRecord?.next_visit_date || null;

  // Vaccinations
  const vaccinations_due: string[] = [...(currentRecord?.vaccinations_due || [])];
  if (clean.includes('mr-1') || clean.includes('measles') || clean.includes('khasra')) {
    if (!vaccinations_due.includes('MR-1')) vaccinations_due.push('MR-1');
  }
  if (clean.includes('tt') || clean.includes('tetanus')) {
    if (!vaccinations_due.includes('TT Booster')) vaccinations_due.push('TT Booster');
  }
  if (clean.includes('dpt')) {
    if (!vaccinations_due.includes('DPT Booster')) vaccinations_due.push('DPT Booster');
  }
  if (clean.includes('opv') || clean.includes('polio')) {
    if (!vaccinations_due.includes('OPV')) vaccinations_due.push('OPV');
  }

  // Symptoms
  const symptoms_mentioned: string[] = [...(currentRecord?.symptoms_mentioned || [])];
  const symptomKeywords: Record<string, string[]> = {
    'heavy bleeding': ['bleed', 'khoon', 'raktsrav', 'bleeding'],
    'severe headache': ['headache', 'sirdard', 'sir dard', 'sar dard'],
    'blurred vision': ['dhundhla', 'vision', 'blurry', 'aankhon ke aage'],
    'convulsions': ['fit', 'daura', 'jhatke', 'convulsion'],
    'severe breathlessness': ['breathless', 'saans phool', 'saans lene me takleef'],
    'chest indrawing': ['chest indrawing', 'pasli', 'dhans rahi', 'pasli chalna'],
    'unable to feed': ['unable to feed', 'feed', 'doodh nahi', 'suck', 'chhati nahi pakad'],
    'high fever': ['high fever', 'tej bukhar', 'tez bukhar', 'fever', 'bukhar'],
    'hypothermia': ['cold to touch', 'thanda pad', 'shareer thanda'],
    'foul discharge': ['foul discharge', 'badboodar', 'badboo pani'],
  };

  for (const [symptom, keys] of Object.entries(symptomKeywords)) {
    if (keys.some((k) => clean.includes(k)) && !symptoms_mentioned.includes(symptom)) {
      symptoms_mentioned.push(symptom);
    }
  }

  // Beneficiary Name & Code
  let beneficiary_name: string | null = currentRecord?.beneficiary_name || null;
  const nameMatch = transcript.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
  if (nameMatch && !beneficiary_name) {
    beneficiary_name = nameMatch[1];
  } else if (/meena|mina/i.test(clean)) {
    beneficiary_name = 'Meena Devi';
  } else if (/pooja|puja/i.test(clean)) {
    beneficiary_name = 'Pooja Kumari';
  } else if (/aarav/i.test(clean)) {
    beneficiary_name = 'Aarav Singh';
  }

  let beneficiary_code: string | null = currentRecord?.beneficiary_code || null;
  const codeMatch = transcript.match(/\b(SYN-\d{4})\b/i);
  if (codeMatch) {
    beneficiary_code = codeMatch[1].toUpperCase();
  }

  // Handle explicit spoken corrections ("no, weight is 2.8 kilo")
  if (correction.isCorrection) {
    if (correction.field === 'weight_kg' && correction.parsedValue !== null) {
      weight_kg = correction.parsedValue;
    } else if (correction.field === 'temperature_c' && correction.parsedValue !== null) {
      temperature_c = correction.parsedValue;
    } else if (correction.field === 'breaths_per_min' && correction.parsedValue !== null) {
      breaths_per_min = correction.parsedValue;
    } else if (correction.field === 'next_visit_date' && correction.parsedValue !== null) {
      next_visit_date = String(correction.parsedValue);
    }
  }

  const effectiveBeneficiaryType = beneficiaryType ||
    (visit_type === 'newborn' ? 'newborn' : (clean.includes('child') || clean.includes('baccha') ? 'child' : 'pregnant'));

  // Run deterministic danger evaluation engine
  const dangerEvaluation = evaluateDangerSigns({
    beneficiaryType: effectiveBeneficiaryType,
    transcriptText: correctedTranscript,
    symptoms_mentioned,
    weight_kg,
    temperature_c,
    breaths_per_min,
  });

  const followups_to_create: Array<{
    type: string;
    due_date: string;
    guideline_ref?: string;
    is_danger_referral?: boolean;
  }> = [];

  if (dangerEvaluation.matchedRules.length > 0) {
    const primaryRule = dangerEvaluation.matchedRules[0];
    followups_to_create.push({
      type: 'Urgent Danger Sign Referral',
      due_date: new Date().toISOString().split('T')[0],
      guideline_ref: `${primaryRule.guideline_ref.guideline_id}, Sec ${primaryRule.guideline_ref.section}`,
      is_danger_referral: true,
    });
  }

  if (next_visit_date) {
    followups_to_create.push({
      type: visit_type || 'Follow-up Visit',
      due_date: next_visit_date,
      guideline_ref: 'ASHA Home Visit Protocol',
    });
  }

  return {
    record: {
      beneficiary_name,
      beneficiary_code,
      village: currentRecord?.village || null,
      visit_type,
      beneficiary_type: effectiveBeneficiaryType,
      weight_kg,
      temperature_c,
      breaths_per_min,
      vaccinations_due,
      next_visit_date,
      symptoms_mentioned,
    },
    danger_flags: dangerEvaluation.matchedRules.map((r) => r.labels.en || r.id),
    danger_unknowns: dangerEvaluation.unknownMeasurements.map((u) => u.field),
    clarifying_questions: dangerEvaluation.unknownMeasurements.map((u) => u.clarifyingQuestion),
    followups_to_create,
    raw_entities: {
      weight_kg,
      temperature_c,
      breaths_per_min,
      next_visit_date,
    },
    is_correction: correction.isCorrection,
    is_offline_fallback: true,
  };
}

/**
 * Main extraction function called by the App.
 * Tries Relay POST /extract, falls back to client-side local extraction if unreachable or offline.
 */
export async function extractVisitData(params: ExtractVisitParams): Promise<ExtractedVisitData> {
  const relayBase = (import.meta.env.VITE_RELAY_URL || 'http://localhost:8080').replace(/\/$/, '');
  const token = params.authToken || 'mock-dev-token';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout for rapid fallback

    const response = await fetch(`${relayBase}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        transcript: params.transcript,
        beneficiaryType: params.beneficiaryType,
        currentRecord: params.currentRecord,
        language: params.language,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        ...data,
        is_offline_fallback: false,
      };
    }
  } catch (err) {
    console.warn('Relay extraction unavailable, falling back to in-memory local extraction:', err);
  }

  return extractLocalFallback(params.transcript, params.beneficiaryType, params.currentRecord);
}
