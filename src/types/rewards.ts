export interface BackSkin {
  id: string;
  name: string;
  description: string;
  requiredDays: number;
  isDefault?: boolean;
}

export interface RewardMilestone {
  days: number;
  skinId: string;
}

export const REWARD_MILESTONES: RewardMilestone[] = [
  { days: 7, skinId: 'skin_1' },
  { days: 14, skinId: 'skin_2' },
  { days: 21, skinId: 'skin_3' },
  { days: 28, skinId: 'skin_special' },
];

export interface RewardsState {
  unlockedSkins: string[];
  selectedSkinId: string;
}
