import { ImageSourcePropType } from 'react-native';
import { TarotCard, CardOrientation, DrawnCard } from '../types';
import { TAROT_CARDS, TAROT_CARDS_EN, TAROT_CARDS_KO, TOTAL_CARDS } from '../data';
import { getLocale } from '../i18n';

// ============================================
// Image Mappings (Static require for bundler)
// ============================================

const CARD_IMAGES: Record<string, ImageSourcePropType> = {
  fool: require('../../assets/cards/fool.png'),
  magician: require('../../assets/cards/magician.png'),
  high_priestess: require('../../assets/cards/high_priestess.png'),
  empress: require('../../assets/cards/empress.png'),
  emperor: require('../../assets/cards/emperor.png'),
  hierophant: require('../../assets/cards/hierophant.png'),
  lovers: require('../../assets/cards/lovers.png'),
  chariot: require('../../assets/cards/chariot.png'),
  strength: require('../../assets/cards/strength.png'),
  hermit: require('../../assets/cards/hermit.png'),
  wheel_of_fortune: require('../../assets/cards/wheel_of_fortune.png'),
  justice: require('../../assets/cards/justice.png'),
  hanged_man: require('../../assets/cards/hanged_man.png'),
  death: require('../../assets/cards/death.png'),
  temperance: require('../../assets/cards/temperance.png'),
  devil: require('../../assets/cards/devil.png'),
  tower: require('../../assets/cards/tower.png'),
  star: require('../../assets/cards/star.png'),
  moon: require('../../assets/cards/moon.png'),
  sun: require('../../assets/cards/sun.png'),
  judgement: require('../../assets/cards/judgement.png'),
  world: require('../../assets/cards/world.png'),
};

const BACK_SKIN_IMAGES: Record<string, ImageSourcePropType> = {
  skin_default: require('../../assets/backs/skin_default.png'),
  skin_1: require('../../assets/backs/skin_1.png'),
  skin_2: require('../../assets/backs/skin_2.png'),
  skin_3: require('../../assets/backs/skin_3.png'),
  skin_special: require('../../assets/backs/skin_special.png'),
};

// ============================================
// Card Access
// ============================================

/**
 * Get all tarot cards
 */
export function getAllCards(): TarotCard[] {
  return TAROT_CARDS;
}

/**
 * Get card by ID (0-21)
 */
export function getCardById(id: number): TarotCard | undefined {
  return TAROT_CARDS.find(card => card.id === id);
}

/**
 * Get card by key (e.g., "fool", "magician")
 */
export function getCardByKey(key: string): TarotCard | undefined {
  return TAROT_CARDS.find(card => card.key === key);
}

/**
 * Get card count
 */
export function getCardCount(): number {
  return TOTAL_CARDS;
}

// ============================================
// Randomization
// ============================================

/**
 * Get a random card
 */
export function getRandomCard(): TarotCard {
  const index = Math.floor(Math.random() * TOTAL_CARDS);
  return TAROT_CARDS[index];
}

/**
 * Get multiple random cards (no duplicates)
 * @param count - Number of cards to draw
 * @throws Error if count > total cards
 */
export function getRandomCards(count: number): TarotCard[] {
  if (count > TOTAL_CARDS) {
    throw new Error(`Cannot draw ${count} cards from a deck of ${TOTAL_CARDS}`);
  }
  
  if (count <= 0) {
    return [];
  }
  
  // Fisher-Yates shuffle on indices, take first N
  const indices = Array.from({ length: TOTAL_CARDS }, (_, i) => i);
  
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  return indices.slice(0, count).map(i => TAROT_CARDS[i]);
}

/**
 * Get random orientation (upright or reversed)
 * 50/50 chance
 */
export function getRandomOrientation(): CardOrientation {
  return Math.random() < 0.5 ? 'upright' : 'reversed';
}

// ============================================
// Drawn Card Helpers
// ============================================

/**
 * Create a drawn card with random orientation
 */
export function drawRandomCard(): DrawnCard {
  return {
    card: getRandomCard(),
    orientation: getRandomOrientation(),
  };
}

/**
 * Draw multiple cards with random orientations (no duplicates)
 */
export function drawRandomCards(count: number): DrawnCard[] {
  const cards = getRandomCards(count);
  return cards.map(card => ({
    card,
    orientation: getRandomOrientation(),
  }));
}

/**
 * Draw a random card excluding specific card IDs
 */
export function drawRandomCardExcluding(excludeIds: number[]): DrawnCard {
  const availableCards = TAROT_CARDS.filter(card => !excludeIds.includes(card.id));
  if (availableCards.length === 0) {
    return drawRandomCard();
  }
  const randomIndex = Math.floor(Math.random() * availableCards.length);
  return {
    card: availableCards[randomIndex],
    orientation: getRandomOrientation(),
  };
}

// ============================================
// Card Content Helpers
// ============================================

/**
 * Get localized card by key
 * Looks up the card translation based on current locale
 */
export function getLocalizedCard(card: TarotCard): TarotCard {
  const locale = getLocale();
  const cards = locale === 'ko' ? TAROT_CARDS_KO : TAROT_CARDS_EN;
  return cards.find(c => c.key === card.key) || card;
}

/**
 * Get keywords based on orientation (localized)
 */
export function getKeywords(card: TarotCard, orientation: CardOrientation): string[] {
  const localizedCard = getLocalizedCard(card);
  return orientation === 'upright' ? localizedCard.keywordsUpright : localizedCard.keywordsReversed;
}

/**
 * Get meaning based on orientation (localized)
 */
export function getMeaning(card: TarotCard, orientation: CardOrientation): string {
  const localizedCard = getLocalizedCard(card);
  return orientation === 'upright' ? localizedCard.meaningUpright : localizedCard.meaningReversed;
}

/**
 * Get card name (localized)
 */
export function getCardName(card: TarotCard): string {
  const localizedCard = getLocalizedCard(card);
  return localizedCard.name || localizedCard.nameEn;
}

/**
 * Get talisman line (localized)
 */
export function getTalismanLine(card: TarotCard): string {
  const localizedCard = getLocalizedCard(card);
  return localizedCard.talismanLine;
}

/**
 * Get action tip (localized)
 */
export function getActionTip(card: TarotCard): string {
  const localizedCard = getLocalizedCard(card);
  return localizedCard.actionTip;
}

/**
 * Get daily context based on orientation (localized)
 * Provides personal context for why this card is meaningful as today's talisman
 */
export function getDailyContext(card: TarotCard, orientation: CardOrientation): string {
  const localizedCard = getLocalizedCard(card);
  return orientation === 'upright' ? localizedCard.dailyContextUpright : localizedCard.dailyContextReversed;
}

/**
 * Get display text for orientation
 */
export function getOrientationLabel(orientation: CardOrientation): string {
  return orientation === 'upright' ? 'Upright' : 'Reversed';
}

// ============================================
// Image Helpers
// ============================================

export function getCardImageSource(card: TarotCard): ImageSourcePropType {
  return CARD_IMAGES[card.key];
}

export function getBackSkinImageSource(skinId: string): ImageSourcePropType {
  return BACK_SKIN_IMAGES[skinId];
}

export function getCardPlaceholderColor(card: TarotCard): string {
  const hue = (card.id * 16.36) % 360;
  return `hsl(${hue}, 60%, 45%)`;
}
