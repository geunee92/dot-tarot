import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GatingState, DEFAULT_GATING_LIMITS } from '../types';
import { getLocalDateKey } from '../utils/date';
import { getGatingKey, getItem, setItem } from '../utils/storage';

// ============================================
// Helper: Create default gating state for a date
// ============================================

function createDefaultGating(dateKey: string): GatingState {
  return {
    dateKey,
    freeSpreadUsed: false,
    clarifierUsedCount: 0,
    anotherTopicUsedCount: 0,
    lastAdTimestamp: 0,
  };
}

// ============================================
// Store Interface
// ============================================

interface GatingStoreState {
  // State
  gating: Record<string, GatingState>; // dateKey -> GatingState
  isHydrated: boolean;
  
  // Actions
  setHydrated: (hydrated: boolean) => void;
  loadGatingForDate: (dateKey: string) => Promise<GatingState>;
  getGatingForToday: () => GatingState;
  
  // Free spread
  canDoFreeSpread: (dateKey?: string) => boolean;
  useFreeSpread: (dateKey?: string) => Promise<boolean>;
  
  // Clarifier (ad unlock)
  canUseClarifier: (dateKey?: string) => boolean;
  useClarifier: (dateKey?: string) => Promise<boolean>;
  
  // Another topic (ad unlock)
  canUseAnotherTopic: (dateKey?: string) => boolean;
  useAnotherTopic: (dateKey?: string) => Promise<boolean>;
  
  // Ad cooldown
  canShowAd: () => boolean;
  markAdShown: () => void;
  getAdCooldownRemaining: () => number;
}

// ============================================
// Store Implementation
// ============================================

