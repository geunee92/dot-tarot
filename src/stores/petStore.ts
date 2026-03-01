import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PetStats, PetCooldowns, FeedResult, PetResult } from '../types/pet';
import {
  PET_CONFIG,
  clampStat,
  calculateDecay,
  canDoTarot,
  getRandomFeedGain,
} from '../config/pet';
import { getLocalDateKey } from '../utils/date';

const createInitialStats = (): PetStats => ({
  hunger: 80,
  mood: 80,
  lastUpdated: Date.now(),
});

const createInitialCooldowns = (): PetCooldowns => ({
  lastFed: 0,
  lastPetted: 0,
  lastMiniGame: 0,
  miniGameCountToday: 0,
  miniGameDateKey: '',
});

interface PetStoreState {
  stats: PetStats;
  cooldowns: PetCooldowns;
  isHydrated: boolean;

  setHydrated: (hydrated: boolean) => void;

  // Decay
  applyDecay: () => void;

  // Interactions
  feed: () => FeedResult | null;
  pet: () => PetResult | null;
  completeMiniGame: () => void;

  // Cooldown checks
  canFeed: () => boolean;
  canPet: () => boolean;
  canPlayMiniGame: () => boolean;
  getFeedCooldownRemaining: () => number;
  getPetCooldownRemaining: () => number;
  getMiniGameCooldownRemaining: () => number;
  getMiniGameRemainingCount: () => number;

  // Tarot gating
  canDoTarot: () => boolean;
  getTarotBlockReason: () => 'hunger' | 'mood' | null;

  // Getters
  getHunger: () => number;
  getMood: () => number;

  // Reset
  resetPet: () => void;
}

export const usePetStore = create<PetStoreState>()(
  persist(
    (set, get) => ({
      stats: createInitialStats(),
      cooldowns: createInitialCooldowns(),
      isHydrated: false,

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),

      applyDecay: () => {
        const { stats } = get();
        const now = Date.now();
        const decayed = calculateDecay(stats, now);

        set({
          stats: {
            hunger: decayed.hunger,
            mood: decayed.mood,
            lastUpdated: now,
          },
        });
      },

      feed: () => {
        const state = get();
        const now = Date.now();

        // Check cooldown
        if (now - state.cooldowns.lastFed < PET_CONFIG.FEED_COOLDOWN_MS) {
          return null;
        }

        const gain = getRandomFeedGain();
        const newHunger = clampStat(state.stats.hunger + gain);
        const actualGain = newHunger - state.stats.hunger;

        set({
          stats: {
            ...state.stats,
            hunger: newHunger,
            lastUpdated: now,
          },
          cooldowns: {
            ...state.cooldowns,
            lastFed: now,
          },
        });

        return {
          hungerGain: actualGain,
          newHunger,
        };
      },

      pet: () => {
        const state = get();
        const now = Date.now();

        // Check cooldown
        if (now - state.cooldowns.lastPetted < PET_CONFIG.PET_COOLDOWN_MS) {
          return null;
        }

        const gain = PET_CONFIG.PET_GAIN;
        const newMood = clampStat(state.stats.mood + gain);
        const actualGain = newMood - state.stats.mood;

        set({
          stats: {
            ...state.stats,
            mood: newMood,
            lastUpdated: now,
          },
          cooldowns: {
            ...state.cooldowns,
            lastPetted: now,
          },
        });

        return {
          moodGain: actualGain,
          newMood,
        };
      },

      completeMiniGame: () => {
        const state = get();
        const now = Date.now();
        const todayKey = getLocalDateKey();

        const newMood = clampStat(state.stats.mood + PET_CONFIG.MINI_GAME_MOOD_GAIN);

        // Reset daily count if different day
        const count = state.cooldowns.miniGameDateKey === todayKey
          ? state.cooldowns.miniGameCountToday + 1
          : 1;

        set({
          stats: {
            ...state.stats,
            mood: newMood,
            lastUpdated: now,
          },
          cooldowns: {
            ...state.cooldowns,
            lastMiniGame: now,
            miniGameCountToday: count,
            miniGameDateKey: todayKey,
          },
        });
      },

      canFeed: () => {
        const { cooldowns } = get();
        return Date.now() - cooldowns.lastFed >= PET_CONFIG.FEED_COOLDOWN_MS;
      },

      canPet: () => {
        const { cooldowns } = get();
        return Date.now() - cooldowns.lastPetted >= PET_CONFIG.PET_COOLDOWN_MS;
      },

      canPlayMiniGame: () => {
        const { cooldowns } = get();
        const now = Date.now();
        const todayKey = getLocalDateKey();

        // Check daily limit
        const todayCount = cooldowns.miniGameDateKey === todayKey
          ? cooldowns.miniGameCountToday
          : 0;
        if (todayCount >= PET_CONFIG.MINI_GAME_MAX_PER_DAY) return false;

        // Check cooldown
        if (now - cooldowns.lastMiniGame < PET_CONFIG.MINI_GAME_COOLDOWN_MS) return false;

        return true;
      },

      getFeedCooldownRemaining: () => {
        const { cooldowns } = get();
        const remaining = PET_CONFIG.FEED_COOLDOWN_MS - (Date.now() - cooldowns.lastFed);
        return Math.max(0, remaining);
      },

      getPetCooldownRemaining: () => {
        const { cooldowns } = get();
        const remaining = PET_CONFIG.PET_COOLDOWN_MS - (Date.now() - cooldowns.lastPetted);
        return Math.max(0, remaining);
      },

      getMiniGameCooldownRemaining: () => {
        const { cooldowns } = get();
        const remaining = PET_CONFIG.MINI_GAME_COOLDOWN_MS - (Date.now() - cooldowns.lastMiniGame);
        return Math.max(0, remaining);
      },

      getMiniGameRemainingCount: () => {
        const { cooldowns } = get();
        const todayKey = getLocalDateKey();
        const todayCount = cooldowns.miniGameDateKey === todayKey
          ? cooldowns.miniGameCountToday
          : 0;
        return Math.max(0, PET_CONFIG.MINI_GAME_MAX_PER_DAY - todayCount);
      },

      canDoTarot: () => {
        const { stats } = get();
        return canDoTarot(stats.hunger, stats.mood);
      },

      getTarotBlockReason: () => {
        const { stats } = get();
        if (stats.hunger < PET_CONFIG.TAROT_MIN_STAT) return 'hunger';
        if (stats.mood < PET_CONFIG.TAROT_MIN_STAT) return 'mood';
        return null;
      },

      getHunger: () => get().stats.hunger,
      getMood: () => get().stats.mood,

      resetPet: () => {
        const hydrated = get().isHydrated;
        set({
          stats: createInitialStats(),
          cooldowns: createInitialCooldowns(),
          isHydrated: hydrated,
        });
      },
    }),
    {
      name: 'dotoracle-pet',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        stats: state.stats,
        cooldowns: state.cooldowns,
      }),
    }
  )
);

export const useIsPetHydrated = () => usePetStore((s) => s.isHydrated);
export const usePetHunger = () => usePetStore((s) => s.stats.hunger);
export const usePetMood = () => usePetStore((s) => s.stats.mood);
