import { PetStats } from '../types/pet';

// ============================================
// Pet Configuration (All values easily tunable)
// ============================================

export const PET_CONFIG = {
  // Stat bounds
  MIN_STAT: 0,
  MAX_STAT: 100,

  // Decay rates (per hour)
  HUNGER_DECAY_PER_HOUR: 4,
  MOOD_DECAY_PER_HOUR: 2,
  MOOD_HUNGRY_MULTIPLIER: 1.5, // mood decays 1.5x faster when hungry

  // Hunger threshold for mood multiplier
  HUNGER_LOW_THRESHOLD: 30,

  // Max hours of decay to apply (cap offline time)
  MAX_DECAY_HOURS: 48,

  // Interaction gains
  FEED_GAIN_MIN: 30,
  FEED_GAIN_MAX: 50,
  PET_GAIN: 10,
  MINI_GAME_MOOD_GAIN: 25,

  // Cooldowns (milliseconds)
  FEED_COOLDOWN_MS: 30 * 60 * 1000,     // 30 minutes
  PET_COOLDOWN_MS: 1 * 60 * 1000,       // 1 minute
  MINI_GAME_COOLDOWN_MS: 4 * 60 * 60 * 1000, // 4 hours

  // Mini game limits
  MINI_GAME_MAX_PER_DAY: 3,

  // Tarot gating threshold
  TAROT_MIN_STAT: 20,

  // Mini game XP reward
  MINI_GAME_XP: 15,
} as const;

// ============================================
// Helper Functions (Pure, testable)
// ============================================

/** Clamp a stat value between MIN_STAT and MAX_STAT */
export function clampStat(value: number): number {
  return Math.max(PET_CONFIG.MIN_STAT, Math.min(PET_CONFIG.MAX_STAT, value));
}

/** Calculate decay for both stats based on elapsed time */
export function calculateDecay(
  stats: PetStats,
  now: number
): { hunger: number; mood: number } {
  const elapsed = now - stats.lastUpdated;
  if (elapsed <= 0) {
    return { hunger: stats.hunger, mood: stats.mood };
  }

  const hours = Math.min(elapsed / (1000 * 60 * 60), PET_CONFIG.MAX_DECAY_HOURS);

  const hungerDecay = hours * PET_CONFIG.HUNGER_DECAY_PER_HOUR;
  const newHunger = clampStat(stats.hunger - hungerDecay);

  // Mood decays faster when hungry
  const isHungry = newHunger < PET_CONFIG.HUNGER_LOW_THRESHOLD;
  const moodDecayRate = isHungry
    ? PET_CONFIG.MOOD_DECAY_PER_HOUR * PET_CONFIG.MOOD_HUNGRY_MULTIPLIER
    : PET_CONFIG.MOOD_DECAY_PER_HOUR;
  const moodDecay = hours * moodDecayRate;
  const newMood = clampStat(stats.mood - moodDecay);

  return { hunger: newHunger, mood: newMood };
}

/** Check if tarot is available based on current stats */
export function canDoTarot(hunger: number, mood: number): boolean {
  return hunger >= PET_CONFIG.TAROT_MIN_STAT && mood >= PET_CONFIG.TAROT_MIN_STAT;
}

/** Get a random feed gain between min and max */
export function getRandomFeedGain(): number {
  return Math.floor(
    Math.random() * (PET_CONFIG.FEED_GAIN_MAX - PET_CONFIG.FEED_GAIN_MIN + 1)
  ) + PET_CONFIG.FEED_GAIN_MIN;
}

/** Get stat color based on value */
export function getStatColor(value: number): string {
  if (value >= 60) return '#4ade80'; // green
  if (value >= 40) return '#fbbf24'; // yellow
  if (value >= 20) return '#f97316'; // orange
  return '#ef4444'; // red
}
