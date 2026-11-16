import React, { useState } from 'react';
import { ShieldCheck, Mic, MapPin, AlertCircle, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SUPPORTED_LANGUAGES, SupportedLanguage, getT } from '../i18n';

export interface ConsentScreenProps {
  onAgree: (lang: SupportedLanguage) => void;
}

export const ConsentScreen: React.FC<ConsentScreenProps> = ({ onAgree }) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en');
  const [agreed, setAgreed] = useState(false);

  const t = getT(selectedLang);

  return (
    <div className="min-h-full flex flex-col justify-between p-6 max-w-md mx-auto bg-cream">
      <div className="space-y-6 pt-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-900 mb-2">
            <ShieldCheck size={36} />
          </div>
          <h1 className="text-2xl font-bold text-ink">{t.consent.welcomeTitle}</h1>
          <p className="text-sm text-muted">{t.consent.welcomeSubtitle}</p>
        </div>

        {/* 7-Language Picker Grid */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-muted px-1">
            {t.consent.chooseLang}
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar p-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLang(lang.code)}
                  className={`p-3 rounded-card border text-left transition-all ${
                    isSelected
                      ? 'bg-teal-900 text-white border-teal-900 shadow-soft font-bold'
                      : 'bg-surface text-ink border-line hover:border-teal-700/40'
                  }`}
                >
                  <div className="text-base">{lang.nativeName}</div>
                  <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-teal-100' : 'text-muted'}`}>
                    {lang.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Privacy & Safety Consent Points */}
        <Card className="space-y-4 text-sm text-ink bg-surface border-line">
          <div className="font-bold text-teal-900 flex items-center gap-2 border-b border-line pb-2">
            <AlertCircle size={18} className="text-saffron-500" />
            {t.consent.safetyTitle}
          </div>

          <div className="flex items-start gap-3">
            <Mic size={20} className="text-teal-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-ink">{t.consent.voiceAiTitle}</strong>
              <p className="text-muted text-xs mt-0.5">{t.consent.voiceAiDesc}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-teal-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-ink">{t.consent.locationTitle}</strong>
              <p className="text-muted text-xs mt-0.5">{t.consent.locationDesc}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-danger shrink-0 mt-0.5" />
            <div>
              <strong className="block text-danger">{t.consent.medicalTitle}</strong>
              <p className="text-muted text-xs mt-0.5">{t.consent.medicalDesc}</p>
            </div>
          </div>
        </Card>

        {/* Checkbox agreement */}
        <label
          onClick={() => setAgreed(!agreed)}
          className="flex items-center gap-3 p-3 rounded-card bg-teal-100/40 border border-teal-700/20 cursor-pointer select-none"
        >
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
              agreed ? 'bg-teal-900 border-teal-900 text-white' : 'bg-surface border-line'
            }`}
          >
            {agreed && <Check size={16} className="stroke-[3]" />}
          </div>
          <span className="text-xs font-semibold text-ink flex-1">
            {t.consent.agreeCheckbox}
          </span>
        </label>
      </div>

      {/* Primary Action Button */}
      <div className="pt-6 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!agreed}
          onClick={() => onAgree(selectedLang)}
        >
          {t.consent.continueBtn}
        </Button>
      </div>
    </div>
  );
};
