import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SpreadRecord,
  SpreadTopic,
  SpreadPosition,
  CombinationPattern,
  SpreadCard,
  TOPIC_MODIFIERS,
  CardOrientation,
  FollowUpSpreadCard,
  FollowUp,
  Reflection,
  ReflectionAccuracy,
} from '../types';
import { getLocalDateKey } from '../utils/date';
import { drawRandomCards, drawRandomCardsExcluding } from '../utils/cards';
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
  createSpread: (topic: SpreadTopic, userQuestion?: string, dateKey?: string) => Promise<SpreadRecord>;
  updateInterpretation: (dateKey: string, spreadId: string, interpretation: string) => Promise<SpreadRecord | null>;
  getSpreadsForDate: (dateKey: string) => SpreadRecord[];
  getSpreadById: (dateKey: string, spreadId: string) => SpreadRecord | null;
  getTodaysSpreads: () => SpreadRecord[];
  getSpreadCountByTopic: (dateKey: string, topic: SpreadTopic) => number;
  getUsedTopicsForDate: (dateKey?: string) => SpreadTopic[];
  getSpreadDates: () => string[];
  createFollowUp: (dateKey: string, spreadId: string, userQuestion: string) => Promise<SpreadRecord | null>;
  updateFollowUpInterpretation: (dateKey: string, spreadId: string, interpretation: string) => Promise<SpreadRecord | null>;
  updateSpreadReflection: (dateKey: string, spreadId: string, accuracy: ReflectionAccuracy, text?: string) => Promise<SpreadRecord | null>;
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
      createSpread: async (topic, userQuestion, dateKey) => {
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
          ...(userQuestion && { userQuestion }),
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
      
      // Update AI interpretation for a spread
      updateInterpretation: async (dateKey, spreadId, interpretation) => {
        const spreads = get().spreads[dateKey];
        if (!spreads) return null;
        
        const spreadIndex = spreads.findIndex((s) => s.id === spreadId);
        if (spreadIndex === -1) return null;
        
        const spread = spreads[spreadIndex];
        
        // Update spread with AI interpretation
        const updatedSpread: SpreadRecord = {
          ...spread,
          aiInterpretation: interpretation,
          aiGeneratedAt: Date.now(),
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
      
      // Create a follow-up reading for an existing spread
      createFollowUp: async (dateKey, spreadId, userQuestion) => {
        const spreads = get().spreads[dateKey];
        if (!spreads) return null;
        
        const spreadIndex = spreads.findIndex((s) => s.id === spreadId);
        if (spreadIndex === -1) return null;
        
        const spread = spreads[spreadIndex];
        
        // Only one follow-up allowed per spread
        if (spread.followUp) return null;
        
        // Get IDs of original cards to exclude
        const excludeIds = spread.cards.map((c) => c.drawnCard.card.id);
        
        // Draw 3 new cards excluding originals
        const newCards = drawRandomCardsExcluding(3, excludeIds);
        
        // Build follow-up object
        const followUp: FollowUp = {
          cards: [
            { position: 'DEPTH', drawnCard: newCards[0] },
            { position: 'HIDDEN', drawnCard: newCards[1] },
            { position: 'OUTCOME', drawnCard: newCards[2] },
          ] as [FollowUpSpreadCard, FollowUpSpreadCard, FollowUpSpreadCard],
          userQuestion,
        };
        
        const updatedSpread: SpreadRecord = {
          ...spread,
          followUp,
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
      
      // Update AI interpretation for a follow-up
      updateFollowUpInterpretation: async (dateKey, spreadId, interpretation) => {
        const spreads = get().spreads[dateKey];
        if (!spreads) return null;
        
        const spreadIndex = spreads.findIndex((s) => s.id === spreadId);
        if (spreadIndex === -1) return null;
        
        const spread = spreads[spreadIndex];
        if (!spread.followUp) return null;
        
        const updatedSpread: SpreadRecord = {
          ...spread,
          followUp: {
            ...spread.followUp,
            aiInterpretation: interpretation,
            aiGeneratedAt: Date.now(),
          },
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
      
      // Update reflection for a spread
      updateSpreadReflection: async (dateKey, spreadId, accuracy, text) => {
        const spreads = get().spreads[dateKey];
        if (!spreads) return null;
        
        const spreadIndex = spreads.findIndex((s) => s.id === spreadId);
        if (spreadIndex === -1) return null;
        
        const spread = spreads[spreadIndex];
        
        const reflection: Reflection = {
          accuracy,
          text: text?.trim(),
          createdAt: Date.now(),
        };
        
        const updatedSpread: SpreadRecord = {
          ...spread,
          reflection,
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


