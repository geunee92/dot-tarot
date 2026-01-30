import { DrawnCard } from './card';

export interface DailyDraw {
  dateKey: string; // YYYY-MM-DD
  drawnCard: DrawnCard;
  memo?: string;
  createdAt: number; // timestamp
}
