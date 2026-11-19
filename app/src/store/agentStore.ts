import { create } from 'zustand';
import {
  evaluateDangerSigns,
  parseSpokenNumber,
  parseRelativeDate,
  detectCorrection,
  applyVocabularyPostCorrection,
  generateFollowUpsForVisit,
  autoMarkFollowUpsDoneOnVisit,
  matchIncentiveActivity,
  checkMissingRequiredFields,
  type BeneficiaryType,
  type Visit,
} from '@asha/shared';
import { getT, type SupportedLanguage } from '../i18n/index.ts';
import { extractVisitData, ExtractedVisitData } from '../utils/extractionClient';
import { saveVisit, saveFollowUp, getFollowUps, getBeneficiaries, saveBeneficiary } from '../data/repository';
import { ReminderService } from '../utils/reminderService';
import { getCurrentLocation } from '../utils/locationService';
import { useAppStore } from './appStore';

export type AgentStep =
  | 'IDLE'
  | 'GREETING'
  | 'CAPTURE'
  | 'ASK_MISSING'
  | 'CONFIRM_READBACK'
  | 'CORRECT'
  | 'SAVING'
  | 'SAVED'
  | 'CANCELLED';

export interface DraftVisitRecord {
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
  danger_flags: string[];
  danger_unknowns: string[];
}

export interface AgentStoreState {
  // State machine
  step: AgentStep;
  language: SupportedLanguage;
  agentSpokenText: string;
  transcript: string;
  isListening: boolean;
  isAgentSpeaking: boolean;
  latencyMs: number | null;
  missingField: 'weight' | 'temperature' | 'breaths' | 'beneficiary' | 'nextVisitDate' | null;
  retryCount: number;
  showTapFallbackNotice: boolean;
  isOffline: boolean;
  recentlyEditedField: string | null;

  // Active Draft
  draftRecord: DraftVisitRecord;

  // Actions
  initSession: (lang: SupportedLanguage, offline?: boolean) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setListening: (listening: boolean) => void;
  setAgentSpeaking: (speaking: boolean) => void;
  setLatencyMs: (ms: number | null) => void;
  setPartialTranscript: (text: string) => void;
  onFinalTranscript: (text: string, speakTts?: (msg: string) => void) => Promise<void>;
  updateDraftField: (field: keyof DraftVisitRecord, value: any, speakTts?: (msg: string) => void) => void;
  confirmAndSave: (userId?: string, speakTts?: (msg: string) => void) => Promise<boolean>;
  reRecord: (speakTts?: (msg: string) => void) => void;
  cancelSession: (speakTts?: (msg: string) => void) => void;
  repeatLastPrompt: (speakTts?: (msg: string) => void) => void;
  triggerBargeIn: () => void;
}

const initialDraft: DraftVisitRecord = {
  beneficiary_name: null,
  beneficiary_code: null,
  village: null,
  visit_type: 'ANC',
  beneficiary_type: 'pregnant',
  weight_kg: null,
  temperature_c: null,
  breaths_per_min: null,
  vaccinations_due: [],
  next_visit_date: null,
  symptoms_mentioned: [],
  danger_flags: [],
  danger_unknowns: [],
};

