import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLocale, type SupportedLocale } from '../i18n';

interface SettingsState {
  language: SupportedLocale;
  isHydrated: boolean;
}

interface SettingsActions {
  setHydrated: (hydrated: boolean) => void;
  setLanguage: (language: SupportedLocale) => void;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: 'system',
      isHydrated: false,

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),

      setLanguage: (language) => {
        setLocale(language);
        set({ language });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          setLocale(state.language);
        }
      },
      partialize: (state) => ({ language: state.language }),
    }
  )
);
