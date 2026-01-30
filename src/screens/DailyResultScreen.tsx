import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
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
  COLORS,
  SPACING,
  FONTS,
  BORDERS,
} from '../components';
import { useDrawStore } from '../stores/drawStore';
import { DailyResultScreenProps } from '../navigation/types';
import { getMeaning, getKeywords } from '../utils/cards';

export function DailyResultScreen({ route, navigation }: DailyResultScreenProps) {
  const { dateKey, isNewDraw } = route.params;
  
  const [hasFlipped, setHasFlipped] = useState(!isNewDraw);
  const [memo, setMemo] = useState('');
  const [isSavingMemo, setIsSavingMemo] = useState(false);
  const flipRef = useRef<TarotCardFlipRef>(null);

  const draw = useDrawStore((s) => s.draws[dateKey]);
  const addMemo = useDrawStore((s) => s.addMemo);
  const loadDraw = useDrawStore((s) => s.loadDraw);
  const isHydrated = useDrawStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated && !draw) {
      loadDraw(dateKey);
    }
  }, [isHydrated, dateKey, draw]);

  useEffect(() => {
    if (draw?.memo) {
      setMemo(draw.memo);
    }
  }, [draw?.memo]);

  const handleFlip = useCallback(() => {
    flipRef.current?.flip();
  }, []);

  const handleFlipComplete = useCallback(() => {
    setHasFlipped(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleSaveMemo = useCallback(async () => {
    if (!memo.trim() || isSavingMemo) return;
    
    setIsSavingMemo(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await addMemo(dateKey, memo.trim());
    } finally {
      setIsSavingMemo(false);
    }
  }, [addMemo, dateKey, memo, isSavingMemo]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!draw) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={60} />
          <PixelText variant="body" style={styles.loadingText}>
            Loading card...
          </PixelText>
        </View>
      </SafeAreaView>
    );
  }

  const { card, orientation } = draw.drawnCard;
  const meaning = getMeaning(card, orientation);
  const keywords = getKeywords(card, orientation);
  const isReversed = orientation === 'reversed';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
                title="Reveal Your Card"
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
                  Card Meaning
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

              <View style={styles.talismanSection}>
                <PixelText variant="caption" style={styles.talismanLabel}>
                  Today's Talisman
                </PixelText>
                <PixelText variant="talisman">
                  "{card.talismanLine}"
                </PixelText>
              </View>

              <View style={styles.actionSection}>
                <PixelText variant="caption" style={styles.actionLabel}>
                  Action Tip
                </PixelText>
                <PixelText variant="body" style={styles.actionText}>
                  {card.actionTip}
                </PixelText>
              </View>

              <View style={styles.memoSection}>
                <PixelText variant="heading" style={styles.sectionTitle}>
                  Your Reflection
                </PixelText>
                
                <TextInput
                  style={styles.memoInput}
                  placeholder="Write your thoughts about this card..."
                  placeholderTextColor={COLORS.textDark}
                  value={memo}
                  onChangeText={setMemo}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                
                <PixelButton
                  title={isSavingMemo ? 'Saving...' : 'Save Memo'}
                  onPress={handleSaveMemo}
                  variant="secondary"
                  size="medium"
                  loading={isSavingMemo}
                  disabled={!memo.trim() || memo === draw.memo}
                />
              </View>

              <PixelButton
                title="Back to Home"
                onPress={handleGoBack}
                variant="ghost"
                size="medium"
                style={styles.backButton}
              />
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
  keyboardView: {
    flex: 1,
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
  talismanSection: {
    backgroundColor: COLORS.primaryDark,
    padding: SPACING.lg,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  talismanLabel: {
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  actionSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
  },
  actionLabel: {
    color: COLORS.accent,
    marginBottom: SPACING.sm,
    fontWeight: 'bold',
  },
  actionText: {
    color: COLORS.text,
  },
  memoSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
  },
  memoInput: {
    backgroundColor: COLORS.background,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONTS.md,
    minHeight: 100,
    marginBottom: SPACING.md,
  },
  backButton: {
    alignSelf: 'center',
    marginTop: SPACING.md,
  },
});
