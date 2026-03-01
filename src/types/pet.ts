// ============================================
// Pet / Tamagotchi System Types
// ============================================

export interface PetStats {
  hunger: number;   // 0-100
  mood: number;     // 0-100
  lastUpdated: number; // timestamp
}

export interface PetCooldowns {
  lastFed: number;        // timestamp
  lastPetted: number;     // timestamp
  lastMiniGame: number;   // timestamp
  miniGameCountToday: number;
  miniGameDateKey: string; // YYYY-MM-DD
}

export interface FeedResult {
  hungerGain: number;
  newHunger: number;
}

export interface PetResult {
  moodGain: number;
  newMood: number;
}

export interface MiniGameCard {
  id: number;
  cardKey: string;
  pairIndex: number;
  isFlipped: boolean;
  isMatched: boolean;
}
