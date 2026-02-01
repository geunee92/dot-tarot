import cardsEn from './cards-en.json';
import cardsKo from './cards-ko.json';
import { TarotCard } from '../types';
import { getLocale } from '../i18n';

export const TAROT_CARDS_EN: TarotCard[] = cardsEn as TarotCard[];
export const TAROT_CARDS_KO: TarotCard[] = cardsKo as TarotCard[];

export const getLocalizedCards = (): TarotCard[] => {
  const locale = getLocale();
  return locale === 'ko' ? TAROT_CARDS_KO : TAROT_CARDS_EN;
};

export const TAROT_CARDS = TAROT_CARDS_EN;

export * from './back-skins';

export const TOTAL_CARDS = 22;
