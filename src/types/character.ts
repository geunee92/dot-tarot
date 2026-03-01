export type EvolutionStage = 'apprentice' | 'journeyman' | 'adept' | 'master' | 'grandmaster';
export type CharacterAnimationState = 'idle' | 'reading' | 'happy' | 'tired' | 'levelup' | 'eating' | 'petted' | 'sad' | 'hungry' | 'sleeping';
export type XPSource = 'daily_training' | 'quest_completion' | 'advanced_quest' | 'training_journal' | 'streak_bonus' | 'mini_game';

export interface StreakInfo {
  currentStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  longestStreak: number;
}

export interface XPEvent {
  source: XPSource;
  amount: number;
  bonusAmount: number; // streak bonus
  totalAmount: number; // amount + bonusAmount
  timestamp: number;
}

export interface CharacterState {
  level: number;
  currentXP: number;
  totalXP: number;
  streak: StreakInfo;
  createdAt: number;
}
