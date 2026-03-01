import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  PixelButton,
  PixelText,
  LoadingSpinner,
  TarotCardFlip,
  TarotCardFlipRef,
  SkeletonText,
  TypingText,
  PixelParticles,
  ReflectionInput,
  COLORS,
  SPACING,
  FONTS,
  BORDERS,
} from '../components';
import { XPRewardAnimation, XPRewardAnimationRef, LevelUpModal } from '../components/Character';
import { generateInterpretation } from '../services/ai';
import { useSpreadStore } from '../stores/spreadStore';
import { useCharacterStore } from '../stores/characterStore';
import { QuestResultScreenProps } from '../navigation/types';
import { SpreadPosition, SpreadCard, ReflectionAccuracy } from '../types';
import { getMeaning, getKeywords } from '../utils/cards';
import { useTranslation } from '../i18n';

const POSITION_KEYS: Record<SpreadPosition, string> = {
  FLOW: 'flow',
  INFLUENCE: 'influence',
  ADVICE: 'advice',
};

export function QuestResultScreen({ route, navigation }: QuestResultScreenProps) {
  const { t } = useTranslation();
  const { dateKey, spreadId, topic, isNewSpread } = route.params;

  const [revealedCards, setRevealedCards] = useState<number[]>(isNewSpread ? [] : [0, 1, 2]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);
  const [aiError, setAiError] = useState(false);
  const cardRefs = useRef<(TarotCardFlipRef | null)[]>([null, null, null]);
  const aiRequestedRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const xpRef = useRef<XPRewardAnimationRef>(null);
  const xpAwardedRef = useRef(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{ visible: boolean; newLevel: number; unlocks: string[] }>({ visible: false, newLevel: 1, unlocks: [] });

  const addXP = useCharacterStore((s) => s.addXP);
  const updateStreak = useCharacterStore((s) => s.updateStreak);

  const spread = useSpreadStore((s) => s.getSpreadById(dateKey, spreadId));
  const loadSpreadsForDate = useSpreadStore((s) => s.loadSpreadsForDate);
  const updateInterpretation = useSpreadStore((s) => s.updateInterpretation);
  const updateSpreadReflection = useSpreadStore((s) => s.updateSpreadReflection);
  const isHydrated = useSpreadStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated && !spread) {
      loadSpreadsForDate(dateKey);
    }
  }, [isHydrated, dateKey, spread]);

  useEffect(() => {
    aiRequestedRef.current = false;
    setAiInterpretation(null);
    setAiError(false);
    xpAwardedRef.current = false;
  }, [spreadId]);

  useEffect(() => {
    if (isNewSpread && revealedCards.length < 3) {
      const timer = setTimeout(() => {
        const nextIndex = revealedCards.length;
        cardRefs.current[nextIndex]?.flip();
      }, 500 + revealedCards.length * 800);
      return () => clearTimeout(timer);
    }
  }, [isNewSpread, revealedCards.length]);

  useEffect(() => {
    if (!spread) return;

    if (spread.aiInterpretation) {
      setAiInterpretation(spread.aiInterpretation);
      return;
    }

    const allRevealed = revealedCards.length === 3;
    if (!allRevealed || aiRequestedRef.current || isLoadingAI) return;

    aiRequestedRef.current = true;
    setIsLoadingAI(true);

    generateInterpretation(spread)
      .then(async (interpretation) => {
        setAiInterpretation(interpretation);

        try {
          await updateInterpretation(dateKey, spreadId, interpretation);
        } catch (e) {
          console.warn('[Store Update Error]', e);
        }

        // Award XP for quest completion (new spreads only, once)
        if (isNewSpread && !xpAwardedRef.current) {
          xpAwardedRef.current = true;
          updateStreak();
          const result = addXP('quest_completion');

          setTimeout(() => {
            xpRef.current?.show(result.event.totalAmount, result.event.bonusAmount);
          }, 500);

          if (result.leveledUp) {
            setTimeout(() => {
              setLevelUpInfo({ visible: true, newLevel: result.newLevel, unlocks: result.unlocks });
            }, 2000);
          }
        }
      })
      .catch((error) => {
        console.error('[AI Interpret Error]', error?.message || error);
        setAiError(true);
      })
      .finally(() => {
        setIsLoadingAI(false);
      });
  }, [spread, revealedCards.length, dateKey, spreadId, updateInterpretation, isLoadingAI]);

  const handleCardFlipComplete = useCallback((index: number) => {
    setRevealedCards((prev) => {
      if (prev.includes(index)) return prev;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return [...prev, index];
    });
  }, []);

  const [isReflectionLoading, setIsReflectionLoading] = useState(false);

  const handleSaveReflection = useCallback(async (accuracy: ReflectionAccuracy, text?: string) => {
    setIsReflectionLoading(true);
    try {
      await updateSpreadReflection(dateKey, spreadId, accuracy, text);
    } finally {
      setIsReflectionLoading(false);
    }
  }, [dateKey, spreadId, updateSpreadReflection]);

  const handleGoBack = useCallback(() => {
    navigation.navigate('MainTabs', { screen: 'HomeTab' });
  }, [navigation]);

  const handleGoToSpreads = useCallback(() => {
    navigation.navigate('MainTabs', { screen: 'SpreadTab' });
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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <PixelText variant="heading" style={styles.topicTitle}>
            {t(`topics.${topic.toLowerCase()}`)} {t('spread.resultTitle')}
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
                  <View
                    style={styles.cardMeaning}
                    accessibilityLabel={getKeywords(spreadCard.drawnCard.card, spreadCard.drawnCard.orientation).join(', ')}
                  >
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
            {spread.userQuestion && (
              <View style={styles.userQuestionBox}>
                <PixelText variant="caption" style={styles.userQuestionLabel}>
                  {t('spreadResult.yourQuestion')}
                </PixelText>
                <PixelText variant="body" style={styles.userQuestionText}>
                  "{spread.userQuestion}"
                </PixelText>
              </View>
            )}

            <PixelText variant="heading" style={styles.sectionTitle}>
              {t('spreadResult.interpretation')}
            </PixelText>

            {isLoadingAI ? (
              <SkeletonText lines={5} label={t('spreadResult.aiThinking')} />
            ) : aiInterpretation ? (
              <View style={[styles.aiInterpretationBox, { position: 'relative', overflow: 'hidden' }]}>
                {isNewSpread && (
                  <PixelParticles count={6} active={true} speed={0.5} />
                )}
                {isNewSpread ? (
                  <TypingText
                    text={aiInterpretation}
                    speed={20}
                    style={styles.interpretationText}
                  />
                ) : (
                  <PixelText variant="body" style={styles.interpretationText}>
                    {aiInterpretation}
                  </PixelText>
                )}
              </View>
            ) : aiError ? (
              <View style={styles.interpretationBox}>
                <PixelText variant="body" style={styles.interpretationText}>
                  {t(`spreadResult.interpretations.${spread.pattern}.${topic.toLowerCase()}`)}
                </PixelText>
              </View>
            ) : (
              <View style={styles.interpretationBox}>
                <PixelText variant="body" style={styles.interpretationText}>
                  {t(`spreadResult.interpretations.${spread.pattern}.${topic.toLowerCase()}`)}
                </PixelText>
              </View>
            )}
          </View>
        )}

        {allRevealed && aiInterpretation && (
          <View style={styles.reflectionSection}>
            <PixelText variant="heading" style={styles.sectionTitle}>
              {t('reflection.title')}
            </PixelText>
            <ReflectionInput
              question={t('reflection.spreadQuestion')}
              keywords={spread?.cards.map(c => getKeywords(c.drawnCard.card, c.drawnCard.orientation)[0]).filter(Boolean)}
              existingReflection={spread?.reflection}
              onSave={handleSaveReflection}
              isLoading={isReflectionLoading}
              onInputFocus={() => {
                setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
              }}
            />
          </View>
        )}

        {allRevealed && (
          <View style={styles.actionButtons}>
            <PixelButton
              title={t('spread.title')}
              onPress={handleGoToSpreads}
              variant="secondary"
              size="medium"
            />
            <PixelButton
              title={t('common.backHome')}
              onPress={handleGoBack}
              variant="ghost"
              size="medium"
            />
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
      <XPRewardAnimation ref={xpRef} />
      <LevelUpModal
        visible={levelUpInfo.visible}
        newLevel={levelUpInfo.newLevel}
        unlocks={levelUpInfo.unlocks}
        onDismiss={() => setLevelUpInfo(prev => ({ ...prev, visible: false }))}
      />
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
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
    paddingBottom: SPACING.md,
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
  userQuestionBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.accent,
    marginBottom: SPACING.md,
  },
  userQuestionLabel: {
    color: COLORS.accent,
    marginBottom: SPACING.xs,
  },
  userQuestionText: {
    color: COLORS.text,
    fontStyle: 'italic',
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  interpretationBox: {
    backgroundColor: COLORS.primaryDark,
    padding: SPACING.lg,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.primary,
  },
  aiInterpretationBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.accent,
  },
  interpretationText: {
    color: COLORS.text,
    fontSize: FONTS.md,
    lineHeight: FONTS.md * 1.6,
  },
  reflectionSection: {
    marginTop: SPACING.xxl,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xxl,
  },
});
