import { SpreadRecord, SpreadTopic, FollowUpSpreadCard } from '../types';
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

interface FollowUpInterpretRequest {
  topic: SpreadTopic;
  originalCards: Array<{
    position: string;
    cardId: number;
    cardName: string;
    keywords: string[];
    orientation: 'upright' | 'reversed';
  }>;
  followUpCards: Array<{
    position: string;
    cardId: number;
    cardName: string;
    keywords: string[];
    orientation: 'upright' | 'reversed';
  }>;
  originalPattern: string;
  originalInterpretation?: string;
  userQuestion: string;
  locale: 'en' | 'ko';
}

const API_URL = 'https://taro-ai-api.geunee92.workers.dev';
const APP_KEY = 'taro-prod-key-a44c758506dbbce5fd1a9887823d48f4';

export async function generateInterpretation(spread: SpreadRecord): Promise<string> {
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

export async function generateFollowUpInterpretation(
  spread: SpreadRecord,
  followUpCards: FollowUpSpreadCard[],
  userQuestion: string
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const request: FollowUpInterpretRequest = {
      topic: spread.topic,
      originalCards: spread.cards.map(c => ({
        position: c.position,
        cardId: c.drawnCard.card.id,
        cardName: getCardName(c.drawnCard.card),
        keywords: getKeywords(c.drawnCard.card, c.drawnCard.orientation),
        orientation: c.drawnCard.orientation,
      })),
      followUpCards: followUpCards.map(c => ({
        position: c.position,
        cardId: c.drawnCard.card.id,
        cardName: getCardName(c.drawnCard.card),
        keywords: getKeywords(c.drawnCard.card, c.drawnCard.orientation),
        orientation: c.drawnCard.orientation,
      })),
      originalPattern: spread.pattern,
      originalInterpretation: spread.aiInterpretation,
      userQuestion: userQuestion,
      locale: getLocale() as 'en' | 'ko',
    };

    const response = await fetch(`${API_URL}/api/interpret-followup`, {
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
