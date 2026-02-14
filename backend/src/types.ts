export type Topic = 'LOVE' | 'MONEY' | 'WORK';
export type Orientation = 'upright' | 'reversed';
export type Locale = 'en' | 'ko';

export interface Card {
  position: string;
  cardId: number;
  cardName: string;
  keywords: string[];
  orientation: Orientation;
}

export interface InterpretRequest {
  topic: Topic;
  cards: Card[];
  pattern: string;
  userQuestion?: string;
  locale: Locale;
}

export interface InterpretResponse {
  interpretation?: string;
  error?: string;
}

export interface FollowUpCard {
  position: string; // 'DEPTH' | 'HIDDEN' | 'OUTCOME'
  cardId: number;
  cardName: string;
  keywords: string[];
  orientation: Orientation;
}

export interface FollowUpInterpretRequest {
  topic: Topic;
  originalCards: Card[]; // the original 3-card spread
  followUpCards: FollowUpCard[];
  originalPattern: string;
  originalInterpretation?: string;
  userQuestion: string; // the follow-up question
  locale: Locale;
}
