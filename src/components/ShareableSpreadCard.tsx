import React, { forwardRef } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { PixelText } from './PixelText';
import { COLORS, SPACING, BORDERS, FONTS } from './theme';
import { SpreadRecord, SpreadPosition } from '../types';
import { getCardName, getCardImageSource } from '../utils/cards';
import { useTranslation } from '../i18n';

const SCALE = 3;

const POSITION_KEYS: Record<SpreadPosition, string> = {
  FLOW: 'flow',
  INFLUENCE: 'influence',
  ADVICE: 'advice',
};

interface ShareableSpreadCardProps {
  spread: SpreadRecord;
  dateString: string;
}

export interface ShareableSpreadCardRef {
  capture: () => Promise<string>;
}

export const ShareableSpreadCard = forwardRef<ShareableSpreadCardRef, ShareableSpreadCardProps>(
  ({ spread, dateString }, ref) => {
    const { t } = useTranslation();
    const viewShotRef = React.useRef<ViewShot>(null);

    React.useImperativeHandle(ref, () => ({
      capture: async () => {
        if (viewShotRef.current) {
          const uri = await viewShotRef.current.capture?.();
          return uri || '';
        }
        return '';
      },
    }));

    const topicKey = spread.topic.toLowerCase();

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

          <View style={styles.topicBadge}>
            <PixelText variant="body" style={styles.topicText}>
              {t(`home.topics.${topicKey}`)} {t('spreadResult.reading')}
            </PixelText>
          </View>

          <View style={styles.cardsRow}>
            {spread.cards.map((spreadCard, index) => {
              const positionKey = POSITION_KEYS[spreadCard.position];
              const isReversed = spreadCard.drawnCard.orientation === 'reversed';
              const cardImageSource = getCardImageSource(spreadCard.drawnCard.card);
              const cardName = getCardName(spreadCard.drawnCard.card);

              return (
                <View key={index} style={styles.cardColumn}>
                  <PixelText variant="caption" style={styles.positionLabel}>
                    {t(`spreadResult.positions.${positionKey}`)}
                  </PixelText>
                  <View style={[styles.cardImageContainer, isReversed && styles.reversed]}>
                    <Image
                      source={cardImageSource}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                  </View>
                  <PixelText variant="caption" style={styles.cardNameText} numberOfLines={2}>
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
              );
            })}
          </View>

          <View style={styles.patternSection}>
            <PixelText variant="caption" style={styles.patternLabel}>
              {t('spreadResult.pattern')}: {spread.pattern}
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

ShareableSpreadCard.displayName = 'ShareableSpreadCard';

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
    marginBottom: SPACING.md * SCALE,
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
  topicBadge: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: SPACING.lg * SCALE,
    paddingVertical: SPACING.sm * SCALE,
    alignSelf: 'center',
    marginBottom: SPACING.lg * SCALE,
    borderWidth: BORDERS.thin * SCALE,
    borderColor: COLORS.primary,
  },
  topicText: {
    color: COLORS.text,
    fontSize: FONTS.md * SCALE,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg * SCALE,
    gap: SPACING.sm * SCALE,
  },
  cardColumn: {
    flex: 1,
    alignItems: 'center',
  },
  positionLabel: {
    color: COLORS.accent,
    fontSize: FONTS.xs * SCALE,
    marginBottom: SPACING.xs * SCALE,
    fontWeight: 'bold',
  },
  cardImageContainer: {
    width: 100 * SCALE,
    height: 150 * SCALE,
    borderWidth: BORDERS.medium * SCALE,
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
  cardNameText: {
    color: COLORS.text,
    fontSize: FONTS.xs * SCALE,
    textAlign: 'center',
    marginTop: SPACING.xs * SCALE,
    height: FONTS.xs * SCALE * 2.5,
  },
  orientationBadge: {
    paddingHorizontal: SPACING.sm * SCALE,
    paddingVertical: 2 * SCALE,
    marginTop: SPACING.xs * SCALE,
  },
  orientationText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: FONTS.xs * SCALE,
  },
  patternSection: {
    alignItems: 'center',
    marginBottom: SPACING.md * SCALE,
  },
  patternLabel: {
    color: COLORS.textMuted,
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
