import { EvolutionStage } from '../types/character';
import { SpreadTopic } from '../types/spread';

// ============================================
// XP Configuration (All values easily tunable)
// ============================================

export const XP_CONFIG = {
  BASE_XP_PER_LEVEL: 100,
  LEVEL_EXPONENT: 1.5,
  MAX_LEVEL: 30,

  // XP rewards per action
  DAILY_TRAINING_XP: 30,
  QUEST_COMPLETION_XP: 50,
  ADVANCED_QUEST_XP: 80,
  TRAINING_JOURNAL_XP: 20,

  // Streak multiplier
  STREAK_BONUS_PER_DAY: 0.1,
  STREAK_BONUS_CAP: 0.5,
} as const;

// ============================================
// Level Unlock Table
// ============================================

export const UNLOCK_TABLE: Record<string, number> = {
  GENERAL: 1,
  LOVE: 3,
  MONEY: 5,
  WORK: 7,
  DEEP_READING: 10,
} as const;

// ============================================
// Evolution Stages
// ============================================

export interface EvolutionStageDef {
  id: EvolutionStage;
  minLevel: number;
  maxLevel: number;
  nameKo: string;
  nameEn: string;
}

export const EVOLUTION_STAGES: EvolutionStageDef[] = [
  { id: 'apprentice', minLevel: 1, maxLevel: 4, nameKo: '수련생', nameEn: 'Apprentice' },
  { id: 'journeyman', minLevel: 5, maxLevel: 9, nameKo: '여행자', nameEn: 'Journeyman' },
  { id: 'adept', minLevel: 10, maxLevel: 14, nameKo: '숙련자', nameEn: 'Adept' },
  { id: 'master', minLevel: 15, maxLevel: 24, nameKo: '달인', nameEn: 'Master' },
  { id: 'grandmaster', minLevel: 25, maxLevel: 30, nameKo: '대현자', nameEn: 'Grandmaster' },
];

// ============================================
// Helper Functions (Pure, testable)
// ============================================

/** Calculate XP needed to go from level N to level N+1 */
export function getXPForLevel(level: number): number {
  return Math.floor(XP_CONFIG.BASE_XP_PER_LEVEL * Math.pow(level, XP_CONFIG.LEVEL_EXPONENT));
}

/** Calculate total cumulative XP needed to reach a given level */
export function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

/** Get the evolution stage for a given level */
export function getEvolutionStage(level: number): EvolutionStage {
  for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
    if (level >= EVOLUTION_STAGES[i].minLevel) {
      return EVOLUTION_STAGES[i].id;
    }
  }
  return 'apprentice';
}

/** Get evolution stage definition for a given level */
export function getEvolutionStageDef(level: number): EvolutionStageDef {
  for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
    if (level >= EVOLUTION_STAGES[i].minLevel) {
      return EVOLUTION_STAGES[i];
    }
  }
  return EVOLUTION_STAGES[0];
}

/** Calculate streak multiplier (0.0 to STREAK_BONUS_CAP) */
export function getStreakMultiplier(streak: number): number {
  if (streak <= 0) return 0;
  return Math.min(
    streak * XP_CONFIG.STREAK_BONUS_PER_DAY,
    XP_CONFIG.STREAK_BONUS_CAP
  );
}

/** Calculate XP with streak bonus applied */
export function calculateXPWithBonus(baseXP: number, streak: number): { amount: number; bonus: number; total: number } {
  const multiplier = getStreakMultiplier(streak);
  const bonus = Math.floor(baseXP * multiplier);
  return {
    amount: baseXP,
    bonus,
    total: baseXP + bonus,
  };
}

/** Check if a topic is unlocked at a given level */
export function isTopicUnlocked(topic: SpreadTopic, level: number): boolean {
  const required = UNLOCK_TABLE[topic];
  if (required === undefined) return false;
  return level >= required;
}

/** Check if deep reading is unlocked at a given level */
export function isDeepReadingUnlocked(level: number): boolean {
  return level >= UNLOCK_TABLE.DEEP_READING;
}

/** Get list of features that unlock at a specific level */
export function getUnlocksAtLevel(level: number): string[] {
  const unlocks: string[] = [];
  for (const [key, requiredLevel] of Object.entries(UNLOCK_TABLE)) {
    if (requiredLevel === level) {
      unlocks.push(key);
    }
  }
  // Check evolution stage change
  const stage = getEvolutionStageDef(level);
  if (stage.minLevel === level) {
    unlocks.push(`EVOLUTION_${stage.id.toUpperCase()}`);
  }
  return unlocks;
}

/** Get the next level that unlocks something */
export function getNextUnlockLevel(currentLevel: number): number | null {
  const levels = Object.values(UNLOCK_TABLE).filter(l => l > currentLevel);
  // Also check evolution stages
  for (const stage of EVOLUTION_STAGES) {
    if (stage.minLevel > currentLevel) {
      levels.push(stage.minLevel);
    }
  }
  if (levels.length === 0) return null;
  return Math.min(...levels);
}
