import { create } from 'zustand';
import type { SupportedLanguage } from '../i18n/index.ts';

export type ScreenId = 'consent' | 'today' | 'record' | 'confirm' | 'visits' | 'map' | 'month' | 'settings';
export type TextSize = 'normal' | 'large' | 'extra-large';
export type LocationPrecision = 'exact' | 'village';

interface AppState {
  currentScreen: ScreenId;
  hasConsented: boolean;
  language: SupportedLanguage;
  textSize: TextSize;
  locationSharing: boolean;
  locationPrecision: LocationPrecision;
  activeVisitDraft: any | null;
  toastMessage: string | null;
  toastType: 'success' | 'danger' | 'info';
  
  // Actions
  setScreen: (screen: ScreenId) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setTextSize: (textSize: TextSize) => void;
  setLocationSharing: (enabled: boolean) => void;
  setLocationPrecision: (precision: LocationPrecision) => void;
  setConsented: (consented: boolean, language?: SupportedLanguage) => void;
  setVisitDraft: (draft: any | null) => void;
  showToast: (message: string, type?: 'success' | 'danger' | 'info') => void;
  clearToast: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentScreen: 'today',
  hasConsented: true, // defaults to true for immediate exploration, togglable in settings
  language: 'en',
  textSize: 'normal',
  locationSharing: true,
  locationPrecision: 'village',
  activeVisitDraft: null,
  toastMessage: null,
  toastType: 'info',

  setScreen: (screen) => set({ currentScreen: screen }),
  setLanguage: (language: SupportedLanguage) => set({ language }),
  setTextSize: (textSize: TextSize) => set({ textSize }),
  setLocationSharing: (locationSharing: boolean) => set({ locationSharing }),
  setLocationPrecision: (locationPrecision: LocationPrecision) => set({ locationPrecision }),
  setConsented: (hasConsented, language = 'en') => set({ hasConsented, language, currentScreen: hasConsented ? 'today' : 'consent' }),
  setVisitDraft: (activeVisitDraft) => set({ activeVisitDraft }),
  showToast: (toastMessage, toastType = 'info') => set({ toastMessage, toastType }),
  clearToast: () => set({ toastMessage: null }),
}));

