import { TarotCard, CardOrientation, DrawnCard } from '../types';
import { TAROT_CARDS, TOTAL_CARDS } from '../data';

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

// ============================================
// Card Content Helpers
// ============================================

/**
 * Get keywords based on orientation
 */
export function getKeywords(card: TarotCard, orientation: CardOrientation): string[] {
  return orientation === 'upright' ? card.keywordsUpright : card.keywordsReversed;
}

/**
 * Get meaning based on orientation
 */
export function getMeaning(card: TarotCard, orientation: CardOrientation): string {
  return orientation === 'upright' ? card.meaningUpright : card.meaningReversed;
}

/**
 * Get display text for orientation
 */
export function getOrientationLabel(orientation: CardOrientation): string {
  return orientation === 'upright' ? 'Upright' : 'Reversed';
}

// ============================================
// Image Placeholder (for future asset mapping)
// ============================================

/**
 * Placeholder for card image mapping
 * When actual images are added, this will return the require() path
 * For now, returns a placeholder identifier
 */
export function getCardImageSource(card: TarotCard): string {
  // TODO: Replace with actual image mapping when assets are ready
  // Example future implementation:
  // const images: Record<string, any> = {
  //   fool: require('../assets/cards/fool.png'),
  //   magician: require('../assets/cards/magician.png'),
  //   ...
  // };
  // return images[card.key];
  
  return `card_${card.key}`;
}

/**
 * Get placeholder color for card (based on card ID)
 * Used for visual distinction before real images are added
 */
export function getCardPlaceholderColor(card: TarotCard): string {
  // Generate a consistent color based on card ID
  const hue = (card.id * 16.36) % 360; // Spread across color wheel
  return `hsl(${hue}, 60%, 45%)`;
}

// ============================================
// Card Back Skin Helpers
// ============================================

/**
 * Placeholder for card back image mapping
 */
export function getBackSkinImageSource(skinId: string): string {
  // TODO: Replace with actual image mapping when assets are ready
  return `back_${skinId}`;
}
