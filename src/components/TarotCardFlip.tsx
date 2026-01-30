import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { FlipCard, FlipCardRef } from './FlipCard';
import { COLORS, SPACING, BORDERS, FONTS } from './theme';
import { TarotCard, CardOrientation } from '../types';
import { getCardPlaceholderColor, getKeywords } from '../utils/cards';
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

const CARD_DIMENSIONS = {
  small: { width: 100, height: 150 },
  medium: { width: 160, height: 240 },
  large: { width: 220, height: 330 },
};

export const TarotCardFlip = forwardRef<TarotCardFlipRef, TarotCardFlipProps>(
  ({ card, orientation, isFlipped, onFlipComplete, size = 'large', style }, ref) => {
    const flipCardRef = useRef<FlipCardRef>(null);
    const selectedSkin = useRewardStore((state) => state.getSelectedSkin());
    
    useImperativeHandle(ref, () => ({
      flip: () => flipCardRef.current?.flip(),
      flipTo: (flipped: boolean) => flipCardRef.current?.flipTo(flipped),
    }));

    const cardDimensions = CARD_DIMENSIONS[size];
    const placeholderColor = getCardPlaceholderColor(card);
    const keywords = getKeywords(card, orientation);
    const isReversed = orientation === 'reversed';

    const backContent = (
      <View style={[styles.cardBack, cardDimensions]}>
        <View style={styles.backPattern}>
          <Text style={styles.backSymbol}>✦</Text>
          <Text style={styles.backText}>{selectedSkin.name}</Text>
          <Text style={styles.backSymbol}>✦</Text>
        </View>
        <Text style={styles.tapHint}>Tap to reveal</Text>
      </View>
    );

    const frontContent = (
      <View style={[styles.cardFront, cardDimensions]}>
        <View
          style={[
            styles.imagePlaceholder,
            { backgroundColor: placeholderColor },
            isReversed && styles.reversed,
          ]}
        >
          <Text style={styles.cardNumber}>{card.id}</Text>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {card.nameEn}
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

          <Text style={styles.talismanLine}>"{card.talismanLine}"</Text>
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
        cardStyle={cardDimensions}
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
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reversed: {
    transform: [{ rotate: '180deg' }],
  },
  cardNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.2)',
  },
  cardInfo: {
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceLight,
    gap: SPACING.sm,
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
    marginTop: SPACING.xs,
  },
});
