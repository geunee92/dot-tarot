import cardsData from './cards.json';
import { TarotCard } from '../types';

// Type assertion for JSON import
export const TAROT_CARDS: TarotCard[] = cardsData as TarotCard[];

// Re-export back skins
export * from './back-skins';

// Card count constant
export const TOTAL_CARDS = 22;
