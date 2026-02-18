import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EvolutionStage, SpreadTopic, StreakInfo, XPEvent, XPSource } from '../types';
import {
  XP_CONFIG,
  calculateXPWithBonus,
  getEvolutionStage as getEvolutionStageForLevel,
  getUnlocksAtLevel,
  getXPForLevel,
  isDeepReadingUnlocked,
  isTopicUnlocked,
} from '../config/progression';
import { getLocalDateKey } from '../utils/date';

const TOPICS: SpreadTopic[] = ['GENERAL', 'LOVE', 'MONEY', 'WORK'];
const DAY_MS = 24 * 60 * 60 * 1000;

const createInitialStreak = (): StreakInfo => ({
  currentStreak: 0,
  lastActiveDate: '',
  longestStreak: 0,
});

const createInitialState = () => ({
  level: 1,
  currentXP: 0,
  totalXP: 0,
  streak: createInitialStreak(),
  createdAt: Date.now(),
});

const getDefaultBaseXP = (source: XPSource): number => {
  switch (source) {
    case 'daily_training':
      return XP_CONFIG.DAILY_TRAINING_XP;
    case 'quest_completion':
      return XP_CONFIG.QUEST_COMPLETION_XP;
    case 'advanced_quest':
      return XP_CONFIG.ADVANCED_QUEST_XP;
    case 'training_journal':
      return XP_CONFIG.TRAINING_JOURNAL_XP;
    case 'streak_bonus':
      return 0;
    default:
      return 0;
  }
};

const parseDateKeyToUTC = (dateKey: string): number => {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return NaN;
  return Date.UTC(year, month - 1, day);
};

interface CharacterStoreState {
  level: number;
  currentXP: number;
  totalXP: number;
  streak: StreakInfo;
  createdAt: number;
  isHydrated: boolean;

  setHydrated: (hydrated: boolean) => void;
  addXP: (
    source: XPSource,
    baseAmount?: number
  ) => {
    event: XPEvent;
    leveledUp: boolean;
    newLevel: number;
    unlocks: string[];
  };
  updateStreak: () => void;
  getLevel: () => number;
  getEvolutionStage: () => EvolutionStage;
  getXPProgress: () => { current: number; needed: number; percentage: number };
  canAccessTopic: (topic: SpreadTopic) => boolean;
  canAccessDeepReading: () => boolean;
  getUnlockedTopics: () => SpreadTopic[];
  resetCharacter: () => void;
}

export const useCharacterStore = create<CharacterStoreState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),
      isHydrated: false,

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),

      addXP: (source, baseAmount) => {
        const state = get();
        const now = Date.now();
        const baseXP = baseAmount ?? getDefaultBaseXP(source);
        const xpResult = calculateXPWithBonus(baseXP, state.streak.currentStreak);

        let nextLevel = state.level;
        let nextCurrentXP = state.currentXP + xpResult.total;
        const nextTotalXP = state.totalXP + xpResult.total;
        const unlocks: string[] = [];

        while (
          nextLevel < XP_CONFIG.MAX_LEVEL &&
          nextCurrentXP >= getXPForLevel(nextLevel)
        ) {
          nextCurrentXP -= getXPForLevel(nextLevel);
          nextLevel += 1;
          unlocks.push(...getUnlocksAtLevel(nextLevel));
        }

        const event: XPEvent = {
          source,
          amount: xpResult.amount,
          bonusAmount: xpResult.bonus,
          totalAmount: xpResult.total,
          timestamp: now,
        };

        set({
          level: nextLevel,
          currentXP: nextCurrentXP,
          totalXP: nextTotalXP,
        });

        return {
          event,
          leveledUp: nextLevel > state.level,
          newLevel: nextLevel,
          unlocks,
        };
      },

      updateStreak: () => {
        const state = get();
        const today = getLocalDateKey();
        const last = state.streak.lastActiveDate;

        if (last === today) {
          return;
        }

        let nextCurrentStreak = 1;
        let nextLongestStreak = state.streak.longestStreak;

        if (last) {
          const lastUTC = parseDateKeyToUTC(last);
          const todayUTC = parseDateKeyToUTC(today);
          const diffDays = Number.isNaN(lastUTC) || Number.isNaN(todayUTC)
            ? 0
            : Math.floor((todayUTC - lastUTC) / DAY_MS);

          if (diffDays === 1) {
            nextCurrentStreak = state.streak.currentStreak + 1;
          }
        }

        nextLongestStreak = Math.max(nextLongestStreak, nextCurrentStreak);

        set({
          streak: {
            currentStreak: nextCurrentStreak,
            lastActiveDate: today,
            longestStreak: nextLongestStreak,
          },
        });
      },

      getLevel: () => get().level,

      getEvolutionStage: () => getEvolutionStageForLevel(get().level),

      getXPProgress: () => {
        const state = get();
        const needed = getXPForLevel(state.level);
        return {
          current: state.currentXP,
          needed,
          percentage: needed > 0 ? state.currentXP / needed : 0,
        };
      },

      canAccessTopic: (topic) => isTopicUnlocked(topic, get().level),

      canAccessDeepReading: () => isDeepReadingUnlocked(get().level),

      getUnlockedTopics: () => {
        const level = get().level;
        return TOPICS.filter((topic) => isTopicUnlocked(topic, level));
      },

      resetCharacter: () => {
        const hydrated = get().isHydrated;
        set({
          ...createInitialState(),
          isHydrated: hydrated,
        });
      },
    }),
    {
      name: 'dotoracle-character',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        level: state.level,
        currentXP: state.currentXP,
        totalXP: state.totalXP,
        streak: state.streak,
        createdAt: state.createdAt,
      }),
    }
  )
);

export const useCharacterLevel = () => useCharacterStore((s) => s.level);
export const useCharacterStreak = () => useCharacterStore((s) => s.streak);
export const useIsCharacterHydrated = () => useCharacterStore((s) => s.isHydrated);
