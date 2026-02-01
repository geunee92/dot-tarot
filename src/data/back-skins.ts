import { BackSkin } from '../types';

export const BACK_SKINS: BackSkin[] = [
  {
    id: 'skin_default',
    name: 'Classic',
    description: 'The default mystical card back',
    requiredDays: 0,
    isDefault: true,
    image: require('../../assets/backs/skin_default.png'),
  },
  {
    id: 'skin_1',
    name: 'Starlight',
    description: 'Shimmering stars on midnight blue',
    requiredDays: 14,
    image: require('../../assets/backs/skin_1.png'),
  },
  {
    id: 'skin_2',
    name: 'Golden Runes',
    description: 'Ancient runes etched in gold',
    requiredDays: 28,
    image: require('../../assets/backs/skin_2.png'),
  },
  {
    id: 'skin_3',
    name: 'Crystal Moon',
    description: 'A crescent moon with crystals',
    requiredDays: 42,
    image: require('../../assets/backs/skin_3.png'),
  },
  {
    id: 'skin_special',
    name: 'Cosmic Gateway',
    description: 'The rarest design - a portal to the cosmos',
    requiredDays: 56,
    image: require('../../assets/backs/skin_special.png'),
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
