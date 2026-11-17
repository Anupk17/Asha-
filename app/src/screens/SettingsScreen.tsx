import React, { useState, useEffect } from 'react';
import { Trash2, Globe, Bell, Volume2, MapPin, Gauge, Info, RefreshCw, Database, Moon, Type } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../store/appStore';
import { deleteAllUserData, getFollowUps } from '../data/repository';
import { seedDatabase } from '../data/seed';
import { getT, SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n';
import { ReminderService, ReminderSettings } from '../utils/reminderService';

export interface SettingsScreenProps {
  onResetConsent?: () => void;
  onDeleteAllData?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onDeleteAllData,
}) => {
  const { language, setLanguage, textSize, setTextSize, showToast } = useAppStore();
  const t = getT(language);

  const [noiseMode, setNoiseMode] = useState(true);
  const [showLatency, setShowLatency] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [locationPrecision, setLocationPrecision] = useState<'exact' | 'village'>('village');
  
  // Reminders & Notifications
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('21:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const uid = 'demo-asha-worker-01';

  // Reschedule reminders whenever reminder settings change
  const handleUpdateReminderSettings = async (overrides?: Partial<ReminderSettings>) => {
    const currentSettings: ReminderSettings = {
      enabled: overrides?.enabled !== undefined ? overrides.enabled : remindersEnabled,
      reminderTime: overrides?.reminderTime !== undefined ? overrides.reminderTime : reminderTime,
      quietHoursStart: quietHoursEnabled ? quietHoursStart : undefined,
      quietHoursEnd: quietHoursEnabled ? quietHoursEnd : undefined,
      language,
    };

    try {
      const followups = await getFollowUps(uid);
      await ReminderService.rescheduleAll(followups, currentSettings);
      showToast('Reminder schedule updated', 'info');
    } catch (e) {
      console.warn('Reminder reschedule error:', e);
    }
  };

  const handleDeleteAll = async () => {
    const confirmPrompt = window.confirm(t.settings.deleteDataConfirm);
    if (!confirmPrompt) return;

    setIsDeleting(true);
    try {
      await deleteAllUserData(uid);
      await ReminderService.cancelAll();
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
      const followups = await getFollowUps(uid);
      await ReminderService.rescheduleAll(followups, {
        enabled: remindersEnabled,
        reminderTime,
        language,
      });

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

      {/* Text Size Accessibility */}
      <Card className="p-3.5 bg-surface border-line space-y-2">
        <div className="flex items-center gap-2">
          <Type size={18} className="text-teal-700" />
          <div>
            <div className="text-sm font-bold text-ink">Text Size (Readable in Sunlight)</div>
            <div className="text-xs text-muted">Adjust scale for low-end screens</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {(['normal', 'large', 'extra-large'] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                setTextSize(size);
                showToast(`Text size set to ${size}`, 'info');
              }}
              className={`py-2 px-3 rounded-btn text-xs font-bold border transition-all ${
                textSize === size
                  ? 'bg-teal-900 text-white border-teal-900 shadow-sm'
                  : 'bg-cream text-ink border-line hover:border-teal-700/40'
              }`}
            >
              {size === 'normal' ? 'Normal (16px)' : size === 'large' ? 'Large (18px)' : 'Extra (20px)'}
            </button>
          ))}
        </div>
      </Card>

      {/* Reminders & Notifications Settings (Phase 6) */}
      <Card className="p-3.5 bg-surface border-line space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-teal-700" />
            <div>
              <div className="text-sm font-bold text-ink">Reminders & Daily Schedule</div>
              <div className="text-xs text-muted">Offline morning briefing & overdue notices</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={remindersEnabled}
            onChange={(e) => {
              const val = e.target.checked;
              setRemindersEnabled(val);
              handleUpdateReminderSettings({ enabled: val });
            }}
            className="w-5 h-5 accent-teal-900 cursor-pointer"
          />
        </div>

        {remindersEnabled && (
          <div className="space-y-2 pt-2 border-t border-line/60">
            {/* Morning Reminder Time */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink font-medium">{t.settings.reminderTimeTitle}</span>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => {
                  const val = e.target.value;
                  setReminderTime(val);
                  handleUpdateReminderSettings({ reminderTime: val });
                }}
                className="bg-cream border border-line rounded px-2 py-1 font-semibold text-ink"
              />
            </div>

            {/* Quiet Hours */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5 text-muted">
                <Moon size={14} />
                <span>Quiet Hours (No alerts)</span>
              </div>
              <input
                type="checkbox"
                checked={quietHoursEnabled}
                onChange={(e) => {
                  setQuietHoursEnabled(e.target.checked);
                  handleUpdateReminderSettings();
                }}
                className="w-4 h-4 accent-teal-900 cursor-pointer"
              />
            </div>

            {quietHoursEnabled && (
              <div className="flex items-center justify-between text-xs text-muted pl-5">
                <span>Between:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => {
                      setQuietHoursStart(e.target.value);
                      handleUpdateReminderSettings();
                    }}
                    className="bg-cream border border-line rounded px-1.5 py-0.5 text-[11px]"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => {
                      setQuietHoursEnd(e.target.value);
                      handleUpdateReminderSettings();
                    }}
                    className="bg-cream border border-line rounded px-1.5 py-0.5 text-[11px]"
                  />
                </div>
              </div>
            )}
          </div>
        )}
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
