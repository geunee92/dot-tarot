import { ImageSourcePropType } from 'react-native';

export interface BackSkin {
  id: string;
  name: string;
  description: string;
  requiredDays: number;
  isDefault?: boolean;
  image?: ImageSourcePropType;
}

export interface RewardMilestone {
  days: number;
  skinId: string;
}

export const REWARD_MILESTONES: RewardMilestone[] = [
  { days: 14, skinId: 'skin_1' },
  { days: 28, skinId: 'skin_2' },
  { days: 42, skinId: 'skin_3' },
  { days: 56, skinId: 'skin_special' },
];

export interface RewardsState {
  unlockedSkins: string[];
  selectedSkinId: string;
}
