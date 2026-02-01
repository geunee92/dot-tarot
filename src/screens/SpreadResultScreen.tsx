import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  PixelButton,
  PixelText,
  PixelCard,
  AdBadge,
  LoadingSpinner,
  TarotCardFlip,
  TarotCardFlipRef,
  COLORS,
  SPACING,
  FONTS,
  BORDERS,
} from '../components';
import { useSpreadStore, getPatternHintKeys, shouldSuggestClarifier } from '../stores/spreadStore';
import { useGatingStore } from '../stores/gatingStore';
import { SpreadResultScreenProps } from '../navigation/types';
import { SpreadPosition, SpreadCard } from '../types';
import { getMeaning } from '../utils/cards';
import { useTranslation } from '../i18n';

const POSITION_KEYS: Record<SpreadPosition, string> = {
  FLOW: 'flow',
  INFLUENCE: 'influence',
  ADVICE: 'advice',
};

export function SpreadResultScreen({ route, navigation }: SpreadResultScreenProps) {
  const { t } = useTranslation();
  const { dateKey, spreadId, topic, isNewSpread } = route.params;
  
  const [revealedCards, setRevealedCards] = useState<number[]>(isNewSpread ? [] : [0, 1, 2]);
  const [showClarifier, setShowClarifier] = useState(false);
  const [isAddingClarifier, setIsAddingClarifier] = useState(false);
  const cardRefs = useRef<(TarotCardFlipRef | null)[]>([null, null, null]);

  const spread = useSpreadStore((s) => s.getSpreadById(dateKey, spreadId));
  const loadSpreadsForDate = useSpreadStore((s) => s.loadSpreadsForDate);
  const addClarifier = useSpreadStore((s) => s.addClarifier);
  const isHydrated = useSpreadStore((s) => s.isHydrated);

  const canUseClarifier = useGatingStore((s) => s.canUseClarifier);
  const useClarifierGate = useGatingStore((s) => s.useClarifier);

  useEffect(() => {
    if (isHydrated && !spread) {
      loadSpreadsForDate(dateKey);
    }
  }, [isHydrated, dateKey, spread]);

  useEffect(() => {
    if (isNewSpread && revealedCards.length < 3) {
      const timer = setTimeout(() => {
        const nextIndex = revealedCards.length;
        cardRefs.current[nextIndex]?.flip();
      }, 500 + revealedCards.length * 800);
      return () => clearTimeout(timer);
    }
  }, [isNewSpread, revealedCards.length]);

  const handleCardFlipComplete = useCallback((index: number) => {
    setRevealedCards((prev) => {
      if (prev.includes(index)) return prev;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return [...prev, index];
    });
  }, []);

  const handleAddClarifier = useCallback(async () => {
    if (!spread || isAddingClarifier) return;
    
    const canUse = canUseClarifier(dateKey);
    if (!canUse) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    
    setIsAddingClarifier(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    try {
      await useClarifierGate(dateKey);
      await addClarifier(dateKey, spreadId);
      setShowClarifier(true);
    } finally {
      setIsAddingClarifier(false);
    }
  }, [spread, canUseClarifier, useClarifierGate, addClarifier, dateKey, spreadId, isAddingClarifier]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!spread) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={60} />
          <PixelText variant="body" style={styles.loadingText}>
            {t('spreadResult.loadingSpread')}
          </PixelText>
        </View>
      </SafeAreaView>
    );
  }

  const allRevealed = revealedCards.length === 3;
  const patternHintKeys = getPatternHintKeys(spread.pattern);
  const suggestClarifier = shouldSuggestClarifier(spread);
  const hasClarifier = !!spread.clarifier;
  const clarifierAvailable = canUseClarifier(dateKey);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <PixelText variant="heading" style={styles.topicTitle}>
            {t(`home.topics.${topic.toLowerCase()}`)} {t('spreadResult.reading')}
          </PixelText>
        </View>

        <View style={styles.cardsContainer}>
          {spread.cards.map((spreadCard: SpreadCard, index: number) => {
            const positionKey = POSITION_KEYS[spreadCard.position];
            const isRevealed = revealedCards.includes(index);
            
            return (
              <View key={spreadCard.position} style={styles.cardWrapper}>
                <View style={styles.positionHeader}>
                  <PixelText variant="body" style={styles.positionTitle}>
                    {t(`spreadResult.positions.${positionKey}`)}
                  </PixelText>
                  <PixelText variant="caption" style={styles.positionDesc}>
                    {t(`spreadResult.positions.${positionKey}Desc`)}
                  </PixelText>
                </View>
                
                <View style={styles.cardContainer}>
                  <TarotCardFlip
                    ref={(ref) => { cardRefs.current[index] = ref; }}
                    card={spreadCard.drawnCard.card}
                    orientation={spreadCard.drawnCard.orientation}
                    isFlipped={!isNewSpread}
                    onFlipComplete={() => handleCardFlipComplete(index)}
                    size="medium"
                  />
                </View>
                
                {isRevealed && (
                  <View style={styles.cardMeaning}>
                    <PixelText variant="caption" style={styles.meaningText}>
                      {getMeaning(spreadCard.drawnCard.card, spreadCard.drawnCard.orientation)}
                    </PixelText>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {allRevealed && (
          <View style={styles.interpretationSection}>
            <PixelText variant="heading" style={styles.sectionTitle}>
              {t('spreadResult.interpretation')}
            </PixelText>
            
            <View style={styles.toneBox}>
              <PixelText variant="caption" style={styles.toneLabel}>
                {t('spreadResult.energyTone')}
              </PixelText>
              <PixelText variant="body" style={styles.toneText}>
                {t(patternHintKeys.toneKey)}
              </PixelText>
            </View>
            
            <View style={styles.outputBox}>
              <PixelText variant="caption" style={styles.outputLabel}>
                {t('spreadResult.suggestedApproach')}
              </PixelText>
              <PixelText variant="body" style={styles.outputText}>
                {t(patternHintKeys.outputStyleKey)}
              </PixelText>
            </View>

            {suggestClarifier && !hasClarifier && (
              <View style={styles.clarifierSection}>
                <PixelText variant="body" style={styles.clarifierHint}>
                  {t('spreadResult.clarifierHint')}
                </PixelText>
                
                {clarifierAvailable ? (
                  <PixelButton
                    title={isAddingClarifier ? t('common.drawing') : t('spreadResult.drawClarifier')}
                    onPress={handleAddClarifier}
                    variant="accent"
                    size="medium"
                    loading={isAddingClarifier}
                  />
                ) : (
                  <View style={styles.adCta}>
                    <AdBadge text={t('spreadResult.watchAdClarifier')} size="medium" />
                  </View>
                )}
              </View>
            )}

            {hasClarifier && spread.clarifier && (
              <View style={styles.clarifierResult}>
                <PixelText variant="heading" style={styles.sectionTitle}>
                  {t('spreadResult.clarifier')}
                </PixelText>
                
                <View style={styles.clarifierCard}>
                  <PixelCard
                    card={spread.clarifier.drawnCard.card}
                    orientation={spread.clarifier.drawnCard.orientation}
                    size="large"
                    showDetails
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {allRevealed && (
          <PixelButton
            title={t('common.backHome')}
            onPress={handleGoBack}
            variant="ghost"
            size="medium"
            style={styles.backButton}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.lg,
    color: COLORS.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  topicTitle: {
    color: COLORS.accent,
  },
  cardsContainer: {
    gap: SPACING.xl,
  },
  cardWrapper: {
    alignItems: 'center',
  },
  positionHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  positionTitle: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: FONTS.lg,
  },
  positionDesc: {
    color: COLORS.textMuted,
  },
  cardContainer: {
    alignItems: 'center',
  },
  cardMeaning: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    width: '100%',
  },
  meaningText: {
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: FONTS.sm * 1.5,
  },
  interpretationSection: {
    marginTop: SPACING.xxl,
    gap: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  toneBox: {
    backgroundColor: COLORS.primaryDark,
    padding: SPACING.lg,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.primary,
  },
  toneLabel: {
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  toneText: {
    color: COLORS.text,
    fontSize: FONTS.lg,
    fontWeight: 'bold',
  },
  outputBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
  },
  outputLabel: {
    color: COLORS.accent,
    marginBottom: SPACING.xs,
    fontWeight: 'bold',
  },
  outputText: {
    color: COLORS.text,
  },
  clarifierSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.warning,
    alignItems: 'center',
    gap: SPACING.md,
  },
  clarifierHint: {
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  adCta: {
    marginTop: SPACING.sm,
  },
  clarifierResult: {
    marginTop: SPACING.lg,
  },
  clarifierCard: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  backButton: {
    alignSelf: 'center',
    marginTop: SPACING.xxl,
  },
});
