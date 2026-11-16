import React, { useState, useEffect, useRef } from 'react';
import { MicButton } from '../components/ui/MicButton';
import { Waveform } from '../components/ui/Waveform';
import { Chip } from '../components/ui/Chip';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Bot, User, Check, X, Sparkles, Volume2, Gauge } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { getT } from '../i18n';
import { VoicePipeline } from '../utils/audioPipeline';

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

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [agentSpokenText, setAgentSpokenText] = useState(t.recording.aiDisclosureMsg);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(480);
  const [extractedEntities, setExtractedEntities] = useState<Array<{ label: string; type: string }>>([]);

  const pipelineRef = useRef<VoicePipeline | null>(null);

  useEffect(() => {
    // Initialise pipeline connected to relay
    const relayUrl = import.meta.env.VITE_RELAY_URL || 'http://localhost:8080';
    const pipeline = new VoicePipeline({
      onPartialTranscript: (text) => {
        setTranscript(text);
      },
      onFinalTranscript: (text) => {
        setTranscript(text);
        setIsListening(false);
        // Extract quick preview chips
        extractQuickChips(text);
      },
      onAgentAudioStart: () => {
        setIsAgentSpeaking(true);
      },
      onAgentAudioEnd: () => {
        setIsAgentSpeaking(false);
      },
      onLatencyMeasured: (ms) => {
        setLatencyMs(ms);
      },
      onError: (err) => {
        showToast(err, 'danger');
        setIsListening(false);
      },
    });

    pipelineRef.current = pipeline;
    pipeline.connect(relayUrl, 'mock-jwt-token-for-dev');

    // Auto-read initial AI greeting
    const timer = setTimeout(() => {
      pipeline.requestTts(t.recording.aiDisclosureMsg, language);
    }, 400);

    return () => {
      clearTimeout(timer);
      pipeline.disconnect();
    };
  }, [language]);

  const extractQuickChips = (text: string) => {
    const chips: Array<{ label: string; type: string }> = [];
    if (/meena|mina/i.test(text)) chips.push({ label: 'Meena Devi', type: 'Name' });
    if (/anc/i.test(text)) chips.push({ label: 'ANC Visit', type: 'Type' });
    if (/\d+(\.\d+)?\s*(kg|kilo)/i.test(text)) {
      const match = text.match(/\d+(\.\d+)?\s*(kg|kilo)/i);
      if (match) chips.push({ label: match[0], type: 'Weight' });
    }
    if (/tt/i.test(text)) chips.push({ label: 'TT Vaccine', type: 'Vaccine' });
    if (/monday|somvar|16 nov/i.test(text)) chips.push({ label: 'Next: Monday', type: 'Due' });

    if (chips.length > 0) {
      setExtractedEntities(chips);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      pipelineRef.current?.stopRecording();
      setIsListening(false);
    } else {
      // Barge-in check: if agent is currently speaking, cut speech immediately
      if (isAgentSpeaking) {
        pipelineRef.current?.triggerBargeIn();
      }
      setIsListening(true);
      pipelineRef.current?.startRecording(language);
    }
  };

  const handleFinish = () => {
    pipelineRef.current?.stopRecording();
    setIsListening(false);

    onFinishRecording({
      beneficiary_name: 'Meena Devi',
      beneficiary_code: 'SYN-0001',
      village: 'Rampur',
      visit_type: 'ANC',
      weight_kg: 54.5,
      temperature_c: 37.0,
      breaths_per_min: 18,
      vaccinations_due: ['TT 2'],
      next_visit_date: '2026-11-23',
      danger_flags: [],
      raw_transcript: transcript,
    });
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-4 max-w-md mx-auto pb-24 pt-2">
      {/* Header Info */}
      <div className="space-y-3">
        {/* Agent First-turn AI Disclosure Bar with Speaking indicator & Latency chip */}
        <div className="p-3 bg-teal-100 rounded-card border border-teal-700/20 flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <Bot size={20} className="text-teal-900 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-900 leading-relaxed font-medium">
              <span className="font-bold block mb-0.5">{t.recording.aiDisclosureTitle}</span>
              {agentSpokenText}
            </div>
          </div>

          {latencyMs !== null && (
            <div className="shrink-0 flex items-center gap-1 bg-surface/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-teal-900 border border-teal-700/20 shadow-sm">
              <Gauge size={11} className="text-teal-700" />
              <span>{latencyMs}ms</span>
            </div>
          )}
        </div>

        {/* Live Extracted Entities Appearing in Real-time */}
        {extractedEntities.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
              <Sparkles size={13} className="text-saffron-500" />
              {t.recording.liveFieldsTitle}
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[36px]">
              {extractedEntities.map((chip, idx) => (
                <Chip key={idx} variant="teal" size="sm">
                  <span className="font-bold">{chip.label}</span>
                  <span className="opacity-70 text-[10px]">({chip.type})</span>
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Live Transcript Card */}
        <Card className="bg-surface border-line min-h-[120px] p-4 flex flex-col justify-between">
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
            <p className="text-base text-ink font-medium leading-relaxed min-h-[48px]">
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
      <div className="py-6 flex flex-col items-center justify-center">
        <MicButton
          isListening={isListening}
          onClick={handleToggleListening}
          label={isListening ? t.recording.listening : t.recording.tapToSpeak}
        />
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          variant="secondary"
          size="md"
          icon={<X size={18} />}
          onClick={onCancel}
        >
          {t.recording.cancel}
        </Button>

        <Button
          variant="primary"
          size="md"
          icon={<Check size={18} />}
          onClick={handleFinish}
        >
          {t.recording.finish}
        </Button>
      </div>
    </div>
  );
};
