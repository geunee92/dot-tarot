import React, { forwardRef, useRef, useImperativeHandle, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { FlipCard, FlipCardRef } from './FlipCard';
import { COLORS, SPACING, BORDERS, FONTS } from './theme';
import { getCardDimensions } from './cardConstants';
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



export const TarotCardFlip = forwardRef<TarotCardFlipRef, TarotCardFlipProps>(
  ({ card, orientation, isFlipped, onFlipComplete, size = 'large', style }, ref) => {
    const flipCardRef = useRef<FlipCardRef>(null);
    const selectedSkin = useRewardStore((state) => state.getSelectedSkin());
    
    const glowOpacity = useSharedValue(0);
    const [isRevealed, setIsRevealed] = React.useState(!!isFlipped);

    useEffect(() => {
      if (isRevealed) {
        glowOpacity.value = withDelay(
          500,
          withRepeat(
            withSequence(
              withTiming(0.8, { duration: 1500 }),
              withTiming(0.3, { duration: 1500 })
            ),
            -1,
            true
          )
        );
      }
    }, [isRevealed]);

    const glowStyle = useAnimatedStyle(() => ({
      shadowColor: COLORS.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowOpacity.value,
      shadowRadius: 12,
      elevation: glowOpacity.value > 0 ? 8 : 0,
    }));
    
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
      <Animated.View style={[styles.cardFront, { width, height: totalHeight }, isRevealed && glowStyle]}>
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

          <Text style={styles.keywords}>
            {keywords.slice(0, 3).join(' · ')}
          </Text>

          <Text style={styles.talismanLine} numberOfLines={2}>"{talismanLine}"</Text>
        </View>
      </Animated.View>
    );

    return (
      <FlipCard
        ref={flipCardRef}
        backContent={backContent}
        frontContent={frontContent}
        isFlipped={isFlipped}
        onFlipEnd={(flipped) => {
          if (flipped) {
            setIsRevealed(true);
            if (onFlipComplete) {
              onFlipComplete();
            }
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
  keywords: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  talismanLine: {
    fontSize: FONTS.md,
    fontStyle: 'italic',
    color: COLORS.accent,
    textAlign: 'center',
  },
});
