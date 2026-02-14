import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyDraw, Reflection, ReflectionAccuracy } from '../types';
import { getLocalDateKey, getMonthKey } from '../utils/date';
import { drawRandomCard } from '../utils/cards';
import { getDrawKey, getAllDrawKeys, getItem, setItem, removeItem } from '../utils/storage';

const PENDING_DRAW_KEY = 'taro-pending-draw';

// ============================================
// Store Interface
// ============================================

interface DrawState {
  // State
  draws: Record<string, DailyDraw>; // dateKey -> DailyDraw
  pendingDraw: DailyDraw | null;
  isLoading: boolean;
  isHydrated: boolean;
  
  // Actions
  setHydrated: (hydrated: boolean) => void;
  loadDraw: (dateKey: string) => Promise<DailyDraw | null>;
  loadDrawsForMonth: (monthKey: string) => Promise<void>;
  getTodaysDraw: () => DailyDraw | null;
  hasDrawnToday: () => boolean;
  hasPendingDrawToday: () => boolean;
  createDraw: (dateKey?: string) => Promise<DailyDraw>;
  prepareDraw: (dateKey?: string) => Promise<DailyDraw>;
  confirmDraw: () => Promise<DailyDraw | null>;
  clearPendingDraw: () => Promise<void>;
  addMemo: (dateKey: string, memo: string) => Promise<boolean>;
  getDrawsForMonth: (monthKey: string) => DailyDraw[];
  getDrawDates: () => string[];
  updateReflection: (dateKey: string, accuracy: ReflectionAccuracy, text?: string) => Promise<boolean>;
}

// ============================================
// Store Implementation
// ============================================

