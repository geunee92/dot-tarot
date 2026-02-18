import { DrawnCard } from './card';

export type SpreadTopic = 'GENERAL' | 'LOVE' | 'MONEY' | 'WORK';

export type SpreadPosition = 'FLOW' | 'INFLUENCE' | 'ADVICE';

export type FollowUpPosition = 'DEPTH' | 'HIDDEN' | 'OUTCOME';

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

export interface FollowUpSpreadCard {
  position: FollowUpPosition;
  drawnCard: DrawnCard;
}

export interface FollowUp {
  cards: [FollowUpSpreadCard, FollowUpSpreadCard, FollowUpSpreadCard];
  userQuestion: string;
  aiInterpretation?: string;
  aiGeneratedAt?: number;
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
  followUp?: FollowUp;
  reflection?: Reflection;
}

export const TOPIC_MODIFIERS: Record<SpreadTopic, ReversalModifier> = {
  GENERAL: 'NEUTRAL',
  LOVE: 'INTERNALIZED',
  MONEY: 'BLOCKED_DELAYED',
  WORK: 'SHADOW_EXCESS',
};
