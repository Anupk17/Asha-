import React, { useState, useRef, useEffect } from 'react';
import { Banner } from '../components/ui/Banner';
import { FieldRow } from '../components/ui/FieldRow';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Volume2, CheckCircle2, RotateCcw, AlertTriangle, User, Calendar, Scale, Syringe, Thermometer, Wind, Share2 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useAgentStore } from '../store/agentStore';
import { getT } from '../i18n';
import { getLocalizedBeneficiaryName, getLocalizedVillageName, getLocalizedTaskType } from '../i18n/localize';
import { VoicePipeline } from '../utils/audioPipeline';

export interface ConfirmScreenProps {
  onSave: (confirmedData: any) => void;
  onRetake: () => void;
}

export const ConfirmScreen: React.FC<ConfirmScreenProps> = ({
  onSave,
  onRetake,
}) => {
  const { language, showToast } = useAppStore();
  const t = getT(language);
  const {
    draftRecord,
    agentSpokenText,
    recentlyEditedField,
    updateDraftField,
    confirmAndSave,
    reRecord,
    repeatLastPrompt,
    isAgentSpeaking,
    setAgentSpeaking,
  } = useAgentStore();

  const [editingModalField, setEditingModalField] = useState<string | null>(null);
  const [modalInputValue, setModalInputValue] = useState<string>('');
  const pipelineRef = useRef<VoicePipeline | null>(null);

  useEffect(() => {
    const relayUrl = import.meta.env.VITE_RELAY_URL || 'http://localhost:8080';
    const pipeline = new VoicePipeline({
      onAgentAudioStart: () => setAgentSpeaking(true),
      onAgentAudioEnd: () => setAgentSpeaking(false),
    });
    pipeline.connect(relayUrl, 'mock-jwt-token-for-dev');
    pipelineRef.current = pipeline;

    return () => {
      pipeline.disconnect();
    };
  }, []);

  const handleReadAgain = () => {
    repeatLastPrompt((msg) => {
      if (pipelineRef.current) {
        pipelineRef.current.requestTts(msg, language);
      } else {
        showToast(msg, 'info');
      }
    });
  };

  const hasDanger = (draftRecord.danger_flags?.length || 0) > 0;
  const hasUnknowns = (draftRecord.danger_unknowns?.length || 0) > 0;

  const localizedName = getLocalizedBeneficiaryName(
    draftRecord.beneficiary_code || '',
    draftRecord.beneficiary_name || 'Beneficiary',
    language
  );
  const localizedVillage = getLocalizedVillageName(draftRecord.village || 'Rampur', language);
  const localizedVisitType = getLocalizedTaskType(draftRecord.visit_type || 'ANC', language);

  const handleOpenEdit = (field: string, currentVal: any) => {
    setEditingModalField(field);
    setModalInputValue(currentVal !== null && currentVal !== undefined ? String(currentVal) : '');
  };

  const handleSaveModal = () => {
    if (editingModalField) {
      let parsedVal: any = modalInputValue;
      if (['weight_kg', 'temperature_c', 'breaths_per_min'].includes(editingModalField)) {
        parsedVal = parseFloat(modalInputValue) || null;
      }
      updateDraftField(editingModalField as any, parsedVal);
      setEditingModalField(null);
    }
  };

  const handleConfirmSave = async () => {
    const success = await confirmAndSave();
    if (success) {
      onSave(draftRecord);
    }
  };

  const handleReRecord = () => {
    reRecord();
    onRetake();
  };

  const handleShareFamilyReminder = async () => {
    if (!draftRecord.next_visit_date) {
      showToast('No next visit date scheduled', 'info');
      return;
    }

    const messages: Record<string, string> = {
      en: `Namaste! Next home visit for ${localizedName} by ASHA Didi: ${draftRecord.next_visit_date}. Thank you.`,
      hi: `नमस्ते! आशा दीदी द्वारा ${localizedName} की अगली गृह-भेंट तारीख: ${draftRecord.next_visit_date}। धन्यवाद।`,
      ta: `வணக்கம்! ஆஷா தீதி மூலமாக ${localizedName} அடுத்த இல்லப் பார்வை தேதி: ${draftRecord.next_visit_date}. நன்றி.`,
      te: `నమస్కారం! ఆశా దీదీ ద్వారా ${localizedName} తదుపరి గృహ సందర్శన తేదీ: ${draftRecord.next_visit_date}. ధన్యవాదాలు.`,
      kn: `ನಮಸ್ಕಾರ! ಆಶಾ ದೀದಿಯವರಿಂದ ${localizedName} ಮುಂದಿನ ಮನೆ ಭೇಟಿ ದಿನಾಂಕ: ${draftRecord.next_visit_date}. ಧನ್ಯವಾದಗಳು.`,
      ml: `നമസ്കാരം! ആശാ ദീദിയുടെ ${localizedName} അടുത്ത ഭവന സന്ദർശന തീയതി: ${draftRecord.next_visit_date}. നന്ദി.`,
      mr: `नमस्ते! आशा दीदींकडून ${localizedName} पुढील गृहभेट तारीख: ${draftRecord.next_visit_date}। धन्यवाद.`,
    };

    const text = messages[language] || messages.en;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'ASHA Home Visit Reminder',
          text,
        });
        showToast('Visit reminder shared', 'success');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          await navigator.clipboard.writeText(text);
          showToast('Reminder copied to clipboard', 'info');
        }
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      showToast('Reminder copied to clipboard', 'info');
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Danger Sign Banner at the top if flagged */}
      {hasDanger && (
        <Banner
          type="danger"
          title={t.confirm.dangerAlertTitle}
          message={`${t.confirm.dangerAlertMsg} (${draftRecord.danger_flags.join(', ')})`}
          guidelineSource="MoHFW Guidelines (Immediate Referral Required)"
        />
      )}

      {/* Spoken Agent Dialogue / Readback Notice */}
      <div className="flex items-start justify-between p-3 rounded-card bg-teal-100 text-teal-900 border border-teal-700/20 text-xs">
        <div className="flex items-start gap-2">
          <Volume2 size={18} className="text-teal-900 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Spoken Readback</span>
            <p className="line-clamp-2">{agentSpokenText || t.confirm.readbackNotice}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReadAgain}
          disabled={isAgentSpeaking}
          className="text-teal-900 font-bold underline ml-2 shrink-0 hover:opacity-80 disabled:opacity-50"
        >
          {isAgentSpeaking ? 'Playing...' : t.confirm.listenAgain}
        </button>
      </div>

      {/* Unknown / Not checked chips */}
      {hasUnknowns && (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-muted">{t.confirm.notCheckedTitle}</div>
          <div className="flex flex-wrap gap-1.5">
            {draftRecord.danger_unknowns.map((unk, idx) => (
              <Chip key={idx} variant="neutral" size="sm">
                ⚠️ {unk.replace(/_/g, ' ')} not checked
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Form Field Rows with Tap-to-Edit */}
      <div className="space-y-2">
        <FieldRow
          label={t.confirm.beneficiaryLabel}
          value={`${localizedName} (${draftRecord.beneficiary_code || 'SYN-0001'}) - ${localizedVillage}`}
          icon={<User size={18} />}
          onTap={() => handleOpenEdit('beneficiary_name', draftRecord.beneficiary_name)}
        />

        <FieldRow
          label={t.confirm.visitTypeLabel}
          value={localizedVisitType}
          icon={<Calendar size={18} />}
          onTap={() => handleOpenEdit('visit_type', draftRecord.visit_type)}
        />

        <FieldRow
          label={t.confirm.weightLabel}
          value={draftRecord.weight_kg ?? 'Not recorded'}
          unit={draftRecord.weight_kg ? 'kg' : undefined}
          isEdited={recentlyEditedField === 'weight_kg'}
          icon={<Scale size={18} />}
          onTap={() => handleOpenEdit('weight_kg', draftRecord.weight_kg)}
        />

        <FieldRow
          label={t.confirm.tempLabel}
          value={draftRecord.temperature_c ?? 'Not measured'}
          unit={draftRecord.temperature_c ? '°C' : undefined}
          isEdited={recentlyEditedField === 'temperature_c'}
          icon={<Thermometer size={18} />}
          onTap={() => handleOpenEdit('temperature_c', draftRecord.temperature_c)}
        />

        <FieldRow
          label="Breaths per Minute"
          value={draftRecord.breaths_per_min ?? 'Not counted'}
          unit={draftRecord.breaths_per_min ? '/min' : undefined}
          isEdited={recentlyEditedField === 'breaths_per_min'}
          icon={<Wind size={18} />}
          onTap={() => handleOpenEdit('breaths_per_min', draftRecord.breaths_per_min)}
        />

        <FieldRow
          label={t.confirm.vaccinationsLabel}
          value={
            draftRecord.vaccinations_due && draftRecord.vaccinations_due.length > 0
              ? draftRecord.vaccinations_due.join(', ')
              : 'None due'
          }
          icon={<Syringe size={18} />}
          onTap={() => handleOpenEdit('vaccinations_due', draftRecord.vaccinations_due.join(', '))}
        />

        <FieldRow
          label={t.confirm.nextVisitDateLabel}
          value={draftRecord.next_visit_date || 'Not scheduled'}
          isEdited={recentlyEditedField === 'next_visit_date'}
          icon={<Calendar size={18} />}
          onTap={() => handleOpenEdit('next_visit_date', draftRecord.next_visit_date)}
        />

        {hasDanger && (
          <FieldRow
            label={t.confirm.dangerSignsLabel}
            value={draftRecord.danger_flags.join(', ')}
            isDanger={true}
            icon={<AlertTriangle size={18} className="text-danger" />}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={<CheckCircle2 size={22} />}
          onClick={handleConfirmSave}
        >
          {t.confirm.confirmAndSave}
        </Button>

        <Button
          variant="secondary"
          size="md"
          fullWidth
          icon={<RotateCcw size={18} />}
          onClick={handleReRecord}
        >
          {t.confirm.reRecord}
        </Button>

        {draftRecord.next_visit_date && (
          <Button
            variant="secondary"
            size="md"
            fullWidth
            icon={<Share2 size={18} className="text-teal-700" />}
            onClick={handleShareFamilyReminder}
          >
            Share next visit date
          </Button>
        )}
      </div>

      {/* Tap-to-Edit Modal */}
      {editingModalField && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-card p-5 w-full max-w-sm border border-line space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-ink">
              Edit {editingModalField.replace(/_/g, ' ')}
            </h3>
            <input
              type="text"
              value={modalInputValue}
              onChange={(e) => setModalInputValue(e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-cream focus:outline-none focus:border-teal-700"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditingModalField(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveModal}>
                Save Field
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
