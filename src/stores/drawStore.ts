import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyDraw } from '../types';
import { getLocalDateKey, getMonthKey } from '../utils/date';
import { drawRandomCard } from '../utils/cards';
import { getDrawKey, getAllDrawKeys, getItem, setItem } from '../utils/storage';

// ============================================
// Store Interface
// ============================================

interface DrawState {
  // State
  draws: Record<string, DailyDraw>; // dateKey -> DailyDraw
  isLoading: boolean;
  isHydrated: boolean;
  
  // Actions
  setHydrated: (hydrated: boolean) => void;
  loadDraw: (dateKey: string) => Promise<DailyDraw | null>;
  loadDrawsForMonth: (monthKey: string) => Promise<void>;
  getTodaysDraw: () => DailyDraw | null;
  hasDrawnToday: () => boolean;
  createDraw: (dateKey?: string) => Promise<DailyDraw>;
  addMemo: (dateKey: string, memo: string) => Promise<boolean>;
  getDrawsForMonth: (monthKey: string) => DailyDraw[];
  getDrawDates: () => string[];
}

// ============================================
// Store Implementation
// ============================================

export const useDrawStore = create<DrawState>()(
  persist(
    (set, get) => ({
      // Initial State
      draws: {},
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
        } catch (error) {
          console.error('[DrawStore] Error loading month draws:', error);
          set({ isLoading: false });
        }
      },
      
      // Get today's draw (if exists)
      getTodaysDraw: () => {
        const today = getLocalDateKey();
        return get().draws[today] || null;
      },
      
      // Check if already drawn today
      hasDrawnToday: () => {
        const today = getLocalDateKey();
        return !!get().draws[today];
      },
      
      // Create a new draw (returns existing if already drawn)
      createDraw: async (dateKey) => {
        const targetDate = dateKey || getLocalDateKey();
        
        // Check if already exists
        const existing = get().draws[targetDate];
        if (existing) {
          return existing;
        }
        
        // Check storage as well
        const storageKey = getDrawKey(targetDate);
        const fromStorage = await getItem<DailyDraw>(storageKey);
        if (fromStorage) {
          set((state) => ({
            draws: { ...state.draws, [targetDate]: fromStorage },
          }));
          return fromStorage;
        }
        
        // Create new draw
        const drawnCard = drawRandomCard();
        const newDraw: DailyDraw = {
          dateKey: targetDate,
          drawnCard,
          createdAt: Date.now(),
        };
        
        // Save to storage
        await setItem(storageKey, newDraw);
        
        // Update state
        set((state) => ({
          draws: { ...state.draws, [targetDate]: newDraw },
        }));
        
        return newDraw;
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
    }),
    {
      name: 'taro-draws',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
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
