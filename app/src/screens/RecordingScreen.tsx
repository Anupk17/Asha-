import React, { useEffect, useRef } from 'react';
import { MicButton } from '../components/ui/MicButton';
import { Waveform } from '../components/ui/Waveform';
import { Chip } from '../components/ui/Chip';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Banner } from '../components/ui/Banner';
import { Bot, User, Check, X, Sparkles, AlertTriangle, Gauge, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useAgentStore, AgentStep } from '../store/agentStore';
import { getT } from '../i18n';
import { VoicePipeline } from '../utils/audioPipeline';
import { getLocalizedBeneficiaryName, getLocalizedVillageName, getLocalizedTaskType } from '../i18n/localize';

export interface RecordingScreenProps {
  onFinishRecording: (extractedData: any) => void;
  onCancel: () => void;
}

export const RecordingScreen: React.FC<RecordingScreenProps> = ({
  onFinishRecording,
  onCancel,
}) => {
  const { language, showToast } = useAppStore();
  const t = getT(language);

  const {
    step,
    agentSpokenText,
    transcript,
    isListening,
    isAgentSpeaking,
    latencyMs,
    draftRecord,
    missingField,
    showTapFallbackNotice,
    initSession,
    setListening,
    setAgentSpeaking,
    setLatencyMs,
    setPartialTranscript,
    onFinalTranscript,
    confirmAndSave,
    cancelSession,
    triggerBargeIn,
  } = useAgentStore();

  const pipelineRef = useRef<VoicePipeline | null>(null);

  useEffect(() => {
    // Initialise pipeline connected to relay
    const relayUrl = import.meta.env.VITE_RELAY_URL || 'http://localhost:8080';
    const pipeline = new VoicePipeline({
      onPartialTranscript: (text) => {
        setPartialTranscript(text);
      },
      onFinalTranscript: (text) => {
        onFinalTranscript(text, (msg) => {
          pipeline.requestTts(msg, language);
        });
      },
      onAgentAudioStart: () => {
        setAgentSpeaking(true);
      },
      onAgentAudioEnd: () => {
        setAgentSpeaking(false);
        // Automatically start listening after greeting or questions
        const currentStep = useAgentStore.getState().step;
        if (currentStep === 'GREETING' || currentStep === 'ASK_MISSING' || currentStep === 'CONFIRM_READBACK') {
          pipeline.startRecording(language);
          setListening(true);
        }
      },
      onLatencyMeasured: (ms) => {
        setLatencyMs(ms);
      },
      onError: (err) => {
        showToast(err, 'danger');
        setListening(false);
      },
    });

    pipelineRef.current = pipeline;
    pipeline.connect(relayUrl, 'mock-jwt-token-for-dev');

    // Initialize state machine
    initSession(language);

    // Speak initial AI greeting (under 2 sentences, discloses AI and no medical advice)
    const timer = setTimeout(() => {
      pipeline.requestTts(t.agentDialogue.greeting, language);
    }, 350);

    return () => {
      clearTimeout(timer);
      pipeline.disconnect();
    };
  }, [language]);

  // Handle transitions to SAVED or CANCELLED
  useEffect(() => {
    if (step === 'SAVED') {
      showToast(t.confirm.savedSuccessToast, 'success');
      setTimeout(() => {
        onFinishRecording(draftRecord);
      }, 1500);
    } else if (step === 'CANCELLED') {
      setTimeout(() => {
        onCancel();
      }, 1000);
    }
  }, [step]);

  const handleToggleListening = () => {
    if (isListening) {
      pipelineRef.current?.stopRecording();
      setListening(false);
    } else {
      // Barge-in check: if agent is currently speaking, cut speech immediately
      if (isAgentSpeaking) {
        pipelineRef.current?.triggerBargeIn();
        triggerBargeIn();
      }
      setListening(true);
      pipelineRef.current?.startRecording(language);
    }
  };

  const handleFinish = async () => {
    pipelineRef.current?.stopRecording();
    setListening(false);

    if (step === 'CONFIRM_READBACK') {
      await confirmAndSave(undefined, (msg) => {
        pipelineRef.current?.requestTts(msg, language);
      });
    } else {
      onFinishRecording(draftRecord);
    }
  };

  const handleCancelClick = () => {
    cancelSession((msg) => {
      pipelineRef.current?.requestTts(msg, language);
    });
  };

  // Step badges
  const getStepBadge = (s: AgentStep) => {
    switch (s) {
      case 'GREETING':
        return { label: 'Greeting', color: 'bg-teal-100 text-teal-900 border-teal-700/20' };
      case 'CAPTURE':
        return { label: 'Listening to Notes', color: 'bg-saffron-100 text-saffron-900 border-saffron-500/30' };
      case 'ASK_MISSING':
        return { label: 'Missing Item Check', color: 'bg-yellow-100 text-yellow-900 border-yellow-500/30' };
      case 'CONFIRM_READBACK':
        return { label: 'Voice Confirmation', color: 'bg-teal-100 text-teal-900 border-teal-700/20' };
      case 'CORRECT':
        return { label: 'Correction Applied', color: 'bg-saffron-100 text-saffron-900 border-saffron-500/30' };
      case 'SAVING':
        return { label: 'Saving Record...', color: 'bg-blue-100 text-blue-900 border-blue-500/30' };
      case 'SAVED':
        return { label: 'Saved Successfully', color: 'bg-emerald-100 text-emerald-900 border-emerald-500/30' };
      default:
        return { label: 'Ready', color: 'bg-teal-100 text-teal-900 border-teal-700/20' };
    }
  };

  const badge = getStepBadge(step);

  return (
    <div className="min-h-full flex flex-col justify-between p-4 max-w-md mx-auto pb-24 pt-2">
      {/* Header Info */}
      <div className="space-y-3">
        {/* Step Badge & Latency */}
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
            {badge.label}
          </span>
          {latencyMs !== null && (
            <div className="flex items-center gap-1 bg-surface px-2 py-0.5 rounded text-[10px] font-mono font-bold text-teal-900 border border-teal-700/20 shadow-sm">
              <Gauge size={11} className="text-teal-700" />
              <span>{latencyMs}ms</span>
            </div>
          )}
        </div>

        {/* Danger Banner if detected */}
        {draftRecord.danger_flags.length > 0 && (
          <Banner
            type="danger"
            title={t.confirm.dangerAlertTitle}
            message={`${t.confirm.dangerAlertMsg} (${draftRecord.danger_flags.join(', ')})`}
            guidelineSource="MoHFW Guidelines (Emergency Referral)"
          />
        )}

        {/* Agent Spoken Dialogue Card */}
        <div className="p-3.5 bg-teal-100 rounded-card border border-teal-700/20 flex items-start gap-2.5">
          <Bot size={22} className={`text-teal-900 shrink-0 mt-0.5 ${isAgentSpeaking ? 'animate-bounce' : ''}`} />
          <div className="text-xs text-teal-900 leading-relaxed font-medium">
            <span className="font-bold block mb-0.5 text-teal-900">
              {t.recording.aiDisclosureTitle}
            </span>
            <p className="text-sm font-semibold text-ink leading-snug">
              {agentSpokenText}
            </p>
          </div>
        </div>

        {/* Missing Item Alert if in ASK_MISSING */}
        {step === 'ASK_MISSING' && missingField && (
          <div className="p-2.5 bg-amber-50 rounded-card border border-amber-300 flex items-center gap-2 text-xs text-amber-900 font-semibold">
            <HelpCircle size={16} className="text-amber-700 shrink-0" />
            <span>Missing: {missingField}. Please speak the value or answer the question.</span>
          </div>
        )}

        {/* Tap fallback notice if silence/unknown input happened */}
        {showTapFallbackNotice && (
          <div className="p-2.5 bg-saffron-100 rounded-card border border-saffron-500/40 text-xs text-ink font-semibold flex items-center gap-2">
            <AlertTriangle size={16} className="text-saffron-500 shrink-0" />
            <span>Tap "Confirm & Save" below or tap to edit any field.</span>
          </div>
        )}

        {/* Live Extracted Fields / Chips */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
            <Sparkles size={13} className="text-saffron-500" />
            <span>{t.recording.liveFieldsTitle}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[36px]">
            {draftRecord.beneficiary_name && (
              <Chip variant="teal" size="sm">
                <span className="font-bold">
                  {getLocalizedBeneficiaryName(draftRecord.beneficiary_code || '', draftRecord.beneficiary_name, language)}
                </span>
              </Chip>
            )}
            {draftRecord.visit_type && (
              <Chip variant="teal" size="sm">
                <span>{getLocalizedTaskType(draftRecord.visit_type, language)}</span>
              </Chip>
            )}
            {draftRecord.weight_kg && (
              <Chip variant="saffron" size="sm">
                <span className="font-bold">{draftRecord.weight_kg} kg</span>
              </Chip>
            )}
            {draftRecord.temperature_c && (
              <Chip variant="neutral" size="sm">
                <span>{draftRecord.temperature_c}°C</span>
              </Chip>
            )}
            {draftRecord.breaths_per_min && (
              <Chip variant="neutral" size="sm">
                <span>{draftRecord.breaths_per_min}/min</span>
              </Chip>
            )}
            {draftRecord.next_visit_date && (
              <Chip variant="teal" size="sm">
                <span>Next: {draftRecord.next_visit_date}</span>
              </Chip>
            )}
            {draftRecord.danger_flags.map((df, idx) => (
              <Chip key={idx} variant="danger" size="sm">
                <span className="font-bold">⚠️ {df}</span>
              </Chip>
            ))}
          </div>
        </div>

        {/* Live Speech Transcript Card */}
        <Card className="bg-surface border-line min-h-[110px] p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-muted">
              <div className="flex items-center gap-1.5">
                <User size={14} />
                <span>{t.recording.transcriptTitle}</span>
              </div>
              {isListening && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-danger animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-danger" />
                  REC
                </span>
              )}
            </div>
            <p className="text-base text-ink font-medium leading-relaxed min-h-[44px]">
              {transcript || (
                <span className="text-sm italic text-muted">
                  {isListening ? t.recording.listening : t.recording.tapToSpeak}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-line/60">
            <span>Language: {language.toUpperCase()}</span>
            <span className="text-teal-700 font-semibold">{t.recording.pcmLabel}</span>
          </div>
        </Card>

        {/* Live Audio Waveform */}
        <Waveform isActive={isListening || isAgentSpeaking} />
      </div>

      {/* Mic Center Section */}
      <div className="py-4 flex flex-col items-center justify-center">
        <MicButton
          isListening={isListening}
          onClick={handleToggleListening}
          label={isListening ? t.recording.listening : t.recording.tapToSpeak}
        />
        {step === 'CONFIRM_READBACK' && (
          <p className="text-xs text-muted text-center mt-2 font-medium">
            Say <span className="font-bold text-teal-900">"Yes"</span> to save, or speak a correction
          </p>
        )}
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          variant="secondary"
          size="md"
          icon={<X size={18} />}
          onClick={handleCancelClick}
        >
          {t.recording.cancel}
        </Button>

        <Button
          variant="primary"
          size="md"
          icon={<CheckCircle2 size={18} />}
          onClick={handleFinish}
        >
          {step === 'CONFIRM_READBACK' ? t.confirm.confirmAndSave : t.recording.finish}
        </Button>
      </div>
    </div>
  );
};
