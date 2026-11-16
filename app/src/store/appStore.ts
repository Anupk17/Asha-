import { create } from 'zustand';
import { SupportedLanguage } from '../i18n';

export type ScreenId = 'consent' | 'today' | 'record' | 'confirm' | 'visits' | 'map' | 'month' | 'settings';

interface AppState {
  currentScreen: ScreenId;
  hasConsented: boolean;
  language: SupportedLanguage;
  activeVisitDraft: any | null;
  toastMessage: string | null;
  toastType: 'success' | 'danger' | 'info';
  
  // Actions
  setScreen: (screen: ScreenId) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setConsented: (consented: boolean, language?: SupportedLanguage) => void;
  setVisitDraft: (draft: any | null) => void;
  showToast: (message: string, type?: 'success' | 'danger' | 'info') => void;
  clearToast: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentScreen: 'today',
  hasConsented: true, // defaults to true for immediate exploration, togglable in settings
  language: 'en',
  activeVisitDraft: null,
  toastMessage: null,
  toastType: 'info',

  setScreen: (screen) => set({ currentScreen: screen }),
  setLanguage: (language: SupportedLanguage) => set({ language }),
  setConsented: (hasConsented, language = 'en') => set({ hasConsented, language, currentScreen: hasConsented ? 'today' : 'consent' }),
  setVisitDraft: (activeVisitDraft) => set({ activeVisitDraft }),
  showToast: (toastMessage, toastType = 'info') => set({ toastMessage, toastType }),
  clearToast: () => set({ toastMessage: null }),
}));

