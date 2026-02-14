import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  TarotCardFlip,
  TarotCardFlipRef,
  LoadingSpinner,
  ReflectionInput,
  COLORS,
  SPACING,
  FONTS,
  BORDERS,
} from '../components';
import { useDrawStore } from '../stores/drawStore';
import { DailyResultScreenProps } from '../navigation/types';
import { getMeaning, getKeywords, getDailyContext } from '../utils/cards';
import { ReflectionAccuracy } from '../types';
import { useTranslation } from '../i18n';

export function DailyResultScreen({ route, navigation }: DailyResultScreenProps) {
  const { t } = useTranslation();
  const { dateKey, isNewDraw } = route.params;
  
  const [hasFlipped, setHasFlipped] = useState(!isNewDraw);
  const flipRef = useRef<TarotCardFlipRef>(null);
  const scrollRef = useRef<ScrollView>(null);

  const confirmedDraw = useDrawStore((s) => s.draws[dateKey]);
  const pendingDraw = useDrawStore((s) => s.pendingDraw);
  const loadDraw = useDrawStore((s) => s.loadDraw);
  const confirmDraw = useDrawStore((s) => s.confirmDraw);
  const clearPendingDraw = useDrawStore((s) => s.clearPendingDraw);
  const updateReflection = useDrawStore((s) => s.updateReflection);
  const isHydrated = useDrawStore((s) => s.isHydrated);

  const draw = confirmedDraw || (pendingDraw?.dateKey === dateKey ? pendingDraw : null);

  useEffect(() => {
    if (isHydrated && !draw) {
      loadDraw(dateKey);
    }
  }, [isHydrated, dateKey, draw]);

  useEffect(() => {
    if (!isNewDraw) return;

    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasFlipped && pendingDraw) {
        clearPendingDraw();
      }
    });

    return unsubscribe;
  }, [navigation, isNewDraw, hasFlipped, pendingDraw, clearPendingDraw]);

  const handleFlip = useCallback(() => {
    flipRef.current?.flip();
  }, []);

  const handleFlipComplete = useCallback(async () => {
    setHasFlipped(true);
    if (isNewDraw) {
      await confirmDraw();
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [isNewDraw, confirmDraw]);

  const [isReflectionLoading, setIsReflectionLoading] = useState(false);

  const handleSaveReflection = useCallback(async (accuracy: ReflectionAccuracy, text?: string) => {
    setIsReflectionLoading(true);
    try {
      await updateReflection(dateKey, accuracy, text);
    } finally {
      setIsReflectionLoading(false);
    }
  }, [dateKey, updateReflection]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!draw) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={60} />
          <PixelText variant="body" style={styles.loadingText}>
            {t('common.loadingCard')}
          </PixelText>
        </View>
      </SafeAreaView>
    );
  }

  const { card, orientation } = draw.drawnCard;
  const meaning = getMeaning(card, orientation);
  const keywords = getKeywords(card, orientation);
  const dailyContext = getDailyContext(card, orientation);
  const isReversed = orientation === 'reversed';

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
        <View style={styles.cardSection}>
          <TarotCardFlip
            ref={flipRef}
            card={card}
            orientation={orientation}
            isFlipped={!isNewDraw}
            onFlipComplete={handleFlipComplete}
            size="large"
          />
          
          {!hasFlipped && isNewDraw && (
            <PixelButton
              title={t('dailyResult.reveal')}
              onPress={handleFlip}
              variant="accent"
              size="large"
              style={styles.revealButton}
            />
          )}
        </View>

        {hasFlipped && (
          <View style={styles.detailsSection}>
            <View style={styles.meaningSection}>
              <PixelText variant="heading" style={styles.sectionTitle}>
                {t('dailyResult.meaning')}
              </PixelText>
              
              <View style={styles.keywordsRow}>
                {keywords.map((kw, i) => (
                  <View
                    key={i}
                    style={[
                      styles.keywordBadge,
                      { backgroundColor: isReversed ? COLORS.reversed : COLORS.upright },
                    ]}
                  >
                    <PixelText variant="caption" style={styles.keywordText}>
                      {kw}
                    </PixelText>
                  </View>
                ))}
              </View>

              <PixelText variant="body" style={styles.meaningText}>
                {meaning}
              </PixelText>
            </View>

            <View style={styles.dailyContextSection}>
              <PixelText variant="caption" style={styles.dailyContextLabel}>
                {t('dailyResult.dailyContext')}
              </PixelText>
              <PixelText variant="body" style={styles.dailyContextText}>
                {dailyContext}
              </PixelText>
            </View>

            <View style={styles.reflectionSection}>
              <PixelText variant="heading" style={styles.sectionTitle}>
                {t('reflection.title')}
              </PixelText>
              <ReflectionInput
                question={t('reflection.question')}
                keywords={keywords}
                existingReflection={draw?.reflection}
                onSave={handleSaveReflection}
                isLoading={isReflectionLoading}
                onInputFocus={() => {
                  setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
                }}
              />
            </View>

            <View style={styles.actionButtons}>
              <PixelButton
                title={t('common.backHome')}
                onPress={handleGoBack}
                variant="ghost"
                size="medium"
              />
            </View>
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: SPACING.xxl,
  },
  cardSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  revealButton: {
    marginTop: SPACING.xl,
  },
  detailsSection: {
    gap: SPACING.xl,
  },
  meaningSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  keywordBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  keywordText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  meaningText: {
    color: COLORS.text,
    lineHeight: FONTS.md * 1.6,
  },
  dailyContextSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.accent,
    borderLeftWidth: 4,
  },
  dailyContextLabel: {
    color: COLORS.accent,
    marginBottom: SPACING.sm,
    fontWeight: 'bold',
  },
  dailyContextText: {
    color: COLORS.text,
    lineHeight: FONTS.md * 1.6,
    fontStyle: 'italic',
  },
  reflectionSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
});
