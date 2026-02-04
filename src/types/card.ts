export interface TarotCard {
  id: number;
  key: string;
  nameEn: string;
  name?: string;
  keywordsUpright: string[];
  keywordsReversed: string[];
  meaningUpright: string;
  meaningReversed: string;
  talismanLine: string;
  actionTip: string;
  dailyContextUpright: string;
  dailyContextReversed: string;
}

export type CardOrientation = 'upright' | 'reversed';

export interface DrawnCard {
  card: TarotCard;
  orientation: CardOrientation;
}
