import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SpreadRecord,
  SpreadTopic,
  SpreadPosition,
  CombinationPattern,
  SpreadCard,
  ClarifierCard,
  TOPIC_MODIFIERS,
  CardOrientation,
} from '../types';
import { getLocalDateKey } from '../utils/date';
import { drawRandomCards, drawRandomCardExcluding } from '../utils/cards';
import { getSpreadsKey, getItem, setItem } from '../utils/storage';

const EMPTY_SPREADS: SpreadRecord[] = [];

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate combination pattern from 3 card orientations
 * U = Upright, R = Reversed
 */
function calculatePattern(orientations: [CardOrientation, CardOrientation, CardOrientation]): CombinationPattern {
  const pattern = orientations
    .map((o) => (o === 'upright' ? 'U' : 'R'))
    .join('') as CombinationPattern;
  return pattern;
}

/**
 * Generate unique spread ID
 */
function generateSpreadId(): string {
  return `spread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Store Interface
// ============================================

interface SpreadState {
  // State
  spreads: Record<string, SpreadRecord[]>; // dateKey -> SpreadRecords[]
  isLoading: boolean;
  isHydrated: boolean;
  
  // Actions
  setHydrated: (hydrated: boolean) => void;
  loadSpreadsForDate: (dateKey: string) => Promise<SpreadRecord[]>;
  createSpread: (topic: SpreadTopic, dateKey?: string) => Promise<SpreadRecord>;
  addClarifier: (dateKey: string, spreadId: string) => Promise<SpreadRecord | null>;
  getSpreadsForDate: (dateKey: string) => SpreadRecord[];
  getSpreadById: (dateKey: string, spreadId: string) => SpreadRecord | null;
  getTodaysSpreads: () => SpreadRecord[];
  getSpreadCountByTopic: (dateKey: string, topic: SpreadTopic) => number;
  getUsedTopicsForDate: (dateKey?: string) => SpreadTopic[];
  getSpreadDates: () => string[];
}

// ============================================
// Store Implementation
// ============================================

export const useSpreadStore = create<SpreadState>()(
  persist(
    (set, get) => ({
      // Initial State
      spreads: {},
      isLoading: false,
      isHydrated: false,
      
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      
      // Load spreads from storage for a date
      loadSpreadsForDate: async (dateKey) => {
        const existing = get().spreads[dateKey];
        if (existing && existing.length > 0) return existing;
        
        const storageKey = getSpreadsKey(dateKey);
        const spreads = await getItem<SpreadRecord[]>(storageKey);
        
        if (spreads && spreads.length > 0) {
          set((state) => ({
            spreads: { ...state.spreads, [dateKey]: spreads },
          }));
          return spreads;
        }
        
        return [];
      },
      
      // Create a new 3-card spread
      createSpread: async (topic, dateKey) => {
        const targetDate = dateKey || getLocalDateKey();
        
        // Draw 3 cards with orientations
        const drawnCards = drawRandomCards(3);
        
        // Create spread cards with positions
        const positions: SpreadPosition[] = ['FLOW', 'INFLUENCE', 'ADVICE'];
        const spreadCards: [SpreadCard, SpreadCard, SpreadCard] = [
          { position: 'FLOW', drawnCard: drawnCards[0] },
          { position: 'INFLUENCE', drawnCard: drawnCards[1] },
          { position: 'ADVICE', drawnCard: drawnCards[2] },
        ];
        
        // Calculate pattern
        const orientations: [CardOrientation, CardOrientation, CardOrientation] = [
          drawnCards[0].orientation,
          drawnCards[1].orientation,
          drawnCards[2].orientation,
        ];
        const pattern = calculatePattern(orientations);
        
        // Get topic modifier
        const modifier = TOPIC_MODIFIERS[topic];
        
        // Create spread record
        const newSpread: SpreadRecord = {
          id: generateSpreadId(),
          dateKey: targetDate,
          topic,
          cards: spreadCards,
          pattern,
          modifier,
          createdAt: Date.now(),
        };
        
        // Get existing spreads for date
        const existingSpreads = get().spreads[targetDate] || [];
        const updatedSpreads = [...existingSpreads, newSpread];
        
        // Save to storage
        const storageKey = getSpreadsKey(targetDate);
        await setItem(storageKey, updatedSpreads);
        
        // Update state
        set((state) => ({
          spreads: { ...state.spreads, [targetDate]: updatedSpreads },
        }));
        
        return newSpread;
      },
      
      // Add clarifier card to existing spread
      addClarifier: async (dateKey, spreadId) => {
        const spreads = get().spreads[dateKey];
        if (!spreads) return null;
        
        const spreadIndex = spreads.findIndex((s) => s.id === spreadId);
        if (spreadIndex === -1) return null;
        
        const spread = spreads[spreadIndex];
        if (spread.clarifier) {
          // Already has clarifier
          return spread;
        }
        
        const existingCardIds = spread.cards.map(c => c.drawnCard.card.id);
        const clarifierDrawn = drawRandomCardExcluding(existingCardIds);
        const clarifier: ClarifierCard = {
          drawnCard: clarifierDrawn,
          unlockedAt: Date.now(),
        };
        
        // Update spread
        const updatedSpread: SpreadRecord = {
          ...spread,
          clarifier,
        };
        
        const updatedSpreads = [...spreads];
        updatedSpreads[spreadIndex] = updatedSpread;
        
        // Save to storage
        const storageKey = getSpreadsKey(dateKey);
        await setItem(storageKey, updatedSpreads);
        
        // Update state
        set((state) => ({
          spreads: { ...state.spreads, [dateKey]: updatedSpreads },
        }));
        
        return updatedSpread;
      },
      
      // Get spreads for a specific date
      getSpreadsForDate: (dateKey) => {
        return get().spreads[dateKey] || EMPTY_SPREADS;
      },
      
      // Get specific spread by ID
      getSpreadById: (dateKey, spreadId) => {
        const spreads = get().spreads[dateKey];
        if (!spreads) return null;
        return spreads.find((s) => s.id === spreadId) || null;
      },
      
      // Get today's spreads
      getTodaysSpreads: () => {
        const today = getLocalDateKey();
        return get().spreads[today] || EMPTY_SPREADS;
      },
      
      // Count spreads by topic for a date
      getSpreadCountByTopic: (dateKey, topic) => {
        const spreads = get().spreads[dateKey] || EMPTY_SPREADS;
        return spreads.filter((s) => s.topic === topic).length;
      },
      
      // Get unique topics used for a date
      getUsedTopicsForDate: (dateKey) => {
        const targetDate = dateKey || getLocalDateKey();
        const spreads = get().spreads[targetDate] || EMPTY_SPREADS;
        const usedTopics = new Set(spreads.map((s) => s.topic));
        return Array.from(usedTopics) as SpreadTopic[];
      },
      
      // Get all dates that have spreads
      getSpreadDates: () => {
        const spreads = get().spreads;
        return Object.keys(spreads).filter((dateKey) => spreads[dateKey].length > 0);
      },
    }),
    {
      name: 'taro-spreads',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        spreads: state.spreads,
      }),
    }
  )
);

// ============================================
// Selector Hooks
// ============================================

export const useTodaysSpreads = () => useSpreadStore((state) => state.getTodaysSpreads());
export const useIsSpreadHydrated = () => useSpreadStore((state) => state.isHydrated);

// ============================================
// Pattern Interpretation Helpers
// ============================================

/**
 * Get pattern hint translation keys
 */
export function getPatternHintKeys(pattern: CombinationPattern): {
  toneKey: string;
  outputStyleKey: string;
} {
  return {
    toneKey: `spreadResult.patterns.${pattern}.tone`,
    outputStyleKey: `spreadResult.patterns.${pattern}.outputStyle`,
  };
}

/**
 * Check if clarifier should be suggested
 * Per spec: Show if P3 reversed OR total reversed >= 2
 */
export function shouldSuggestClarifier(spread: SpreadRecord): boolean {
  // P3 (ADVICE) is reversed
  const adviceReversed = spread.cards[2].drawnCard.orientation === 'reversed';
  
  // Count total reversed
  const totalReversed = spread.cards.filter(
    (c) => c.drawnCard.orientation === 'reversed'
  ).length;
  
  return adviceReversed || totalReversed >= 2;
}
