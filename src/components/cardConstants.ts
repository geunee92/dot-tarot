// Card size types and constants shared across card components
export type CardSize = 'small' | 'medium' | 'large';

export const IMAGE_ASPECT_RATIO = 1.5;

export const CARD_WIDTHS: Record<CardSize, number> = {
  small: 100,
  medium: 160,
  large: 220,
};

export const CARD_INFO_HEIGHTS: Record<CardSize, number> = {
  small: 105,
  medium: 150,
  large: 165,
};

export const getCardDimensions = (size: CardSize) => {
  const width = CARD_WIDTHS[size];
  const imageHeight = width * IMAGE_ASPECT_RATIO;
  const cardInfoHeight = CARD_INFO_HEIGHTS[size];
  const totalHeight = imageHeight + cardInfoHeight;
  return {
    width,
    imageHeight,
    cardInfoHeight,
    totalHeight,
  };
};
