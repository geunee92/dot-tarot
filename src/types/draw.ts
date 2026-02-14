import { DrawnCard } from './card';
import { Reflection } from './spread';

export interface DailyDraw {
  dateKey: string; // YYYY-MM-DD
  drawnCard: DrawnCard;
  memo?: string;
  reflection?: Reflection;
  createdAt: number; // timestamp
}
