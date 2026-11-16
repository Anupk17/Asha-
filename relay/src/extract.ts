import { config } from './config.js';
import {
  evaluateDangerSigns,
  parseSpokenNumber,
  parseRelativeDate,
  detectCorrection,
  isClinicallyValid,
  applyVocabularyPostCorrection,
  BeneficiaryType,
} from '@asha/shared';

export interface ExtractRequest {
  transcript: string;
  beneficiaryType?: BeneficiaryType;
  currentRecord?: Record<string, any>;
  language?: string;
}

export interface ExtractResponse {
  record: {
    beneficiary_name?: string | null;
    beneficiary_code?: string | null;
    visit_type?: string | null;
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
}

const SYSTEM_PROMPT = `You are a clinical data extraction assistant for an Indian ASHA (Accredited Social Health Activist) community health register.
Extract structured visit records from the spoken notes of the ASHA worker.

RULES:
1. ONLY extract explicitly spoken information. Never guess or hallucinate.
2. Return null for fields not mentioned.
3. Preserve names exactly as spoken or transcribed.
4. Convert spoken measurements into standard units: weight in kg, temperature in Celsius, breaths in breaths/min.
5. Identify symptoms mentioned. NEVER assess diagnosis or prescribe treatment.
6. The danger evaluation will be performed deterministically by a separate clinical rule engine; your ONLY job is field extraction.

Few-shot examples:
Input (Hinglish): "Meena Devi ka visit kiya SYN-0001, vajan 54 point 5 kilo, tapman 37.0 tha, TT booster bacha hai, next visit 2026-11-16 ko hogi"
Output: {
  "beneficiary_name": "Meena Devi",
  "beneficiary_code": "SYN-0001",
  "visit_type": "ANC",
  "beneficiary_type": "pregnant",
  "weight_kg": 54.5,
  "temperature_c": 37.0,
  "breaths_per_min": null,
  "vaccinations_due": ["TT booster"],
  "next_visit_date": "2026-11-16",
  "symptoms_mentioned": []
}

Input (Hindi): "बच्चे का गृह भेंट दिन 14 किया, सांस 64 प्रति मिनट थी, पसली भी चल रही है, दूध नहीं पी पा रहा"
Output: {
  "beneficiary_name": null,
  "beneficiary_code": null,
  "visit_type": "newborn",
  "beneficiary_type": "newborn",
  "weight_kg": null,
  "temperature_c": null,
  "breaths_per_min": 64,
  "vaccinations_due": [],
  "next_visit_date": null,
  "symptoms_mentioned": ["chest indrawing", "unable to feed"]
}`;

/**
 * Fallback regex/heuristic extractor when ANTHROPIC_API_KEY is not configured or in offline dev mode.
 */
function extractWithHeuristics(transcript: string, beneficiaryType?: BeneficiaryType): any {
  const clean = transcript.toLowerCase();

  let visit_type = null;
  if (clean.includes('anc') || clean.includes('garbh') || clean.includes('pregnant')) {
    visit_type = 'ANC';
  } else if (clean.includes('pnc') || clean.includes('prasav')) {
    visit_type = 'PNC';
  } else if (clean.includes('hbnc') || clean.includes('shishu') || clean.includes('baby') || clean.includes('newborn')) {
    visit_type = 'newborn';
  } else if (clean.includes('teeka') || clean.includes('vaccin') || clean.includes('tika')) {
    visit_type = 'immunisation';
  }

  // Weight: extract number near weight/vajan/kilo
  let weight_kg: number | null = null;
  const weightMatch = clean.match(/(?:weight|vajan|wazan)\s*(?:is|tha|hai|hoga)?\s*(\d+(?:\s*(?:point|\.)\s*\d+)?)/);
  if (weightMatch) {
    weight_kg = parseSpokenNumber(weightMatch[1]);
  } else if (clean.includes('weight') || clean.includes('vajan') || clean.includes('kilo')) {
    weight_kg = parseSpokenNumber(clean);
  }

  // Temperature: extract number near temp/tapman/bukhar
  let temperature_c: number | null = null;
  const tempMatch = clean.match(/(?:temp|temperature|tapman|bukhar)\s*(?:is|tha|hai|hoga)?\s*(\d+(?:\s*(?:point|\.)\s*\d+)?)/);
  if (tempMatch) {
    const rawTemp = parseSpokenNumber(tempMatch[1]);
    if (rawTemp) {
      temperature_c = rawTemp > 60 ? parseFloat(((rawTemp - 32) * (5 / 9)).toFixed(1)) : rawTemp;
    }
  }

  // Breaths: extract number near breath/saans
  let breaths_per_min: number | null = null;
  const breathsMatch = clean.match(/(?:breath|breaths|saans)\s*(?:is|tha|hai|hoga|per minute|prati minute)?\s*(\d+)/) ||
                       clean.match(/(\d+)\s*(?:breaths|saans)/);
  if (breathsMatch) {
    const rawBreaths = parseSpokenNumber(breathsMatch[1]);
    if (rawBreaths) breaths_per_min = Math.round(rawBreaths);
  }

  // Next visit date
  const next_visit_date = parseRelativeDate(clean);

  // Vaccinations
  const vaccinations_due: string[] = [];
  if (clean.includes('mr-1') || clean.includes('measles') || clean.includes('khasra')) {
    vaccinations_due.push('MR-1');
  }
  if (clean.includes('tt') || clean.includes('tetanus')) {
    vaccinations_due.push('TT Booster');
  }
  if (clean.includes('dpt')) {
    vaccinations_due.push('DPT Booster');
  }
  if (clean.includes('opv') || clean.includes('polio')) {
    vaccinations_due.push('OPV');
  }

  // Symptoms
  const symptoms_mentioned: string[] = [];
  if (clean.includes('bleed') || clean.includes('khoon')) symptoms_mentioned.push('heavy bleeding');
  if (clean.includes('headache') || clean.includes('sirdard')) symptoms_mentioned.push('severe headache');
  if (clean.includes('dhundhla') || clean.includes('vision') || clean.includes('blurry')) symptoms_mentioned.push('blurred vision');
  if (clean.includes('fit') || clean.includes('daura') || clean.includes('jhatke')) symptoms_mentioned.push('convulsions');
  if (clean.includes('breathless') || clean.includes('saans phool') || clean.includes('saans lene me')) symptoms_mentioned.push('severe breathlessness');
  if (clean.includes('chest') || clean.includes('pasli') || clean.includes('dhans')) symptoms_mentioned.push('chest indrawing');
  if (clean.includes('feed') || clean.includes('doodh nahi') || clean.includes('suck')) symptoms_mentioned.push('unable to feed');

  // Beneficiary Name
  let beneficiary_name: string | null = null;
  const nameMatch = transcript.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
  if (nameMatch) {
    beneficiary_name = nameMatch[1];
  }

  // Code
  const codeMatch = transcript.match(/\b(SYN-\d{4})\b/i);
  const beneficiary_code = codeMatch ? codeMatch[1].toUpperCase() : null;

  return {
    beneficiary_name,
    beneficiary_code,
    visit_type,
    beneficiary_type: beneficiaryType || (visit_type === 'newborn' ? 'newborn' : 'pregnant'),
    weight_kg,
    temperature_c,
    breaths_per_min,
    vaccinations_due,
    next_visit_date,
    symptoms_mentioned,
  };
}

/**
 * Main extraction handler calling Anthropic Claude Haiku (or heuristic fallback)
 * and feeding extracted records into normalisers and the deterministic danger-sign engine.
 */
export async function extractRecord(req: ExtractRequest): Promise<ExtractResponse> {
  const correctedTranscript = applyVocabularyPostCorrection(req.transcript);

  // Check if utterance is a field correction ("no, weight is 2.8 kilo")
  const correction = detectCorrection(correctedTranscript);

  let rawExtracted: any = null;

  const apiKey = config.ANTHROPIC_API_KEY;
  const isLiveKey = apiKey && apiKey.length > 20 && !apiKey.startsWith('mock_') && !apiKey.startsWith('dev_');

  if (isLiveKey) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1024,
          temperature: 0.1,
          system: SYSTEM_PROMPT,
          tools: [
            {
              name: 'extract_visit_record',
              description: 'Extract structured health record from ASHA visit notes',
              input_schema: {
                type: 'object',
                properties: {
                  beneficiary_name: { type: ['string', 'null'] },
                  beneficiary_code: { type: ['string', 'null'] },
                  visit_type: { type: ['string', 'null'], enum: ['ANC', 'PNC', 'newborn', 'immunisation', null] },
                  beneficiary_type: { type: ['string', 'null'], enum: ['pregnant', 'newborn', 'child', null] },
                  weight_kg: { type: ['number', 'null'] },
                  temperature_c: { type: ['number', 'null'] },
                  breaths_per_min: { type: ['number', 'null'] },
                  vaccinations_due: { type: 'array', items: { type: 'string' } },
                  next_visit_date: { type: ['string', 'null'] },
                  symptoms_mentioned: { type: 'array', items: { type: 'string' } },
                },
                required: ['vaccinations_due', 'symptoms_mentioned'],
              },
            },
          ],
          tool_choice: { type: 'tool', name: 'extract_visit_record' },
          messages: [{ role: 'user', content: correctedTranscript }],
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        const toolUse = data.content?.find((c: any) => c.type === 'tool_use');
        if (toolUse && toolUse.input) {
          rawExtracted = toolUse.input;
        }
      } else {
        console.warn('Anthropic API returned error, falling back to heuristics:', response.status);
      }
    } catch (err) {
      console.warn('Failed to call Anthropic API, falling back to heuristics:', err);
    }
  }

  if (!rawExtracted) {
    rawExtracted = extractWithHeuristics(correctedTranscript, req.beneficiaryType);
  }

  // Apply in-turn correction if detected
  const current = req.currentRecord || {};
  let finalRecord: Record<string, any>;

  if (correction.isCorrection) {
    finalRecord = { ...current };
    if (correction.field) {
      finalRecord[correction.field] = correction.parsedValue;
    }
  } else {
    finalRecord = { ...current, ...rawExtracted };
  }

  // Validate measurements against physiological sanity bounds
  if (finalRecord.weight_kg && !isClinicallyValid('weight_kg', finalRecord.weight_kg)) {
    finalRecord.weight_kg = null;
  }
  if (finalRecord.temperature_c && !isClinicallyValid('temperature_c', finalRecord.temperature_c)) {
    finalRecord.temperature_c = null;
  }
  if (finalRecord.breaths_per_min && !isClinicallyValid('breaths_per_min', finalRecord.breaths_per_min)) {
    finalRecord.breaths_per_min = null;
  }

  // Deterministically evaluate danger signs (LLM NEVER softens or alters this)
  const dangerAssessment = evaluateDangerSigns({
    beneficiaryType: finalRecord.beneficiary_type || req.beneficiaryType || 'pregnant',
    transcriptText: correctedTranscript,
    weight_kg: finalRecord.weight_kg,
    temperature_c: finalRecord.temperature_c,
    breaths_per_min: finalRecord.breaths_per_min,
    symptoms_mentioned: finalRecord.symptoms_mentioned,
  });

  // Generate follow-ups
  const followups_to_create: ExtractResponse['followups_to_create'] = [];

  // 1. Danger referral follow-up
  if (dangerAssessment.matchedRules.length > 0) {
    const primaryRule = dangerAssessment.matchedRules[0];
    followups_to_create.push({
      type: `Urgent Facility Referral (${primaryRule.labels.en})`,
      due_date: new Date().toISOString().split('T')[0],
      guideline_ref: `${primaryRule.guideline_ref.guideline_id.toUpperCase()}, Sec ${primaryRule.guideline_ref.section}`,
      is_danger_referral: true,
    });
  }

  // 2. Next scheduled visit follow-up
  if (finalRecord.next_visit_date) {
    followups_to_create.push({
      type: `${finalRecord.visit_type || 'Follow-up'} Checkup`,
      due_date: finalRecord.next_visit_date,
      guideline_ref: 'MoHFW Standard Care Schedule',
      is_danger_referral: false,
    });
  }

  return {
    record: {
      beneficiary_name: finalRecord.beneficiary_name || null,
      beneficiary_code: finalRecord.beneficiary_code || null,
      visit_type: finalRecord.visit_type || null,
      weight_kg: finalRecord.weight_kg || null,
      temperature_c: finalRecord.temperature_c || null,
      breaths_per_min: finalRecord.breaths_per_min || null,
      vaccinations_due: finalRecord.vaccinations_due || [],
      next_visit_date: finalRecord.next_visit_date || null,
      symptoms_mentioned: finalRecord.symptoms_mentioned || [],
    },
    danger_flags: dangerAssessment.matchedRuleIds,
    danger_unknowns: dangerAssessment.unknownMeasurements.map((u) => u.field),
    clarifying_questions: dangerAssessment.unknownMeasurements.map((u) => u.clarifyingQuestion),
    followups_to_create,
    raw_entities: rawExtracted,
    is_correction: correction.isCorrection,
  };
}
