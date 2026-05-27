import { SpreadRecord, SpreadTopic } from '../types';
import { getLocale } from '../i18n';
import { getCardName, getKeywords } from '../utils/cards';

interface InterpretRequest {
  topic: SpreadTopic;
  cards: Array<{
    position: string;
    cardId: number;
    cardName: string;
    keywords: string[];
    orientation: 'upright' | 'reversed';
  }>;
  pattern: string;
  userQuestion?: string;
  locale: 'en' | 'ko';
}

// Configured via .env (see .env.example). These are inlined at build time by Expo.
const API_URL = process.env.EXPO_PUBLIC_TARO_API_URL ?? '';
const APP_KEY = process.env.EXPO_PUBLIC_TARO_APP_KEY ?? '';

export async function generateInterpretation(spread: SpreadRecord): Promise<string> {
  if (!API_URL || !APP_KEY) {
    throw new Error(
      'AI API is not configured. Set EXPO_PUBLIC_TARO_API_URL and EXPO_PUBLIC_TARO_APP_KEY in .env (see .env.example).'
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const request: InterpretRequest = {
      topic: spread.topic,
      cards: spread.cards.map(c => ({
        position: c.position,
        cardId: c.drawnCard.card.id,
        cardName: getCardName(c.drawnCard.card),
        keywords: getKeywords(c.drawnCard.card, c.drawnCard.orientation),
        orientation: c.drawnCard.orientation,
      })),
      pattern: spread.pattern,
      userQuestion: spread.userQuestion,
      locale: getLocale() as 'en' | 'ko',
    };

    const response = await fetch(`${API_URL}/api/interpret`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': APP_KEY,
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.interpretation;
  } catch (error) {
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
