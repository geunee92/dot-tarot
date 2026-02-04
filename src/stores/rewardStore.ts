import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RewardsState, REWARD_MILESTONES, BackSkin } from '../types';
import { BACK_SKINS, getDefaultSkin, getSkinById } from '../data';
import { getRewardsKey, setItem } from '../utils/storage';
import { getMonthKey, countAttendanceInMonth } from '../utils/date';

// ============================================
// Store Interface
// ============================================

interface RewardStoreState {
  // State
  unlockedSkins: string[]; // skin IDs
  selectedSkinId: string;
  isHydrated: boolean;
  
  // Computed/derived
  lastUnlockNotification: string | null; // skin ID to show in toast
  
  // Actions
  setHydrated: (hydrated: boolean) => void;
  getSelectedSkin: () => BackSkin;
  selectSkin: (skinId: string) => Promise<boolean>;
  isUnlocked: (skinId: string) => boolean;
  getUnlockedSkins: () => BackSkin[];
  getLockedSkins: () => BackSkin[];
  
  // Attendance & Rewards
  checkAndUnlockRewards: (drawDates: string[]) => Promise<string | null>;
  clearUnlockNotification: () => void;
  
  // Helpers
  getAttendanceForMonth: (drawDates: string[], monthKey?: string) => number;
  getNextMilestone: (attendanceDays: number) => { days: number; skinId: string } | null;
}

// ============================================
// Store Implementation
// ============================================

export const useRewardStore = create<RewardStoreState>()(
  persist(
    (set, get) => ({
      // Initial State
      unlockedSkins: ['skin_default'], // Default skin always unlocked
      selectedSkinId: 'skin_default',
      isHydrated: false,
      lastUnlockNotification: null,
      
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      
      // Get currently selected skin
      getSelectedSkin: () => {
        const { selectedSkinId } = get();
        const skin = getSkinById(selectedSkinId);
        return skin || getDefaultSkin();
      },
      
      // Select a skin (must be unlocked)
      selectSkin: async (skinId) => {
        const { unlockedSkins } = get();
        
        if (!unlockedSkins.includes(skinId)) {
          return false; // Not unlocked
        }
        
        set({ selectedSkinId: skinId });
        
        // Persist
        const storageKey = getRewardsKey();
        await setItem<RewardsState>(storageKey, {
          unlockedSkins: get().unlockedSkins,
          selectedSkinId: skinId,
        });
        
        return true;
      },
      
      // Check if a skin is unlocked
      isUnlocked: (skinId) => {
        return get().unlockedSkins.includes(skinId);
      },
      
      // Get all unlocked skins
      getUnlockedSkins: () => {
        const { unlockedSkins } = get();
        return BACK_SKINS.filter((skin) => unlockedSkins.includes(skin.id));
      },
      
      // Get all locked skins
      getLockedSkins: () => {
        const { unlockedSkins } = get();
        return BACK_SKINS.filter((skin) => !unlockedSkins.includes(skin.id));
      },
      
      // Calculate attendance for current month
      getAttendanceForMonth: (drawDates, monthKey) => {
        const targetMonth = monthKey || getMonthKey();
        return countAttendanceInMonth(drawDates, targetMonth);
      },
      
      // Get next milestone to achieve
      getNextMilestone: (attendanceDays) => {
        const { unlockedSkins } = get();
        
        for (const milestone of REWARD_MILESTONES) {
          if (attendanceDays < milestone.days && !unlockedSkins.includes(milestone.skinId)) {
            return milestone;
          }
        }
        
        return null; // All milestones achieved
      },
      
      // Check attendance and unlock rewards
      // Returns newly unlocked skin ID or null
      // Uses TOTAL cumulative attendance (all-time), not per-month
      checkAndUnlockRewards: async (drawDates) => {
        const { unlockedSkins } = get();
        const attendanceDays = drawDates.length;
        
        let newlyUnlocked: string | null = null;
        const updatedUnlocked = [...unlockedSkins];
        
        // Check each milestone
        for (const milestone of REWARD_MILESTONES) {
          if (
            attendanceDays >= milestone.days &&
            !unlockedSkins.includes(milestone.skinId)
          ) {
            updatedUnlocked.push(milestone.skinId);
            newlyUnlocked = milestone.skinId; // Track most recent unlock
          }
        }
        
        // If any new unlocks, save
        if (updatedUnlocked.length > unlockedSkins.length) {
          set({
            unlockedSkins: updatedUnlocked,
            lastUnlockNotification: newlyUnlocked,
          });
          
          // Persist
          const storageKey = getRewardsKey();
          await setItem<RewardsState>(storageKey, {
            unlockedSkins: updatedUnlocked,
            selectedSkinId: get().selectedSkinId,
          });
        }
        
        return newlyUnlocked;
      },
      
      // Clear the unlock notification (after showing toast)
      clearUnlockNotification: () => {
        set({ lastUnlockNotification: null });
      },
    }),
    {
      name: 'taro-rewards',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        unlockedSkins: state.unlockedSkins,
        selectedSkinId: state.selectedSkinId,
      }),
    }
  )
);

// ============================================
// Selector Hooks
// ============================================

export const useSelectedSkin = () => useRewardStore((state) => state.getSelectedSkin());
export const useUnlockedSkins = () => useRewardStore((state) => state.getUnlockedSkins());
export const useLockedSkins = () => useRewardStore((state) => state.getLockedSkins());
export const useLastUnlockNotification = () => useRewardStore((state) => state.lastUnlockNotification);
export const useIsRewardHydrated = () => useRewardStore((state) => state.isHydrated);

// ============================================
// Progress Helpers
// ============================================

/**
 * Calculate progress to next milestone
 */
export function getMilestoneProgress(
  attendanceDays: number,
  nextMilestone: { days: number; skinId: string } | null
): { current: number; target: number; percentage: number } {
  if (!nextMilestone) {
    return { current: attendanceDays, target: attendanceDays, percentage: 100 };
  }
  
  const percentage = Math.min(100, Math.round((attendanceDays / nextMilestone.days) * 100));
  return {
    current: attendanceDays,
    target: nextMilestone.days,
    percentage,
  };
}

/**
 * Format milestone text for display
 */
export function formatMilestoneText(days: number): string {
  if (days === 7) return '7 days';
  if (days === 14) return '14 days';
  if (days === 21) return '21 days';
  if (days === 28) return '28 days';
  return `${days} days`;
}
