export interface TarotCard {
  id: number;
  key: string;
  nameEn: string;
  keywordsUpright: string[];
  keywordsReversed: string[];
  meaningUpright: string;
  meaningReversed: string;
  talismanLine: string;
  actionTip: string;
}

export type CardOrientation = 'upright' | 'reversed';

export interface DrawnCard {
  card: TarotCard;
  orientation: CardOrientation;
}
