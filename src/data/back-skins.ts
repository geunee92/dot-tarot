import { BackSkin } from '../types';

export const BACK_SKINS: BackSkin[] = [
  {
    id: 'skin_default',
    name: 'Classic',
    description: 'The default mystical card back',
    requiredDays: 0,
    isDefault: true,
  },
  {
    id: 'skin_1',
    name: 'Starlight',
    description: 'Shimmering stars on midnight blue',
    requiredDays: 7,
  },
  {
    id: 'skin_2',
    name: 'Golden Runes',
    description: 'Ancient runes etched in gold',
    requiredDays: 14,
  },
  {
    id: 'skin_3',
    name: 'Crystal Moon',
    description: 'A crescent moon with crystals',
    requiredDays: 21,
  },
  {
    id: 'skin_special',
    name: 'Cosmic Gateway',
    description: 'The rarest design - a portal to the cosmos',
    requiredDays: 28,
  },
];

export const getDefaultSkin = (): BackSkin => {
  return BACK_SKINS.find(skin => skin.isDefault) || BACK_SKINS[0];
};

export const getSkinById = (id: string): BackSkin | undefined => {
  return BACK_SKINS.find(skin => skin.id === id);
};

export const getSkinsForDays = (days: number): BackSkin[] => {
  return BACK_SKINS.filter(skin => skin.requiredDays <= days);
};
