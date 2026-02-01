import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDERS, FONTS, SHADOWS, FONT_FAMILY } from './theme';
import { TarotCard, CardOrientation } from '../types';
import { getCardImageSource, getKeywords, getMeaning, getCardName } from '../utils/cards';

interface PixelCardProps {
  card: TarotCard;
  orientation: CardOrientation;
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const IMAGE_ASPECT_RATIO = 1.5;

const CARD_WIDTHS: Record<'small' | 'medium' | 'large', number> = {
  small: 100,
  medium: 160,
  large: 220,
};

export function PixelCard({
  card,
  orientation,
  showDetails = false,
  size = 'medium',
  style,
}: PixelCardProps) {
  const cardImageSource = getCardImageSource(card);
  const keywords = getKeywords(card, orientation);
  const meaning = getMeaning(card, orientation);
  const cardName = getCardName(card);
  const isReversed = orientation === 'reversed';
  const orientationColor = isReversed ? COLORS.reversed : COLORS.upright;
  
  const width = CARD_WIDTHS[size];
  const imageHeight = width * IMAGE_ASPECT_RATIO;

  return (
    <View style={[styles.card, { width }, style]}>
      <View style={[styles.imageContainer, { height: imageHeight }, isReversed && styles.reversed]}>
        <Image
          source={cardImageSource}
          style={styles.cardImage}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.nameContainer}>
        <Text style={styles.cardName} numberOfLines={1}>
          {cardName.toUpperCase()}
        </Text>
        <View style={[styles.orientationBadge, { backgroundColor: orientationColor }]}>
          <Text style={styles.orientationText}>
            {isReversed ? '▼' : '▲'}
          </Text>
        </View>
      </View>
      
      {showDetails && (
        <View style={styles.details}>
          <View style={styles.keywordsContainer}>
            {keywords.map((kw, i) => (
              <View key={i} style={styles.keywordBadge}>
                <Text style={styles.keywordText}>{kw.toUpperCase()}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.meaning} numberOfLines={3}>
            {meaning}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.block,
  },
  imageContainer: {
    overflow: 'hidden',
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.border,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  reversed: {
    transform: [{ rotate: '180deg' }],
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    backgroundColor: COLORS.surfaceLight,
  },
  cardName: {
    flex: 1,
    fontFamily: FONT_FAMILY.pixel,
    fontSize: FONTS.xs,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  orientationBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    marginLeft: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  orientationText: {
    fontFamily: FONT_FAMILY.pixel,
    fontSize: FONTS.xs,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  details: {
    padding: SPACING.sm,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  keywordBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  keywordText: {
    fontFamily: FONT_FAMILY.pixel,
    fontSize: FONTS.xs,
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  meaning: {
    fontFamily: FONT_FAMILY.pixel,
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    lineHeight: FONTS.xs * 2,
  },
});
