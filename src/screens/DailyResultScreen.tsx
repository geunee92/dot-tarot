import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import {
  PixelButton,
  PixelText,
  TarotCardFlip,
  TarotCardFlipRef,
  LoadingSpinner,
  ShareableCard,
  ShareableCardRef,
  COLORS,
  SPACING,
  FONTS,
  BORDERS,
} from '../components';
import { useDrawStore } from '../stores/drawStore';
import { DailyResultScreenProps } from '../navigation/types';
import { getMeaning, getKeywords, getTalismanLine, getActionTip } from '../utils/cards';
import { useTranslation, getLocale } from '../i18n';
import { parseDateKey } from '../utils/date';

export function DailyResultScreen({ route, navigation }: DailyResultScreenProps) {
  const { t } = useTranslation();
  const { dateKey, isNewDraw } = route.params;
  
  const [hasFlipped, setHasFlipped] = useState(!isNewDraw);
  const [memo, setMemo] = useState('');
  const [isSavingMemo, setIsSavingMemo] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const flipRef = useRef<TarotCardFlipRef>(null);
  const shareableCardRef = useRef<ShareableCardRef>(null);

  const confirmedDraw = useDrawStore((s) => s.draws[dateKey]);
  const pendingDraw = useDrawStore((s) => s.pendingDraw);
  const addMemo = useDrawStore((s) => s.addMemo);
  const loadDraw = useDrawStore((s) => s.loadDraw);
  const confirmDraw = useDrawStore((s) => s.confirmDraw);
  const clearPendingDraw = useDrawStore((s) => s.clearPendingDraw);
  const isHydrated = useDrawStore((s) => s.isHydrated);

  const draw = confirmedDraw || (pendingDraw?.dateKey === dateKey ? pendingDraw : null);

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

  const handleShare = useCallback(async () => {
    if (isSharing) return;
    
    setIsSharing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      if (!shareableCardRef.current) {
        throw new Error('ShareableCard ref not ready');
      }
      
      const uri = await shareableCardRef.current.capture();
      if (!uri) {
        throw new Error('Failed to capture image');
      }
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(t('share.error'), 'Sharing is not available on this device');
        return;
      }
      
      await Sharing.shareAsync(`file://${uri}`, {
        mimeType: 'image/jpeg',
        UTI: 'image/jpeg',
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert(t('share.error'));
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, t]);

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
  const talismanLine = getTalismanLine(card);
  const actionTip = getActionTip(card);
  const isReversed = orientation === 'reversed';

  const locale = getLocale();
  const parsedDate = parseDateKey(dateKey);
  const dateString = parsedDate
    ? parsedDate.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : dateKey;

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

              <View style={styles.talismanSection}>
                <PixelText variant="caption" style={styles.talismanLabel}>
                  {t('dailyResult.talisman')}
                </PixelText>
                <PixelText variant="talisman">
                  "{talismanLine}"
                </PixelText>
              </View>

              <View style={styles.actionSection}>
                <PixelText variant="caption" style={styles.actionLabel}>
                  {t('dailyResult.actionTip')}
                </PixelText>
                <PixelText variant="body" style={styles.actionText}>
                  {actionTip}
                </PixelText>
              </View>

              <View style={styles.memoSection}>
                <PixelText variant="heading" style={styles.sectionTitle}>
                  {t('dailyResult.reflection')}
                </PixelText>
                
                <TextInput
                  style={styles.memoInput}
                  placeholder={t('dailyResult.memoPlaceholder')}
                  placeholderTextColor={COLORS.textDark}
                  value={memo}
                  onChangeText={setMemo}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                
                <PixelButton
                  title={isSavingMemo ? t('common.saving') : t('dailyResult.saveMemo')}
                  onPress={handleSaveMemo}
                  variant="secondary"
                  size="medium"
                  loading={isSavingMemo}
                  disabled={!memo.trim() || memo === draw.memo}
                />
              </View>

              <View style={styles.actionButtons}>
                <PixelButton
                  title={isSharing ? t('common.sharing') : t('common.share')}
                  onPress={handleShare}
                  variant="primary"
                  size="medium"
                  loading={isSharing}
                />
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
      
      <ShareableCard
        ref={shareableCardRef}
        card={card}
        orientation={orientation}
        dateString={dateString}
      />
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
});
