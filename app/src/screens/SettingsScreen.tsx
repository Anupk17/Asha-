import React, { useState } from 'react';
import { Trash2, Globe, Bell, Volume2, MapPin, Gauge, Info, RefreshCw, Database } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../store/appStore';
import { deleteAllUserData } from '../data/repository';
import { seedDatabase } from '../data/seed';
import { getT, SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n';

export interface SettingsScreenProps {
  onResetConsent?: () => void;
  onDeleteAllData?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onDeleteAllData,
}) => {
  const { language, setLanguage, showToast } = useAppStore();
  const t = getT(language);

  const [noiseMode, setNoiseMode] = useState(true);
  const [showLatency, setShowLatency] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [locationPrecision, setLocationPrecision] = useState<'exact' | 'village'>('village');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const uid = 'demo-asha-worker-01';

  const handleDeleteAll = async () => {
    const confirmPrompt = window.confirm(t.settings.deleteDataConfirm);
    if (!confirmPrompt) return;

    setIsDeleting(true);
    try {
      await deleteAllUserData(uid);
      showToast(t.settings.deleteSuccess, 'danger');
      onDeleteAllData?.();
    } catch (e) {
      showToast('Error deleting data', 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const res = await seedDatabase(uid);
      const seedSuccessMessages: Record<string, string> = {
        en: `Demo data loaded: ${res.beneficiaries} beneficiaries, ${res.visits} visits.`,
        hi: `डेमो डेटा लोड: ${res.beneficiaries} लाभार्थी, ${res.visits} भेंट।`,
        ta: `மாதிரி தரவு ஏற்றப்பட்டது: ${res.beneficiaries} பயனாளிகள், ${res.visits} பார்வைகள்.`,
        te: `డెమో డేటా లోడ్ చేయబడింది: ${res.beneficiaries} లబ్ధిదారులు, ${res.visits} సందర్శనలు.`,
        kn: `ಡೆಮೊ ಡೇಟಾ ಲೋಡ್ ಆಗಿದೆ: ${res.beneficiaries} ಫಲಾನುಭವಿಗಳು, ${res.visits} ಭೇಟಿಗಳು.`,
        ml: `ഡെമോ ഡാറ്റ ലോഡ് ചെയ്തു: ${res.beneficiaries} ഗുണഭോക്താക്കൾ, ${res.visits} സന്ദർശനങ്ങൾ.`,
        mr: `डेमो डेटा लोड झाला: ${res.beneficiaries} लाभार्थी, ${res.visits} भेटी.`,
      };
      showToast(seedSuccessMessages[language] || seedSuccessMessages.en, 'success');
    } catch (e) {
      showToast('Error seeding database', 'danger');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-ink">{t.settings.title}</h2>
        <p className="text-xs text-muted">{t.settings.subTitle}</p>
      </div>

      {/* Language - all 7 languages */}
      <Card className="p-3.5 bg-surface border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-teal-700" />
          <div>
            <div className="text-sm font-bold text-ink">{t.settings.languageTitle}</div>
            <div className="text-xs text-muted">{t.settings.languageDesc}</div>
          </div>
        </div>
        <select
          value={language}
          onChange={(e) => {
            const nextLang = e.target.value as SupportedLanguage;
            setLanguage(nextLang);
            showToast(`Language set to ${SUPPORTED_LANGUAGES.find(l => l.code === nextLang)?.name}`, 'info');
          }}
          className="bg-cream border border-line rounded-lg px-2.5 py-1 text-xs font-semibold text-ink"
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.nativeName} ({l.name})
            </option>
          ))}
        </select>
      </Card>

      {/* Latency Meter Toggle & Status */}
      <Card className="p-3.5 bg-surface border-line space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge size={18} className="text-teal-700" />
            <div>
              <div className="text-sm font-bold text-ink">{t.settings.latencyTitle}</div>
              <div className="text-xs text-muted">{t.settings.latencyDesc}</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={showLatency}
            onChange={(e) => setShowLatency(e.target.checked)}
            className="w-5 h-5 accent-teal-900 cursor-pointer"
          />
        </div>
        {showLatency && (
          <div className="p-2 rounded bg-teal-100 text-teal-900 text-xs font-mono flex items-center justify-between">
            <span>{t.settings.lastLatencyLabel}</span>
            <span className="font-bold">480 ms (target &lt; 800ms)</span>
          </div>
        )}
      </Card>

      {/* Noise Mode */}
      <Card className="p-3.5 bg-surface border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 size={18} className="text-teal-700" />
          <div>
            <div className="text-sm font-bold text-ink">{t.settings.noiseModeTitle}</div>
            <div className="text-xs text-muted">{t.settings.noiseModeDesc}</div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={noiseMode}
          onChange={(e) => setNoiseMode(e.target.checked)}
          className="w-5 h-5 accent-teal-900 cursor-pointer"
        />
      </Card>

      {/* Location Privacy */}
      <Card className="p-3.5 bg-surface border-line space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-teal-700" />
            <div>
              <div className="text-sm font-bold text-ink">{t.settings.locationTitle}</div>
              <div className="text-xs text-muted">{t.settings.locationDesc}</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={locationSharing}
            onChange={(e) => setLocationSharing(e.target.checked)}
            className="w-5 h-5 accent-teal-900 cursor-pointer"
          />
        </div>

        {locationSharing && (
          <div className="flex items-center justify-between pt-2 border-t border-line/60 text-xs">
            <span className="text-muted">{t.settings.precisionLabel}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLocationPrecision('village')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  locationPrecision === 'village'
                    ? 'bg-teal-900 text-white'
                    : 'bg-cream text-ink border border-line'
                }`}
              >
                {t.settings.villagePrecision}
              </button>
              <button
                type="button"
                onClick={() => setLocationPrecision('exact')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  locationPrecision === 'exact'
                    ? 'bg-teal-900 text-white'
                    : 'bg-cream text-ink border border-line'
                }`}
              >
                {t.settings.exactPrecision}
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Morning Reminder Time */}
      <Card className="p-3.5 bg-surface border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-teal-700" />
          <div>
            <div className="text-sm font-bold text-ink">{t.settings.reminderTimeTitle}</div>
            <div className="text-xs text-muted">{t.settings.reminderTimeDesc}</div>
          </div>
        </div>
        <input
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          className="bg-cream border border-line rounded-lg px-2 py-1 text-xs font-semibold text-ink"
        />
      </Card>

      {/* Seed Demo Data Button */}
      <Card className="p-3.5 bg-surface border-line space-y-2">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-teal-700" />
          <div>
            <div className="text-sm font-bold text-ink">{t.settings.demoDataTitle}</div>
            <div className="text-xs text-muted">{t.settings.demoDataDesc}</div>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          disabled={isSeeding}
          onClick={handleSeedData}
          icon={<RefreshCw size={16} className={isSeeding ? 'animate-spin' : ''} />}
        >
          {isSeeding ? 'Seeding...' : t.settings.seedButton}
        </Button>
      </Card>

      {/* Statutory Disclaimers */}
      <Card className="p-3.5 bg-cream border-line space-y-2 text-xs text-muted">
        <div className="flex items-center gap-2 font-bold text-ink">
          <Info size={16} className="text-teal-700" />
          <span>{t.settings.disclaimerTitle}</span>
        </div>
        <p className="leading-relaxed">
          1. <strong>{t.settings.disclaimerMedical}</strong>
        </p>
        <p className="leading-relaxed">
          2. <strong>{t.settings.disclaimerSynthetic}</strong>
        </p>
      </Card>

      {/* Delete All My Data */}
      <div className="pt-2">
        <Button
          variant="danger"
          size="md"
          fullWidth
          disabled={isDeleting}
          icon={<Trash2 size={18} />}
          onClick={handleDeleteAll}
        >
          {isDeleting ? 'Deleting...' : t.settings.deleteDataBtn}
        </Button>
      </div>
    </div>
  );
};