export const useAgentStore = create<AgentStoreState>((set, get) => ({
  step: 'IDLE',
  language: 'en',
  agentSpokenText: '',
  transcript: '',
  isListening: false,
  isAgentSpeaking: false,
  latencyMs: null,
  missingField: null,
  retryCount: 0,
  showTapFallbackNotice: false,
  isOffline: false,
  recentlyEditedField: null,
  draftRecord: { ...initialDraft },

  initSession: (lang: SupportedLanguage, offline = false) => {
    const t = getT(lang);
    const greeting = t.agentDialogue.greeting;

    set({
      step: 'GREETING',
      language: lang,
      agentSpokenText: greeting,
      transcript: '',
      isListening: false,
      isAgentSpeaking: true,
      missingField: null,
      retryCount: 0,
      showTapFallbackNotice: false,
      isOffline: offline,
      recentlyEditedField: null,
      draftRecord: { ...initialDraft },
    });
  },

  setLanguage: (lang: SupportedLanguage) => set({ language: lang }),
  setListening: (isListening: boolean) => set({ isListening }),
  setAgentSpeaking: (isAgentSpeaking: boolean) => set({ isAgentSpeaking }),
  setLatencyMs: (latencyMs: number | null) => set({ latencyMs }),

  setPartialTranscript: (text: string) => {
    set({ transcript: text });
  },

  triggerBargeIn: () => {
    set({ isAgentSpeaking: false });
  },

  repeatLastPrompt: (speakTts) => {
    const { agentSpokenText } = get();
    if (agentSpokenText && speakTts) {
      set({ isAgentSpeaking: true });
      speakTts(agentSpokenText);
    }
  },

  cancelSession: (speakTts) => {
    const { language } = get();
    const t = getT(language);
    const cancelMsg = t.agentDialogue.cancelled;
    set({
      step: 'CANCELLED',
      agentSpokenText: cancelMsg,
      isListening: false,
      isAgentSpeaking: true,
    });
    if (speakTts) speakTts(cancelMsg);
  },

  reRecord: (speakTts) => {
    const { language } = get();
    const t = getT(language);
    const msg = t.recording.tapToSpeak;
    set({
      step: 'CAPTURE',
      agentSpokenText: msg,
      transcript: '',
      draftRecord: { ...initialDraft },
      missingField: null,
      retryCount: 0,
      isListening: true,
    });
    if (speakTts) speakTts(msg);
  },

  updateDraftField: (field, value, speakTts) => {
    const { draftRecord, language } = get();
    const t = getT(language);
    const updated = { ...draftRecord, [field]: value };

    // Re-run danger engine
    const dangerEval = evaluateDangerSigns({
      beneficiaryType: updated.beneficiary_type || 'pregnant',
      symptoms_mentioned: updated.symptoms_mentioned,
      weight_kg: updated.weight_kg ?? undefined,
      temperature_c: updated.temperature_c ?? undefined,
      breaths_per_min: updated.breaths_per_min ?? undefined,
    });

    updated.danger_flags = dangerEval.matchedRules.map((r) => r.labels.en || r.id);
    updated.danger_unknowns = dangerEval.unknownMeasurements.map((u) => u.field);

    set({
      draftRecord: updated,
      recentlyEditedField: String(field),
    });

    setTimeout(() => {
      if (get().recentlyEditedField === String(field)) {
        set({ recentlyEditedField: null });
      }
    }, 2000);

    if (speakTts) {
      const fieldName = String(field).replace(/_/g, ' ');
      const msg = t.agentDialogue.correctionUpdated(fieldName, String(value));
      set({ agentSpokenText: msg, isAgentSpeaking: true });
      speakTts(msg);
    }
  },

  onFinalTranscript: async (text: string, speakTts) => {
    const { step, language, draftRecord, missingField, retryCount } = get();
    const t = getT(language);
    const clean = text.trim().toLowerCase();

    set({ transcript: text, isListening: false });

    // 1. Check Global Speech Commands
    if (/^(cancel|radd|band karo|exit|radd karo)/i.test(clean)) {
      get().cancelSession(speakTts);
      return;
    }
    if (/^(repeat|dobara|phir se bolo|repeat karo)/i.test(clean)) {
      get().repeatLastPrompt(speakTts);
      return;
    }
    if (/^(stop|ruko|ruk ja)/i.test(clean)) {
      set({ isListening: false });
      return;
    }

    // 2. Handle state: CAPTURE
    if (step === 'CAPTURE' || step === 'GREETING') {
      const extracted: ExtractedVisitData = await extractVisitData({
        transcript: text,
        beneficiaryType: draftRecord.beneficiary_type,
        currentRecord: draftRecord,
        language,
      });

      const updatedRecord: DraftVisitRecord = {
        ...draftRecord,
        ...extracted.record,
        danger_flags: extracted.danger_flags,
        danger_unknowns: extracted.danger_unknowns,
      };

      // Vibrate on danger sign
      if (extracted.danger_flags.length > 0 && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 200]);
      }

      // Check required fields & missing measurements:
      // Priority 1: Unknown measurement mentioned without value (e.g. fever mentioned without temp)
      if (extracted.danger_unknowns && extracted.danger_unknowns.length > 0) {
        const question = t.agentDialogue.askMissing.temperature;
        set({
          step: 'ASK_MISSING',
          missingField: 'temperature',
          draftRecord: updatedRecord,
          agentSpokenText: question,
          isAgentSpeaking: true,
          retryCount: 0,
        });
        if (speakTts) speakTts(question);
        return;
      }

      // Priority 2: Missing weight for newborn or ANC
      if (!updatedRecord.weight_kg && (updatedRecord.visit_type === 'newborn' || updatedRecord.visit_type === 'ANC')) {
        const question = t.agentDialogue.askMissing.weight;
        set({
          step: 'ASK_MISSING',
          missingField: 'weight',
          draftRecord: updatedRecord,
          agentSpokenText: question,
          isAgentSpeaking: true,
          retryCount: 0,
        });
        if (speakTts) speakTts(question);
        return;
      }

      // Priority 3: Missing beneficiary
      if (!updatedRecord.beneficiary_name && !updatedRecord.beneficiary_code) {
        const question = t.agentDialogue.askMissing.beneficiary;
        set({
          step: 'ASK_MISSING',
          missingField: 'beneficiary',
          draftRecord: updatedRecord,
          agentSpokenText: question,
          isAgentSpeaking: true,
          retryCount: 0,
        });
        if (speakTts) speakTts(question);
        return;
      }

      // Priority 4: Activity-specific required fields from NHM Incentive guidelines
      const activity = matchIncentiveActivity(updatedRecord as any);
      if (activity) {
        const missingFields = checkMissingRequiredFields(updatedRecord as any, activity);
        if (missingFields.includes('breaths_per_min')) {
          const question = t.agentDialogue.askMissing.breaths;
          set({
            step: 'ASK_MISSING',
            missingField: 'breaths',
            draftRecord: updatedRecord,
            agentSpokenText: question,
            isAgentSpeaking: true,
            retryCount: 0,
          });
          if (speakTts) speakTts(question);
          return;
        }
        if (missingFields.includes('next_visit_date')) {
          const question = t.agentDialogue.askMissing.nextVisitDate;
          set({
            step: 'ASK_MISSING',
            missingField: 'nextVisitDate',
            draftRecord: updatedRecord,
            agentSpokenText: question,
            isAgentSpeaking: true,
            retryCount: 0,
          });
          if (speakTts) speakTts(question);
          return;
        }
      }

      // All essential items present -> proceed to CONFIRM_READBACK
      set({ draftRecord: updatedRecord });
      buildAndSpeakReadback(updatedRecord, language, set, speakTts);
      return;
    }

    // 3. Handle state: ASK_MISSING
    if (step === 'ASK_MISSING') {
      const updated = { ...draftRecord };

      if (missingField === 'temperature') {
        const parsed = parseSpokenNumber(text);
        if (parsed !== null) {
          const tempC = parsed > 60 ? parseFloat(((parsed - 32) * (5 / 9)).toFixed(1)) : parsed;
          updated.temperature_c = tempC;
        }
      } else if (missingField === 'weight') {
        const parsed = parseSpokenNumber(text);
        if (parsed !== null) updated.weight_kg = parsed;
      } else if (missingField === 'breaths') {
        const parsed = parseSpokenNumber(text);
        if (parsed !== null) updated.breaths_per_min = Math.round(parsed);
      } else if (missingField === 'beneficiary') {
        updated.beneficiary_name = text.trim();
      } else if (missingField === 'nextVisitDate') {
        const parsedDate = parseRelativeDate(text);
        if (parsedDate) updated.next_visit_date = parsedDate;
      }

      // Re-run danger engine with the newly provided measurement
      const dangerEval = evaluateDangerSigns({
        beneficiaryType: updated.beneficiary_type || 'pregnant',
        symptoms_mentioned: updated.symptoms_mentioned,
        weight_kg: updated.weight_kg ?? undefined,
        temperature_c: updated.temperature_c ?? undefined,
        breaths_per_min: updated.breaths_per_min ?? undefined,
      });

      updated.danger_flags = dangerEval.matchedRules.map((r) => r.labels.en || r.id);
      updated.danger_unknowns = dangerEval.unknownMeasurements.map((u) => u.field);

      if (updated.danger_flags.length > 0 && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 200]);
      }

      set({ draftRecord: updated, missingField: null });
      buildAndSpeakReadback(updated, language, set, speakTts);
      return;
    }

    // 4. Handle state: CONFIRM_READBACK or CORRECT
    if (step === 'CONFIRM_READBACK' || step === 'CORRECT') {
      // Check for positive confirmation: "yes", "haan", "save", "confirm", "sahi hai", "theek hai"
      const isPositiveConfirm =
        /^(yes|haan|ha|save|confirm|sahi|theek|ha save kar do|haan save|done|ok|okay)/i.test(clean) ||
        clean.includes('save') ||
        clean.includes('sahi hai') ||
        clean.includes('theek hai');

      if (isPositiveConfirm) {
        await get().confirmAndSave(undefined, speakTts);
        return;
      }

      // Check for spoken correction ("no, weight is 2.8 kilo" / "nahi, vajan 2.8 kilo hai")
      const correction = detectCorrection(applyVocabularyPostCorrection(text));
      if (correction.isCorrection) {
        const updated = { ...draftRecord };
        let changedLabel = 'field';
        let changedVal = '';

        if (correction.field === 'weight_kg' && correction.parsedValue !== null) {
          updated.weight_kg = correction.parsedValue;
          changedLabel = t.agentDialogue.readback.weight;
          changedVal = `${correction.parsedValue} kg`;
        } else if (correction.field === 'temperature_c' && correction.parsedValue !== null) {
          updated.temperature_c = correction.parsedValue;
          changedLabel = 'Temperature';
          changedVal = `${correction.parsedValue}°C`;
        } else if (correction.field === 'breaths_per_min' && correction.parsedValue !== null) {
          updated.breaths_per_min = correction.parsedValue;
          changedLabel = 'Breaths';
          changedVal = `${correction.parsedValue}/min`;
        } else if (correction.field === 'next_visit_date' && correction.parsedValue !== null) {
          updated.next_visit_date = String(correction.parsedValue);
          changedLabel = t.agentDialogue.readback.nextVisitDate;
          changedVal = String(correction.parsedValue);
        }

        // Re-run danger engine
        const dangerEval = evaluateDangerSigns({
          beneficiaryType: updated.beneficiary_type || 'pregnant',
          symptoms_mentioned: updated.symptoms_mentioned,
          weight_kg: updated.weight_kg ?? undefined,
          temperature_c: updated.temperature_c ?? undefined,
          breaths_per_min: updated.breaths_per_min ?? undefined,
        });
        updated.danger_flags = dangerEval.matchedRules.map((r) => r.labels.en || r.id);
        updated.danger_unknowns = dangerEval.unknownMeasurements.map((u) => u.field);

        const updateMsg = t.agentDialogue.correctionUpdated(changedLabel, changedVal);

        set({
          step: 'CONFIRM_READBACK',
          draftRecord: updated,
          recentlyEditedField: correction.field,
          agentSpokenText: updateMsg,
          isAgentSpeaking: true,
          retryCount: 0,
        });

        setTimeout(() => {
          if (get().recentlyEditedField === correction.field) {
            set({ recentlyEditedField: null });
          }
        }, 2000);

        if (speakTts) speakTts(updateMsg);
        return;
      }

      // Unrecognized input -> ask once, then offer tap fallback
      if (retryCount === 0) {
        const retryMsg = t.agentDialogue.unknownRetry;
        set({
          agentSpokenText: retryMsg,
          retryCount: 1,
          isAgentSpeaking: true,
        });
        if (speakTts) speakTts(retryMsg);
      } else {
        set({
          showTapFallbackNotice: true,
          isListening: false,
        });
      }
    }
  },

  confirmAndSave: async (userId = 'demo-asha-worker-01', speakTts) => {
    const { draftRecord, language } = get();
    const t = getT(language);

    set({ step: 'SAVING' });

    try {
      const visitId = `visit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      // Capture GPS location if location sharing is consented
      const { locationSharing, locationPrecision } = useAppStore.getState();
      let capturedGeo: { lat: number; lng: number; accuracy?: number } | undefined = undefined;
      if (locationSharing) {
        const geoPoint = await getCurrentLocation(locationPrecision);
        if (geoPoint) {
          capturedGeo = geoPoint;
        }
      }

      const visitData: Visit = {
        id: visitId,
        beneficiary_id: draftRecord.beneficiary_code || 'SYN-0001',
        beneficiary_name: draftRecord.beneficiary_name || 'Beneficiary',
        beneficiary_code: draftRecord.beneficiary_code || 'SYN-0001',
        village: draftRecord.village || 'Rampur',
        visit_type: (draftRecord.visit_type as any) || 'ANC',
        weight_kg: draftRecord.weight_kg ?? undefined,
        temperature_c: draftRecord.temperature_c ?? undefined,
        breaths_per_min: draftRecord.breaths_per_min ?? undefined,
        vaccinations_due: draftRecord.vaccinations_due || [],
        next_visit_date: draftRecord.next_visit_date || undefined,
        danger_flags: draftRecord.danger_flags || [],
        danger_unknowns: draftRecord.danger_unknowns || [],
        rules_version: '2026.11-mohfw',
        geo: capturedGeo,
        status: 'confirmed',
        created_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
      };

      // Save visit to Firestore / local cache
      await saveVisit(userId, visitData);

      // Load existing follow-ups & beneficiaries to calculate guideline schedules
      const existingFollowups = await getFollowUps(userId);
      const allBeneficiaries = await getBeneficiaries(userId);
      const matchedBeneficiary = allBeneficiaries.find(
        (b) => b.code === visitData.beneficiary_code || b.id === visitData.beneficiary_id
      );

      // If beneficiary doesn't have home_geo and we captured geo, set home_geo
      if (matchedBeneficiary && !matchedBeneficiary.home_geo && capturedGeo) {
        matchedBeneficiary.home_geo = capturedGeo;
        await saveBeneficiary(userId, matchedBeneficiary);
      }

      // 1. Auto-mark existing pending follow-ups for this beneficiary as done
      const markedList = autoMarkFollowUpsDoneOnVisit(existingFollowups, visitData);
      for (const item of markedList) {
        if (item.status === 'done' && existingFollowups.find((f) => f.id === item.id)?.status !== 'done') {
          await saveFollowUp(userId, item);
        }
      }

      // 2. Generate new follow-up tasks from guidelines, vaccinations, next visit date, & danger check
      const generatedTasks = generateFollowUpsForVisit({
        visit: visitData,
        beneficiary: matchedBeneficiary,
        existingFollowUps: markedList,
      });

      for (const task of generatedTasks) {
        await saveFollowUp(userId, task);
      }

      // 3. Reschedule offline reminders
      ReminderService.rescheduleAll([...markedList, ...generatedTasks]);

      const nextDateStr = draftRecord.next_visit_date || 'next week';
      const savedMsg = t.agentDialogue.saved(nextDateStr);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100]);
      }

      set({
        step: 'SAVED',
        agentSpokenText: savedMsg,
        isAgentSpeaking: true,
      });

      if (speakTts) speakTts(savedMsg);
      return true;
    } catch (err) {
      console.error('Save visit failed:', err);
      return false;
    }
  },
}));

/**
 * Helper to construct readback in fixed order:
 * (1) If danger flagged: speaks fixed referral line FIRST.
 * (2) Beneficiary, visit type, weight, vaccinations, next visit date, reported danger signs.
 * (3) Ends with confirmQuestion ("Sab sahi hai?").
 */
function buildAndSpeakReadback(
  record: DraftVisitRecord,
  lang: SupportedLanguage,
  set: (state: Partial<AgentStoreState>) => void,
  speakTts?: (msg: string) => void
) {
  const t = getT(lang);
  const parts: string[] = [];

  // 1. Danger referral line FIRST if flagged
  if (record.danger_flags.length > 0) {
    parts.push(t.agentDialogue.dangerAlert);
  }

  // 2. Fixed order readback
  parts.push(t.agentDialogue.readback.prefix);

  if (record.beneficiary_name) {
    parts.push(`${t.agentDialogue.readback.beneficiary}: ${record.beneficiary_name}`);
  }
  if (record.visit_type) {
    parts.push(`${t.agentDialogue.readback.visitType}: ${record.visit_type}`);
  }
  if (record.weight_kg) {
    parts.push(`${t.agentDialogue.readback.weight}: ${record.weight_kg} kg`);
  }
  if (record.vaccinations_due && record.vaccinations_due.length > 0) {
    parts.push(`${t.agentDialogue.readback.vaccinations}: ${record.vaccinations_due.join(', ')}`);
  }
  if (record.next_visit_date) {
    parts.push(`${t.agentDialogue.readback.nextVisitDate}: ${record.next_visit_date}`);
  }
  if (record.danger_flags && record.danger_flags.length > 0) {
    parts.push(`${t.agentDialogue.readback.dangerSigns}: ${record.danger_flags.join(', ')}`);
  }

  // 3. Confirm question
  parts.push(t.agentDialogue.readback.confirmQuestion);

  const fullReadbackText = parts.join('. ');

  set({
    step: 'CONFIRM_READBACK',
    agentSpokenText: fullReadbackText,
    isAgentSpeaking: true,
    retryCount: 0,
  });

  if (speakTts) {
    speakTts(fullReadbackText);
  }
}
