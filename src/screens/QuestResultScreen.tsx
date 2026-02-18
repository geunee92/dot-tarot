import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Keyboard,
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
  Toast,
  COLORS,
  SPACING,
  FONTS,
  BORDERS,
  FONT_FAMILY,
} from '../components';
import { XPRewardAnimation, XPRewardAnimationRef, LevelUpModal } from '../components/Character';
import { generateInterpretation, generateFollowUpInterpretation } from '../services/ai';
import { useSpreadStore } from '../stores/spreadStore';
import { useCharacterStore } from '../stores/characterStore';
import { QuestResultScreenProps } from '../navigation/types';
import { SpreadPosition, SpreadCard, FollowUpPosition, FollowUpSpreadCard, ReflectionAccuracy } from '../types';
import { getMeaning, getKeywords } from '../utils/cards';
import { useTranslation } from '../i18n';

const POSITION_KEYS: Record<SpreadPosition, string> = {
  FLOW: 'flow',
  INFLUENCE: 'influence',
  ADVICE: 'advice',
};

const FOLLOWUP_POSITION_KEYS: Record<FollowUpPosition, string> = {
  DEPTH: 'depth',
  HIDDEN: 'hidden',
  OUTCOME: 'outcome',
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const addXP = useCharacterStore((s) => s.addXP);
  const updateStreak = useCharacterStore((s) => s.updateStreak);
  const canAccessDeepReading = useCharacterStore((s) => s.canAccessDeepReading);

  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpCards, setFollowUpCards] = useState<FollowUpSpreadCard[] | null>(null);
  const [revealedFollowUpCards, setRevealedFollowUpCards] = useState<number[]>([]);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);
  const [followUpInterpretation, setFollowUpInterpretation] = useState<string | null>(null);
  const [followUpError, setFollowUpError] = useState(false);
  const followUpCardRefs = useRef<(TarotCardFlipRef | null)[]>([null, null, null]);
  const followUpRequestedRef = useRef(false);

  const spread = useSpreadStore((s) => s.getSpreadById(dateKey, spreadId));
  const loadSpreadsForDate = useSpreadStore((s) => s.loadSpreadsForDate);
  const updateInterpretation = useSpreadStore((s) => s.updateInterpretation);
  const createFollowUp = useSpreadStore((s) => s.createFollowUp);
  const updateFollowUpInterpretation = useSpreadStore((s) => s.updateFollowUpInterpretation);
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
    followUpRequestedRef.current = false;
    setShowFollowUp(false);
    setFollowUpQuestion('');
    setFollowUpCards(null);
    setRevealedFollowUpCards([]);
    setIsLoadingFollowUp(false);
    setFollowUpInterpretation(null);
    setFollowUpError(false);
  }, [spreadId]);

  useEffect(() => {
    if (spread?.followUp) {
      setFollowUpCards(spread.followUp.cards as unknown as FollowUpSpreadCard[]);
      setFollowUpQuestion(spread.followUp.userQuestion);
      setRevealedFollowUpCards([0, 1, 2]);
      if (spread.followUp.aiInterpretation) {
        setFollowUpInterpretation(spread.followUp.aiInterpretation);
      }
    }
  }, [spread?.followUp]);

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
        await updateInterpretation(dateKey, spreadId, interpretation);
        
        // Award XP for quest completion (new spreads only, once)
        if (isNewSpread && !xpAwardedRef.current) {
          xpAwardedRef.current = true;
          updateStreak();
          const result = addXP('quest_completion');
          
          setTimeout(() => {
            xpRef.current?.show(result.event.amount, result.event.bonusAmount);
          }, 500);
          
          if (result.leveledUp) {
            setTimeout(() => {
              setLevelUpInfo({ visible: true, newLevel: result.newLevel, unlocks: result.unlocks });
            }, 2000);
          }
        }
      })
      .catch(() => {
        setAiError(true);
      })
      .finally(() => {
        setIsLoadingAI(false);
      });
  }, [spread, revealedCards.length, dateKey, spreadId, updateInterpretation, isLoadingAI]);

  useEffect(() => {
    if (!spread || !followUpCards) return;
    if (spread.followUp?.aiInterpretation) {
      setFollowUpInterpretation(spread.followUp.aiInterpretation);
      return;
    }

    const allRevealedFollowUp = revealedFollowUpCards.length === 3;
    if (!allRevealedFollowUp || followUpRequestedRef.current || isLoadingFollowUp) return;

    followUpRequestedRef.current = true;
    setIsLoadingFollowUp(true);

    generateFollowUpInterpretation(spread, followUpCards, followUpQuestion)
      .then(async (interpretation) => {
        setFollowUpInterpretation(interpretation);
        await updateFollowUpInterpretation(dateKey, spreadId, interpretation);
      })
      .catch(() => setFollowUpError(true))
      .finally(() => setIsLoadingFollowUp(false));
  }, [
    spread,
    followUpCards,
    revealedFollowUpCards.length,
    dateKey,
    spreadId,
    followUpQuestion,
    isLoadingFollowUp,
    updateFollowUpInterpretation,
  ]);

  const handleCardFlipComplete = useCallback((index: number) => {
    setRevealedCards((prev) => {
      if (prev.includes(index)) return prev;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return [...prev, index];
    });
  }, []);

  const handleDigDeeper = useCallback(() => {
    setShowFollowUp(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleStartFollowUp = useCallback(async () => {
    if (!followUpQuestion.trim() || !spread) return;
    Keyboard.dismiss();

    const result = await createFollowUp(dateKey, spreadId, followUpQuestion.trim());
    if (result?.followUp) {
      followUpRequestedRef.current = false;
      setFollowUpInterpretation(null);
      setFollowUpError(false);
      setFollowUpCards(result.followUp.cards as unknown as FollowUpSpreadCard[]);
      setRevealedFollowUpCards([]);

      setTimeout(() => followUpCardRefs.current[0]?.flip(), 500);
    }
  }, [followUpQuestion, spread, dateKey, spreadId, createFollowUp]);

  const handleFollowUpCardFlip = useCallback((index: number) => {
    setRevealedFollowUpCards((prev) => {
      if (prev.includes(index)) return prev;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const next = [...prev, index];

      if (next.length < 3) {
        setTimeout(() => followUpCardRefs.current[next.length]?.flip(), 800);
      }

      return next;
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

        {allRevealed && aiInterpretation && !showFollowUp && !spread?.followUp && (
          <View style={styles.followUpPrompt}>
            {canAccessDeepReading() ? (
              <>
                <PixelButton
                  title={t('followUp.title')}
                  onPress={handleDigDeeper}
                  variant="accent"
                  size="large"
                  fullWidth
                />
                <PixelText variant="caption" color={COLORS.textMuted} align="center" style={styles.followUpHint}>
                  {t('followUp.hint')}
                </PixelText>
              </>
            ) : (
              <>
                <PixelButton
                  title={`🔒 ${t('followUp.title')}`}
                  onPress={() => setToastMessage('Lv.10 이상 필요합니다')}
                  variant="secondary"
                  size="large"
                  fullWidth
                />
                <PixelText variant="caption" color={COLORS.textMuted} align="center" style={styles.followUpHint}>
                  Lv.10 도달 시 해금
                </PixelText>
              </>
            )}
          </View>
        )}

        {showFollowUp && !followUpCards && (
          <View style={styles.followUpSection}>
            <PixelText variant="heading" style={styles.sectionTitle}>
              {t('followUp.question')}
            </PixelText>
            <View style={styles.followUpInputContainer}>
              <TextInput
                style={[styles.followUpInput, { fontFamily: FONT_FAMILY.korean }]}
                placeholder={t('followUp.placeholder')}
                placeholderTextColor={COLORS.textMuted}
                value={followUpQuestion}
                onChangeText={setFollowUpQuestion}
                maxLength={60}
                multiline={false}
              />
              <PixelText variant="caption" style={styles.charCount}>
                {t('followUp.charCount', { count: followUpQuestion.length })}
              </PixelText>
            </View>
            <PixelButton
              title={t('followUp.startReading')}
              onPress={handleStartFollowUp}
              variant="accent"
              size="medium"
              disabled={!followUpQuestion.trim()}
            />
          </View>
        )}

        {followUpCards && (
          <View style={styles.followUpSection}>
            <PixelText variant="heading" style={styles.sectionTitle}>
              {t('followUp.title')}
            </PixelText>

            {followUpQuestion && (
              <View style={styles.userQuestionBox}>
                <PixelText variant="caption" style={styles.userQuestionLabel}>
                  {t('followUp.question')}
                </PixelText>
                <PixelText variant="body" style={styles.userQuestionText}>
                  "{followUpQuestion}"
                </PixelText>
              </View>
            )}

            <View style={styles.cardsContainer}>
              {followUpCards.map((card: FollowUpSpreadCard, index: number) => {
                const positionKey = FOLLOWUP_POSITION_KEYS[card.position];
                const isRevealed = revealedFollowUpCards.includes(index);

                return (
                  <View key={card.position} style={styles.cardWrapper}>
                    <View style={styles.positionHeader}>
                      <PixelText variant="body" style={styles.positionTitle}>
                        {t(`followUp.positions.${positionKey}`)}
                      </PixelText>
                      <PixelText variant="caption" style={styles.positionDesc}>
                        {t(`followUp.positions.${positionKey}Desc`)}
                      </PixelText>
                    </View>

                    <View style={styles.cardContainer}>
                      <TarotCardFlip
                        ref={(ref) => { followUpCardRefs.current[index] = ref; }}
                        card={card.drawnCard.card}
                        orientation={card.drawnCard.orientation}
                        isFlipped={Boolean(spread?.followUp?.aiInterpretation)}
                        onFlipComplete={() => handleFollowUpCardFlip(index)}
                        size="medium"
                      />
                    </View>

                    {isRevealed && (
                      <View
                        style={styles.cardMeaning}
                        accessibilityLabel={getKeywords(card.drawnCard.card, card.drawnCard.orientation).join(', ')}
                      >
                        <PixelText variant="caption" style={styles.meaningText}>
                          {getMeaning(card.drawnCard.card, card.drawnCard.orientation)}
                        </PixelText>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {revealedFollowUpCards.length === 3 && (
              <View style={styles.interpretationSection}>
                <PixelText variant="heading" style={styles.sectionTitle}>
                  {t('followUp.interpretation')}
                </PixelText>

                {isLoadingFollowUp ? (
                  <SkeletonText lines={5} label={t('followUp.aiThinking')} />
                ) : followUpInterpretation ? (
                  <View style={[styles.aiInterpretationBox, { position: 'relative', overflow: 'hidden' }]}>
                    {isNewSpread && (
                      <PixelParticles count={8} active={true} speed={0.5} />
                    )}
                    {isNewSpread ? (
                      <TypingText
                        text={followUpInterpretation}
                        speed={20}
                        style={styles.interpretationText}
                      />
                    ) : (
                      <PixelText variant="body" style={styles.interpretationText}>
                        {followUpInterpretation}
                      </PixelText>
                    )}
                  </View>
                ) : followUpError ? (
                  <View style={styles.interpretationBox}>
                    <PixelText variant="body" style={styles.interpretationText}>
                      {t('followUp.error')}
                    </PixelText>
                    <PixelButton
                      title={t('followUp.retry')}
                      onPress={() => {
                        followUpRequestedRef.current = false;
                        setFollowUpError(false);
                        setFollowUpInterpretation(null);
                      }}
                      variant="secondary"
                      size="small"
                      style={{ marginTop: SPACING.md }}
                    />
                  </View>
                ) : null}
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
      <Toast
        message={toastMessage || ''}
        visible={!!toastMessage}
        onDismiss={() => setToastMessage(null)}
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
  followUpPrompt: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  followUpHint: {
    opacity: 0.7,
  },
  followUpSection: {
    marginTop: SPACING.xxl,
    gap: SPACING.lg,
  },
  followUpInputContainer: {
    gap: SPACING.xs,
  },
  followUpInput: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    color: COLORS.text,
    padding: SPACING.md,
    fontSize: FONTS.md,
  },
  charCount: {
    color: COLORS.textMuted,
    textAlign: 'right',
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
  backButton: {
    alignSelf: 'center',
    marginTop: SPACING.xxl,
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