export const useDrawStore = create<DrawState>()(
  persist(
    (set, get) => ({
      // Initial State
      draws: {},
      pendingDraw: null,
      isLoading: false,
      isHydrated: false,
      
      // Hydration setter
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      
      // Load a single draw from storage
      loadDraw: async (dateKey) => {
        const existing = get().draws[dateKey];
        if (existing) return existing;
        
        const storageKey = getDrawKey(dateKey);
        const draw = await getItem<DailyDraw>(storageKey);
        
        if (draw) {
          set((state) => ({
            draws: { ...state.draws, [dateKey]: draw },
          }));
        }
        
        return draw;
      },
      
      // Load all draws for a month
      loadDrawsForMonth: async (monthKey) => {
        set({ isLoading: true });
        
        try {
          const allKeys = await getAllDrawKeys();
          const monthDraws: Record<string, DailyDraw> = {};
          
          for (const key of allKeys) {
            const dateKey = key.replace('draw:', '');
            if (dateKey.startsWith(monthKey)) {
              const draw = await getItem<DailyDraw>(key);
              if (draw) {
                monthDraws[dateKey] = draw;
              }
            }
          }
          
          set((state) => ({
            draws: { ...state.draws, ...monthDraws },
            isLoading: false,
          }));
        } catch {
          set({ isLoading: false });
        }
      },
      
      // Get today's confirmed draw only
      getTodaysDraw: () => {
        const today = getLocalDateKey();
        return get().draws[today] || null;
      },
      
      // Check if already drawn and confirmed today
      hasDrawnToday: () => {
        const today = getLocalDateKey();
        return !!get().draws[today];
      },
      
      // Check if there's a pending (unrevealed) draw for today
      hasPendingDrawToday: () => {
        const today = getLocalDateKey();
        const pending = get().pendingDraw;
        return !!(pending && pending.dateKey === today);
      },
      
      // Create a new draw (returns existing if already drawn) - used by SpreadScreen
      createDraw: async (dateKey) => {
        const targetDate = dateKey || getLocalDateKey();
        
        const existing = get().draws[targetDate];
        if (existing) {
          return existing;
        }
        
        const storageKey = getDrawKey(targetDate);
        const fromStorage = await getItem<DailyDraw>(storageKey);
        if (fromStorage) {
          set((state) => ({
            draws: { ...state.draws, [targetDate]: fromStorage },
          }));
          return fromStorage;
        }
        
        const drawnCard = drawRandomCard();
        const newDraw: DailyDraw = {
          dateKey: targetDate,
          drawnCard,
          createdAt: Date.now(),
        };
        
        await setItem(storageKey, newDraw);
        
        set((state) => ({
          draws: { ...state.draws, [targetDate]: newDraw },
        }));
        
        return newDraw;
      },
      
      // Prepare draw without persisting (for DailyScreen)
      prepareDraw: async (dateKey) => {
        const targetDate = dateKey || getLocalDateKey();
        
        const existing = get().draws[targetDate];
        if (existing) {
          return existing;
        }
        
        const storageKey = getDrawKey(targetDate);
        const fromStorage = await getItem<DailyDraw>(storageKey);
        if (fromStorage) {
          set((state) => ({
            draws: { ...state.draws, [targetDate]: fromStorage },
          }));
          return fromStorage;
        }
        
        const pending = get().pendingDraw;
        if (pending && pending.dateKey === targetDate) {
          return pending;
        }
        
        const drawnCard = drawRandomCard();
        const newDraw: DailyDraw = {
          dateKey: targetDate,
          drawnCard,
          createdAt: Date.now(),
        };
        
        await setItem(PENDING_DRAW_KEY, newDraw);
        set({ pendingDraw: newDraw });
        
        return newDraw;
      },
      
      // Confirm pending draw (persist to main storage)
      confirmDraw: async () => {
        const pending = get().pendingDraw;
        if (!pending) return null;
        
        const storageKey = getDrawKey(pending.dateKey);
        await setItem(storageKey, pending);
        await removeItem(PENDING_DRAW_KEY);
        
        set((state) => ({
          draws: { ...state.draws, [pending.dateKey]: pending },
          pendingDraw: null,
        }));
        
        return pending;
      },
      
      // Clear pending draw without saving
      clearPendingDraw: async () => {
        await removeItem(PENDING_DRAW_KEY);
        set({ pendingDraw: null });
      },
      
      // Add memo to existing draw
      addMemo: async (dateKey, memo) => {
        const draw = get().draws[dateKey];
        if (!draw) return false;
        
        const updatedDraw: DailyDraw = {
          ...draw,
          memo: memo.trim() || undefined,
        };
        
        // Save to storage
        const storageKey = getDrawKey(dateKey);
        const saved = await setItem(storageKey, updatedDraw);
        
        if (saved) {
          set((state) => ({
            draws: { ...state.draws, [dateKey]: updatedDraw },
          }));
        }
        
        return saved;
      },
      
      // Get all draws for a specific month
      getDrawsForMonth: (monthKey) => {
        const draws = get().draws;
        return Object.values(draws).filter((draw) =>
          draw.dateKey.startsWith(monthKey)
        );
      },
      
      // Get all dates that have draws
      getDrawDates: () => {
        return Object.keys(get().draws);
      },
      
      updateReflection: async (dateKey, accuracy, text) => {
        const draw = get().draws[dateKey];
        if (!draw) return false;
        
        const reflection: Reflection = {
          accuracy,
          text: text?.trim(),
          createdAt: Date.now(),
        };
        
        const updatedDraw: DailyDraw = {
          ...draw,
          reflection,
        };
        
        const storageKey = getDrawKey(dateKey);
        const saved = await setItem(storageKey, updatedDraw);
        
        if (saved) {
          set((state) => ({
            draws: { ...state.draws, [dateKey]: updatedDraw },
          }));
        }
        
        return saved;
      },
    }),
    {
      name: 'taro-draws',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => async (state) => {
        if (state) {
          const pending = await getItem<DailyDraw>(PENDING_DRAW_KEY);
          if (pending) {
            useDrawStore.setState({ pendingDraw: pending });
          }
          state.setHydrated(true);
        }
      },
      partialize: (state) => ({
        draws: state.draws,
      }),
    }
  )
);

// ============================================
// Selector Hooks (for performance)
// ============================================

export const useHasDrawnToday = () => useDrawStore((state) => state.hasDrawnToday());
export const useTodaysDraw = () => useDrawStore((state) => state.getTodaysDraw());
export const useIsDrawHydrated = () => useDrawStore((state) => state.isHydrated);