export const useGatingStore = create<GatingStoreState>()(
  persist(
    (set, get) => ({
      // Initial State
      gating: {},
      isHydrated: false,
      
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      
      // Load gating for a specific date
      loadGatingForDate: async (dateKey) => {
        const existing = get().gating[dateKey];
        if (existing) return existing;
        
        const storageKey = getGatingKey(dateKey);
        const saved = await getItem<GatingState>(storageKey);
        
        if (saved) {
          set((state) => ({
            gating: { ...state.gating, [dateKey]: saved },
          }));
          return saved;
        }
        
        // Create default if not found
        const defaultGating = createDefaultGating(dateKey);
        set((state) => ({
          gating: { ...state.gating, [dateKey]: defaultGating },
        }));
        return defaultGating;
      },
      
      // Get today's gating (create if needed)
      getGatingForToday: () => {
        const today = getLocalDateKey();
        const existing = get().gating[today];
        if (existing) return existing;
        
        const defaultGating = createDefaultGating(today);
        set((state) => ({
          gating: { ...state.gating, [today]: defaultGating },
        }));
        return defaultGating;
      },
      
      // ============================================
      // Free Spread
      // ============================================
      
      canDoFreeSpread: (dateKey) => {
        const targetDate = dateKey || getLocalDateKey();
        const gating = get().gating[targetDate];
        if (!gating) return true; // Not used yet
        return !gating.freeSpreadUsed;
      },
      
      useFreeSpread: async (dateKey) => {
        const targetDate = dateKey || getLocalDateKey();
        
        // Ensure gating exists
        let gating = get().gating[targetDate];
        if (!gating) {
          gating = createDefaultGating(targetDate);
        }
        
        if (gating.freeSpreadUsed) {
          return false; // Already used
        }
        
        const updated: GatingState = {
          ...gating,
          freeSpreadUsed: true,
        };
        
        // Save to storage
        const storageKey = getGatingKey(targetDate);
        await setItem(storageKey, updated);
        
        // Update state
        set((state) => ({
          gating: { ...state.gating, [targetDate]: updated },
        }));
        
        return true;
      },
      
      // ============================================
      // Clarifier (Ad Unlock)
      // ============================================
      
      canUseClarifier: (dateKey) => {
        const targetDate = dateKey || getLocalDateKey();
        const gating = get().gating[targetDate];
        if (!gating) return true; // Not used yet
        return gating.clarifierUsedCount < DEFAULT_GATING_LIMITS.maxClarifierPerDay;
      },
      
      useClarifier: async (dateKey) => {
        const targetDate = dateKey || getLocalDateKey();
        
        let gating = get().gating[targetDate];
        if (!gating) {
          gating = createDefaultGating(targetDate);
        }
        
        if (gating.clarifierUsedCount >= DEFAULT_GATING_LIMITS.maxClarifierPerDay) {
          return false;
        }
        
        const updated: GatingState = {
          ...gating,
          clarifierUsedCount: gating.clarifierUsedCount + 1,
        };
        
        const storageKey = getGatingKey(targetDate);
        await setItem(storageKey, updated);
        
        set((state) => ({
          gating: { ...state.gating, [targetDate]: updated },
        }));
        
        return true;
      },
      
      // ============================================
      // Another Topic (Ad Unlock)
      // ============================================
      
      canUseAnotherTopic: (dateKey) => {
        const targetDate = dateKey || getLocalDateKey();
        const gating = get().gating[targetDate];
        if (!gating) return true;
        return gating.anotherTopicUsedCount < DEFAULT_GATING_LIMITS.maxAnotherTopicPerDay;
      },
      
      useAnotherTopic: async (dateKey) => {
        const targetDate = dateKey || getLocalDateKey();
        
        let gating = get().gating[targetDate];
        if (!gating) {
          gating = createDefaultGating(targetDate);
        }
        
        if (gating.anotherTopicUsedCount >= DEFAULT_GATING_LIMITS.maxAnotherTopicPerDay) {
          return false;
        }
        
        const updated: GatingState = {
          ...gating,
          anotherTopicUsedCount: gating.anotherTopicUsedCount + 1,
        };
        
        const storageKey = getGatingKey(targetDate);
        await setItem(storageKey, updated);
        
        set((state) => ({
          gating: { ...state.gating, [targetDate]: updated },
        }));
        
        return true;
      },
      
      // ============================================
      // Ad Cooldown (2.5 seconds)
      // ============================================
      
      canShowAd: () => {
        const today = getLocalDateKey();
        const gating = get().gating[today];
        if (!gating) return true;
        
        const now = Date.now();
        const elapsed = now - gating.lastAdTimestamp;
        return elapsed >= DEFAULT_GATING_LIMITS.adCooldownMs;
      },
      
      markAdShown: () => {
        const today = getLocalDateKey();
        let gating = get().gating[today];
        if (!gating) {
          gating = createDefaultGating(today);
        }
        
        const updated: GatingState = {
          ...gating,
          lastAdTimestamp: Date.now(),
        };
        
        set((state) => ({
          gating: { ...state.gating, [today]: updated },
        }));
        
        // Also persist
        const storageKey = getGatingKey(today);
        setItem(storageKey, updated);
      },
      
      getAdCooldownRemaining: () => {
        const today = getLocalDateKey();
        const gating = get().gating[today];
        if (!gating) return 0;
        
        const now = Date.now();
        const elapsed = now - gating.lastAdTimestamp;
        const remaining = DEFAULT_GATING_LIMITS.adCooldownMs - elapsed;
        return Math.max(0, remaining);
      },
    }),
    {
      name: 'taro-gating',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        gating: state.gating,
      }),
    }
  )
);

// ============================================
// Selector Hooks
// ============================================

export const useCanDoFreeSpread = () => useGatingStore((state) => state.canDoFreeSpread());
export const useCanUseClarifier = () => useGatingStore((state) => state.canUseClarifier());
export const useCanUseAnotherTopic = () => useGatingStore((state) => state.canUseAnotherTopic());
export const useCanShowAd = () => useGatingStore((state) => state.canShowAd());
export const useIsGatingHydrated = () => useGatingStore((state) => state.isHydrated);
