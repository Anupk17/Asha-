import { z } from 'zod';
import dangerSignsData from './danger_signs.json';
import guidelinesData from './guidelines.json';
import { BeneficiaryType } from '../index.js';

export const GuidelineRefSchema = z.object({
  guideline_id: z.string().min(1),
  section: z.string().min(1),
  page: z.string().min(1),
  version: z.string().min(1),
});

export const TriggerSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('symptom'),
    aliases: z.object({
      en: z.array(z.string()),
      hi: z.array(z.string()),
      hinglish: z.array(z.string()),
    }),
  }),
  z.object({
    type: z.literal('measurement'),
    field: z.enum(['temperature_c', 'breaths_per_min', 'weight_kg']),
    operator: z.enum(['>=', '<=', '>', '<', '==']),
    value: z.number(),
    unit: z.string(),
  }),
]);

export const DangerSignRuleSchema = z.object({
  id: z.string().min(1),
  applies_to: z.array(z.enum(['pregnant', 'newborn', 'child'])),
  category: z.string().min(1),
  labels: z.record(z.string()),
  trigger: TriggerSchema,
  required_to_evaluate: z.array(z.string()),
  severity: z.literal('refer_now'),
  action: z.literal('refer_now'),
  guideline_ref: GuidelineRefSchema,
  reviewed: z.boolean(),
  last_updated: z.string(),
});

export type DangerSignRule = z.infer<typeof DangerSignRuleSchema>;

// Validate rules at module load
const parsedRules = z.array(DangerSignRuleSchema).safeParse(dangerSignsData);
if (!parsedRules.success) {
  console.error('CRITICAL: Danger signs rules schema validation failed!');
  console.error(JSON.stringify(parsedRules.error.format(), null, 2));
  throw new Error('Invalid danger_signs.json file');
}

export const DANGER_RULES: DangerSignRule[] = parsedRules.data;

export interface ExtractedVisitInput {
  beneficiaryType?: BeneficiaryType;
  transcriptText?: string;
  weight_kg?: number | null;
  temperature_c?: number | null;
  breaths_per_min?: number | null;
  symptoms_mentioned?: string[];
}

export interface DangerMatchResult {
  matchedRuleIds: string[];
  matchedRules: DangerSignRule[];
  evidence: Array<{ ruleId: string; reason: string; guidelineCitation: string }>;
  unknownMeasurements: Array<{ field: string; clarifyingQuestion: string; ruleId: string }>;
  isReferralRequired: boolean;
}

/**
 * Normalises text for high-recall danger alias substring matching
 */
export function normaliseForMatching(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministically assesses an extracted visit input against MoHFW/NHM clinical rules.
 * Never removes or softens a flag. Guaranteed 100% reproducible.
 */
export function evaluateDangerSigns(input: ExtractedVisitInput): DangerMatchResult {
  const normText = normaliseForMatching(input.transcriptText || '');
  const beneficiaryType = input.beneficiaryType || 'pregnant';

  const matchedRules: DangerSignRule[] = [];
  const evidence: Array<{ ruleId: string; reason: string; guidelineCitation: string }> = [];
  const unknownMeasurements: Array<{ field: string; clarifyingQuestion: string; ruleId: string }> = [];

  for (const rule of DANGER_RULES) {
    // 1. Check beneficiary category applicability
    if (!rule.applies_to.includes(beneficiaryType)) {
      continue;
    }

    const citation = `${rule.guideline_ref.guideline_id.toUpperCase()} (${rule.guideline_ref.section}, Page ${rule.guideline_ref.page})`;

    // 2. Evaluate Measurement Rules
    if (rule.trigger.type === 'measurement') {
      const field = rule.trigger.field;
      const val = input[field];

      if (val !== undefined && val !== null && !isNaN(val)) {
        let isTriggered = false;
        switch (rule.trigger.operator) {
          case '>=':
            isTriggered = val >= rule.trigger.value;
            break;
          case '<=':
            isTriggered = val <= rule.trigger.value;
            break;
          case '>':
            isTriggered = val > rule.trigger.value;
            break;
          case '<':
            isTriggered = val < rule.trigger.value;
            break;
          case '==':
            isTriggered = val === rule.trigger.value;
            break;
        }

        if (isTriggered) {
          matchedRules.push(rule);
          evidence.push({
            ruleId: rule.id,
            reason: `${field} measured at ${val} ${rule.trigger.unit} (threshold: ${rule.trigger.operator} ${rule.trigger.value})`,
            guidelineCitation: citation,
          });
        }
      } else {
        // Check if symptoms mentioned fever or fast breathing without giving numeric values
        if (field === 'temperature_c' && (normText.includes('fever') || normText.includes('bukhar') || normText.includes('garam') || normText.includes('hot'))) {
          unknownMeasurements.push({
            field: 'temperature_c',
            clarifyingQuestion: beneficiaryType === 'newborn'
              ? 'What is the baby\'s temperature?'
              : 'What is the mother\'s temperature?',
            ruleId: rule.id,
          });
        }
        if (field === 'breaths_per_min' && (normText.includes('fast breath') || normText.includes('saans tez') || normText.includes('pasli') || normText.includes('haaf'))) {
          unknownMeasurements.push({
            field: 'breaths_per_min',
            clarifyingQuestion: 'How many breaths per minute were counted?',
            ruleId: rule.id,
          });
        }
      }
    }

    // 3. Evaluate Symptom Alias Rules
    if (rule.trigger.type === 'symptom') {
      const allAliases = [
        ...rule.trigger.aliases.en,
        ...rule.trigger.aliases.hi,
        ...rule.trigger.aliases.hinglish,
      ];

      for (const alias of allAliases) {
        const normAlias = normaliseForMatching(alias);
        if (normText.includes(normAlias)) {
          matchedRules.push(rule);
          evidence.push({
            ruleId: rule.id,
            reason: `Reported danger sign matching symptom alias: "${alias}"`,
            guidelineCitation: citation,
          });
          break; // Avoid duplicate matches for same rule
        }
      }
    }
  }

  // Deduplicate matched rules
  const uniqueMatchedRules = Array.from(new Set(matchedRules));

  return {
    matchedRuleIds: uniqueMatchedRules.map((r) => r.id),
    matchedRules: uniqueMatchedRules,
    evidence,
    unknownMeasurements,
    isReferralRequired: uniqueMatchedRules.length > 0,
  };
}

export function printClinicalRulesReviewTable(): string {
  const headers = ['Rule ID', 'Applies To', 'Sign / Threshold', 'Guideline Source', 'Section', 'Page'];
  const rows = DANGER_RULES.map((r) => {
    const threshold =
      r.trigger.type === 'measurement'
        ? `${r.trigger.field} ${r.trigger.operator} ${r.trigger.value} ${r.trigger.unit}`
        : r.labels.en;
    return `| ${r.id} | ${r.applies_to.join(',')} | ${threshold} | ${r.guideline_ref.guideline_id} | ${r.guideline_ref.section} | ${r.guideline_ref.page} |`;
  });

  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows,
  ].join('\n');
}
