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
