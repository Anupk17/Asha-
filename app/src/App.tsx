import React, { useEffect, useState } from 'react';
import { useAppStore, ScreenId } from './store/appStore';
import { ConsentScreen } from './screens/ConsentScreen';
import { TodayScreen } from './screens/TodayScreen';
import { RecordingScreen } from './screens/RecordingScreen';
import { ConfirmScreen } from './screens/ConfirmScreen';
import { VisitsSearchScreen } from './screens/VisitsSearchScreen';
import { MapScreen } from './screens/MapScreen';
import { MonthScreen } from './screens/MonthScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { BottomNav, TabId } from './components/ui/BottomNav';
import { Toast } from './components/ui/Toast';
import { initAuth } from './data/firebase';
import { ArrowLeft, Settings, ShieldCheck, Globe } from 'lucide-react';
import { getT, SUPPORTED_LANGUAGES, SupportedLanguage } from './i18n';

export const App: React.FC = () => {
  const {
    currentScreen,
    language,
    toastMessage,
    toastType,
    setScreen,
    setLanguage,
    setConsented,
    setVisitDraft,
    showToast,
    clearToast,
  } = useAppStore();

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const t = getT(language);

  useEffect(() => {
    // Initialise anonymous Firebase authentication
    initAuth().then((user) => {
      if (user) {
        console.log('Firebase user initialized:', user.uid);
      }
    });
  }, []);

  const handleStartRecord = () => {
    setScreen('record');
  };

  const handleFinishRecording = (draftData: any) => {
    setVisitDraft(draftData);
    setScreen('confirm');
  };

  const handleSaveVisit = () => {
    showToast(t.confirm.savedSuccessToast, 'success');
    setScreen('today');
  };

  const isMainTab = ['today', 'visits', 'map', 'month', 'settings'].includes(currentScreen);

  return (
    <div className="h-full flex flex-col bg-cream text-ink select-none overflow-hidden">
      {/* Top Application Header */}
      {currentScreen !== 'consent' && (
        <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur border-b border-line px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isMainTab && (
              <button
                type="button"
                onClick={() => setScreen('today')}
                className="p-1.5 -ml-1 text-teal-900 hover:bg-teal-100/50 rounded-full"
                aria-label="Back to home"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-700" />
              <h1 className="font-bold text-base text-ink tracking-tight">{t.appName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 relative">
            {/* Quick Language Switcher Dropdown */}
            <button
              type="button"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-100/60 hover:bg-teal-100 text-teal-900 text-xs font-bold border border-teal-700/20"
              title="Change Language"
            >
              <Globe size={13} />
              <span>{language.toUpperCase()}</span>
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 top-10 mt-1 w-44 bg-surface rounded-card border border-line shadow-lg py-1.5 z-50">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangMenuOpen(false);
                      showToast(`Language set to ${lang.name} (${lang.nativeName})`, 'info');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-teal-100/50 ${
                      language === lang.code ? 'font-bold text-teal-900 bg-teal-100/30' : 'text-ink'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-muted">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setScreen('consent')}
              className="p-2 text-muted hover:text-teal-900 rounded-full"
              title="Consent & Disclosures"
            >
              <ShieldCheck size={18} />
            </button>
            <button
              type="button"
              onClick={() => setScreen('settings')}
              className="p-2 text-muted hover:text-teal-900 rounded-full"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        {currentScreen === 'consent' && (
          <ConsentScreen
            onAgree={(selectedLang: SupportedLanguage) => {
              setConsented(true, selectedLang);
              showToast('Consent accepted', 'success');
            }}
          />
        )}

        {currentScreen === 'today' && (
          <TodayScreen
            onStartRecord={handleStartRecord}
            onOpenFollowUp={(item) => {
              showToast(`${item.beneficiary_name} selected`, 'info');
            }}
          />
        )}

        {currentScreen === 'record' && (
          <RecordingScreen
            onFinishRecording={handleFinishRecording}
            onCancel={() => setScreen('today')}
          />
        )}

        {currentScreen === 'confirm' && (
          <ConfirmScreen
            onSave={handleSaveVisit}
            onRetake={() => setScreen('record')}
          />
        )}

        {currentScreen === 'visits' && (
          <VisitsSearchScreen
            onSelectBeneficiary={(b) => {
              showToast(`${b.name} (${b.code}) selected`, 'info');
            }}
            onNewBeneficiary={() => {
              showToast('Add new beneficiary', 'info');
            }}
          />
        )}

        {currentScreen === 'map' && (
          <MapScreen
            onStartVisit={(b) => {
              setVisitDraft({ beneficiary_name: b.name, beneficiary_code: b.code, village: b.village });
              setScreen('record');
            }}
          />
        )}

        {currentScreen === 'month' && <MonthScreen />}

        {currentScreen === 'settings' && (
          <SettingsScreen
            onResetConsent={() => setScreen('consent')}
            onDeleteAllData={() => {
              showToast('All local data wiped', 'danger');
              setScreen('today');
            }}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation for 5 Main Tabs */}
      {isMainTab && (
        <BottomNav
          activeTab={currentScreen as TabId}
          onTabChange={(tab) => setScreen(tab as ScreenId)}
        />
      )}

      {/* Global Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={clearToast}
        />
      )}
    </div>
  );
};
