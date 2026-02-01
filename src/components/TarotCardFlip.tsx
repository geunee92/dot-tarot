import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { FlipCard, FlipCardRef } from './FlipCard';
import { COLORS, SPACING, BORDERS, FONTS } from './theme';
import { TarotCard, CardOrientation } from '../types';
import { getCardImageSource, getKeywords, getTalismanLine, getCardName } from '../utils/cards';
import { useRewardStore } from '../stores/rewardStore';

interface TarotCardFlipProps {
  card: TarotCard;
  orientation: CardOrientation;
  isFlipped?: boolean;
  onFlipComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export interface TarotCardFlipRef {
  flip: () => void;
  flipTo: (flipped: boolean) => void;
}

const IMAGE_ASPECT_RATIO = 1.5;

const CARD_WIDTHS = {
  small: 100,
  medium: 160,
  large: 220,
};

const CARD_INFO_HEIGHTS = {
  small: 105,
  medium: 150,
  large: 165,
};

const getCardDimensions = (size: 'small' | 'medium' | 'large') => {
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

export const TarotCardFlip = forwardRef<TarotCardFlipRef, TarotCardFlipProps>(
  ({ card, orientation, isFlipped, onFlipComplete, size = 'large', style }, ref) => {
    const flipCardRef = useRef<FlipCardRef>(null);
    const selectedSkin = useRewardStore((state) => state.getSelectedSkin());
    
    useImperativeHandle(ref, () => ({
      flip: () => flipCardRef.current?.flip(),
      flipTo: (flipped: boolean) => flipCardRef.current?.flipTo(flipped),
    }));

    const { width, imageHeight, cardInfoHeight, totalHeight } = getCardDimensions(size);
    const cardImageSource = getCardImageSource(card);
    const keywords = getKeywords(card, orientation);
    const cardName = getCardName(card);
    const talismanLine = getTalismanLine(card);
    const isReversed = orientation === 'reversed';

    const backContent = (
      <View style={[styles.cardBack, { width, height: totalHeight }]}>
        {selectedSkin.image ? (
          <Image
            source={selectedSkin.image}
            style={styles.backImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.backPattern}>
            <Text style={styles.backSymbol}>✦</Text>
            <Text style={styles.backText}>{selectedSkin.name}</Text>
            <Text style={styles.backSymbol}>✦</Text>
          </View>
        )}
        <Text style={styles.tapHint}>Tap to reveal</Text>
      </View>
    );

    const frontContent = (
      <View style={[styles.cardFront, { width, height: totalHeight }]}>
        <View style={[styles.imageContainer, { height: imageHeight }, isReversed && styles.reversed]}>
          <Image
            source={cardImageSource}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </View>

        <View style={[styles.cardInfo, { height: cardInfoHeight }]}>
          <Text style={styles.cardName} numberOfLines={1}>
            {cardName}
          </Text>
          
          <View style={[
            styles.orientationBadge,
            { backgroundColor: isReversed ? COLORS.reversed : COLORS.upright }
          ]}>
            <Text style={styles.orientationText}>
              {isReversed ? 'REVERSED' : 'UPRIGHT'}
            </Text>
          </View>

          <View style={styles.keywordsContainer}>
            {keywords.slice(0, 3).map((kw, i) => (
              <Text key={i} style={styles.keyword}>{kw}</Text>
            ))}
          </View>

          <Text style={styles.talismanLine} numberOfLines={2}>"{talismanLine}"</Text>
        </View>
      </View>
    );

    return (
      <FlipCard
        ref={flipCardRef}
        backContent={backContent}
        frontContent={frontContent}
        isFlipped={isFlipped}
        onFlipEnd={(flipped) => {
          if (flipped && onFlipComplete) {
            onFlipComplete();
          }
        }}
        style={style}
        cardStyle={{ width, height: totalHeight }}
      />
    );
  }
);

TarotCardFlip.displayName = 'TarotCardFlip';

const styles = StyleSheet.create({
  cardBack: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backPattern: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  backSymbol: {
    fontSize: FONTS.title,
    color: COLORS.accent,
  },
  backText: {
    fontSize: FONTS.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tapHint: {
    position: 'absolute',
    bottom: SPACING.md,
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
  },
  cardFront: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  imageContainer: {
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  backImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  reversed: {
    transform: [{ rotate: '180deg' }],
  },
  cardInfo: {
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: FONTS.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  orientationBadge: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  orientationText: {
    fontSize: FONTS.xs,
    fontWeight: 'bold',
    color: COLORS.background,
    letterSpacing: 1,
  },
  keywordsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  keyword: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
  },
  talismanLine: {
    fontSize: FONTS.md,
    fontStyle: 'italic',
    color: COLORS.accent,
    textAlign: 'center',
  },
});
