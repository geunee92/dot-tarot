import React, { forwardRef } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { PixelText } from './PixelText';
import { COLORS, SPACING, BORDERS, FONTS } from './theme';
import { TarotCard, CardOrientation } from '../types';
import { getCardName, getMeaning, getTalismanLine, getCardImageSource } from '../utils/cards';
import { useTranslation } from '../i18n';

const SCALE = 3;

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
        options={{ format: 'png', quality: 1, result: 'tmpfile' }}
        style={styles.container}
      >
        <View style={styles.card} collapsable={false}>
          <View style={styles.header}>
            <View style={styles.brandingContainer}>
              <PixelText variant="heading" style={styles.appName}>
                DOT TAROT
              </PixelText>
              <View style={styles.brandingLine} />
            </View>
            <PixelText variant="caption" style={styles.dateText}>
              {dateString}
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
            <View style={styles.ctaContainer}>
              <PixelText variant="body" style={styles.ctaText}>
                {t('share.cta')}
              </PixelText>
              <PixelText variant="caption" style={styles.ctaSubtext}>
                {t('share.ctaSubtext')}
              </PixelText>
            </View>
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
    width: 360 * SCALE,
    backgroundColor: COLORS.background,
    padding: SPACING.lg * SCALE,
    borderWidth: BORDERS.thick * SCALE,
    borderColor: COLORS.accent,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg * SCALE,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: SPACING.sm * SCALE,
  },
  appName: {
    color: COLORS.accent,
    fontSize: FONTS.xl * SCALE,
    letterSpacing: 4 * SCALE,
  },
  brandingLine: {
    width: 120 * SCALE,
    height: 3 * SCALE,
    backgroundColor: COLORS.accent,
    marginTop: SPACING.xs * SCALE,
  },
  dateText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sm * SCALE,
  },
  cardImageArea: {
    alignItems: 'center',
    marginBottom: SPACING.lg * SCALE,
  },
  cardImageContainer: {
    width: 200 * SCALE,
    height: 300 * SCALE,
    borderWidth: BORDERS.thick * SCALE,
    borderColor: COLORS.accent,
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
    marginBottom: SPACING.md * SCALE,
  },
  cardName: {
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm * SCALE,
    fontSize: FONTS.lg * SCALE,
  },
  orientationBadge: {
    paddingHorizontal: SPACING.md * SCALE,
    paddingVertical: SPACING.xs * SCALE,
  },
  orientationText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: FONTS.sm * SCALE,
  },
  talismanSection: {
    backgroundColor: COLORS.primaryDark,
    padding: SPACING.md * SCALE,
    marginBottom: SPACING.md * SCALE,
    borderWidth: BORDERS.thin * SCALE,
    borderColor: COLORS.primary,
  },
  talismanText: {
    color: COLORS.accent,
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: FONTS.md * SCALE,
  },
  meaningSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md * SCALE,
    marginBottom: SPACING.lg * SCALE,
    borderWidth: BORDERS.thin * SCALE,
    borderColor: COLORS.border,
  },
  meaningText: {
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: FONTS.sm * 1.6 * SCALE,
    fontSize: FONTS.sm * SCALE,
  },
  footer: {
    alignItems: 'center',
    paddingTop: SPACING.md * SCALE,
    borderTopWidth: BORDERS.medium * SCALE,
    borderTopColor: COLORS.accent,
  },
  ctaContainer: {
    alignItems: 'center',
  },
  ctaText: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: FONTS.md * SCALE,
    textAlign: 'center',
  },
  ctaSubtext: {
    color: COLORS.textMuted,
    fontSize: FONTS.xs * SCALE,
    marginTop: SPACING.xs * SCALE,
  },
});
