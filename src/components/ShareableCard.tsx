import React, { forwardRef } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { PixelText } from './PixelText';
import { COLORS, SPACING, BORDERS, FONTS } from './theme';
import { TarotCard, CardOrientation } from '../types';
import { getCardName, getMeaning, getTalismanLine, getCardImageSource } from '../utils/cards';
import { useTranslation } from '../i18n';

interface ShareableCardProps {
  card: TarotCard;
  orientation: CardOrientation;
  dateString: string;
}

export interface ShareableCardRef {
  capture: () => Promise<string>;
}

export const ShareableCard = forwardRef<ShareableCardRef, ShareableCardProps>(
  ({ card, orientation, dateString }, ref) => {
    const { t } = useTranslation();
    const viewShotRef = React.useRef<ViewShot>(null);
    
    const cardName = getCardName(card);
    const meaning = getMeaning(card, orientation);
    const talismanLine = getTalismanLine(card);
    const cardImageSource = getCardImageSource(card);
    const isReversed = orientation === 'reversed';

    React.useImperativeHandle(ref, () => ({
      capture: async () => {
        if (viewShotRef.current) {
          const uri = await viewShotRef.current.capture?.();
          return uri || '';
        }
        return '';
      },
    }));

    return (
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'jpg', quality: 0.9, result: 'tmpfile' }}
        style={styles.container}
      >
        <View style={styles.card} collapsable={false}>
          <View style={styles.header}>
            <PixelText variant="caption" style={styles.dateText}>
              {dateString}
            </PixelText>
            <PixelText variant="caption" style={styles.appName}>
              DOT TAROT
            </PixelText>
          </View>

          <View style={styles.cardImageArea}>
            <View style={[styles.cardImageContainer, isReversed && styles.reversed]}>
              <Image
                source={cardImageSource}
                style={styles.cardImage}
                resizeMode="cover"
              />
            </View>
          </View>

          <View style={styles.cardInfo}>
            <PixelText variant="heading" style={styles.cardName}>
              {cardName}
            </PixelText>
            <View
              style={[
                styles.orientationBadge,
                { backgroundColor: isReversed ? COLORS.reversed : COLORS.upright },
              ]}
            >
              <PixelText variant="caption" style={styles.orientationText}>
                {isReversed ? t('card.reversed') : t('card.upright')}
              </PixelText>
            </View>
          </View>

          <View style={styles.talismanSection}>
            <PixelText variant="body" style={styles.talismanText}>
              "{talismanLine}"
            </PixelText>
          </View>

          <View style={styles.meaningSection}>
            <PixelText variant="caption" style={styles.meaningText} numberOfLines={4}>
              {meaning}
            </PixelText>
          </View>

          <View style={styles.footer}>
            <PixelText variant="caption" style={styles.footerText}>
              {t('share.tagline')}
            </PixelText>
          </View>
        </View>
      </ViewShot>
    );
  }
);

ShareableCard.displayName = 'ShareableCard';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
  card: {
    width: 360,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dateText: {
    color: COLORS.textMuted,
  },
  appName: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  cardImageArea: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cardImageContainer: {
    width: 160,
    height: 240,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  reversed: {
    transform: [{ rotate: '180deg' }],
  },
  cardInfo: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardName: {
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  orientationBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  orientationText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  talismanSection: {
    backgroundColor: COLORS.primaryDark,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.primary,
  },
  talismanText: {
    color: COLORS.accent,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  meaningSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
  },
  meaningText: {
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: FONTS.sm * 1.6,
  },
  footer: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: BORDERS.thin,
    borderTopColor: COLORS.border,
  },
  footerText: {
    color: COLORS.textMuted,
  },
});
