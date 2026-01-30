import { DrawnCard } from './card';

export type SpreadTopic = 'LOVE' | 'MONEY' | 'WORK';

export type SpreadPosition = 'FLOW' | 'INFLUENCE' | 'ADVICE';

export type CombinationPattern = 'UUU' | 'UUR' | 'URU' | 'RUU' | 'URR' | 'RUR' | 'RRU' | 'RRR';

export type ReversalModifier = 'INTERNALIZED' | 'BLOCKED_DELAYED' | 'SHADOW_EXCESS';

export interface SpreadCard {
  position: SpreadPosition;
  drawnCard: DrawnCard;
}

export interface ClarifierCard {
  drawnCard: DrawnCard;
  unlockedAt: number;
}

export interface SpreadRecord {
  id: string;
  dateKey: string;
  topic: SpreadTopic;
  cards: [SpreadCard, SpreadCard, SpreadCard];
  pattern: CombinationPattern;
  modifier: ReversalModifier;
  clarifier?: ClarifierCard;
  createdAt: number;
}

export const TOPIC_MODIFIERS: Record<SpreadTopic, ReversalModifier> = {
  LOVE: 'INTERNALIZED',
  MONEY: 'BLOCKED_DELAYED',
  WORK: 'SHADOW_EXCESS',
};
