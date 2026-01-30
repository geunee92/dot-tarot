import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDERS, FONTS } from './theme';
import { TarotCard, CardOrientation } from '../types';
import { getCardPlaceholderColor, getKeywords, getMeaning } from '../utils/cards';

interface PixelCardProps {
  card: TarotCard;
  orientation: CardOrientation;
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export function PixelCard({
  card,
  orientation,
  showDetails = false,
  size = 'medium',
  style,
}: PixelCardProps) {
  const placeholderColor = getCardPlaceholderColor(card);
  const keywords = getKeywords(card, orientation);
  const meaning = getMeaning(card, orientation);
  const isReversed = orientation === 'reversed';
  const orientationColor = isReversed ? COLORS.reversed : COLORS.upright;

  return (
    <View style={[styles.card, styles[size], style]}>
      <View
        style={[
          styles.imagePlaceholder,
          { backgroundColor: placeholderColor },
          isReversed && styles.reversed,
        ]}
      >
        <Text style={styles.cardNumber}>{card.id}</Text>
        <Text style={styles.cardKey}>{card.key.toUpperCase()}</Text>
      </View>
      
      <View style={styles.nameContainer}>
        <Text style={styles.cardName} numberOfLines={1}>
          {card.nameEn}
        </Text>
        <View style={[styles.orientationBadge, { backgroundColor: orientationColor }]}>
          <Text style={styles.orientationText}>
            {isReversed ? '↓' : '↑'}
          </Text>
        </View>
      </View>
      
      {showDetails && (
        <View style={styles.details}>
          <View style={styles.keywordsContainer}>
            {keywords.map((kw, i) => (
              <View key={i} style={styles.keywordBadge}>
                <Text style={styles.keywordText}>{kw}</Text>
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
  },
  small: { width: 80, minHeight: 120 },
  medium: { width: 140, minHeight: 200 },
  large: { width: 200, minHeight: 280 },
  imagePlaceholder: {
    flex: 1,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.border,
  },
  reversed: {
    transform: [{ rotate: '180deg' }],
  },
  cardNumber: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.3)',
  },
  cardKey: {
    fontSize: FONTS.sm,
    color: 'rgba(255,255,255,0.5)',
    marginTop: SPACING.xs,
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
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orientationBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 2,
    marginLeft: SPACING.xs,
  },
  orientationText: {
    fontSize: FONTS.sm,
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
  },
  keywordText: {
    fontSize: FONTS.xs,
    color: COLORS.text,
  },
  meaning: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
    lineHeight: FONTS.sm * 1.5,
  },
});
