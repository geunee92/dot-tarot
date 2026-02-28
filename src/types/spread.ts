import { DrawnCard } from './card';

export type SpreadTopic = 'GENERAL' | 'LOVE' | 'MONEY' | 'WORK';

export type SpreadPosition = 'FLOW' | 'INFLUENCE' | 'ADVICE';

export type CombinationPattern = 'UUU' | 'UUR' | 'URU' | 'RUU' | 'URR' | 'RUR' | 'RRU' | 'RRR';

export type ReversalModifier = 'NEUTRAL' | 'INTERNALIZED' | 'BLOCKED_DELAYED' | 'SHADOW_EXCESS';

export type ReflectionAccuracy = 'accurate' | 'neutral' | 'unsure';

export interface Reflection {
  accuracy: ReflectionAccuracy;
  text?: string;
  createdAt: number;
}

export interface SpreadCard {
  position: SpreadPosition;
  drawnCard: DrawnCard;
}

export interface SpreadRecord {
  id: string;
  dateKey: string;
  topic: SpreadTopic;
  cards: [SpreadCard, SpreadCard, SpreadCard];
  pattern: CombinationPattern;
  modifier: ReversalModifier;
  createdAt: number;
  userQuestion?: string;
  aiInterpretation?: string;
  aiGeneratedAt?: number;
  reflection?: Reflection;
}

export const TOPIC_MODIFIERS: Record<SpreadTopic, ReversalModifier> = {
  GENERAL: 'NEUTRAL',
  LOVE: 'INTERNALIZED',
  MONEY: 'BLOCKED_DELAYED',
  WORK: 'SHADOW_EXCESS',
};
