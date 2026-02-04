import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  PixelButton,
  PixelText,
  PixelCard,
  LoadingSpinner,
  GradientBackground,
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  BORDERS,
} from '../components';
import { useDrawStore } from '../stores/drawStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useRewardStore } from '../stores/rewardStore';
import { DailyScreenProps } from '../navigation/types';
import { useTranslation } from '../i18n';
import { getLocalDateKey } from '../utils/date';

export function DailyScreen({ navigation }: DailyScreenProps) {
  const { t } = useTranslation();
  const [isCreatingDraw, setIsCreatingDraw] = useState(false);

  const isDrawHydrated = useDrawStore((s) => s.isHydrated);
  const isSettingsHydrated = useSettingsStore((s) => s.isHydrated);
  const isRewardHydrated = useRewardStore((s) => s.isHydrated);

  const todaysDraw = useDrawStore((s) => s.getTodaysDraw());
  const hasDrawnToday = useDrawStore((s) => s.hasDrawnToday());
  const hasPendingDrawToday = useDrawStore((s) => s.hasPendingDrawToday());
  const prepareDraw = useDrawStore((s) => s.prepareDraw);
  const getDrawDates = useDrawStore((s) => s.getDrawDates);

  const checkAndUnlockRewards = useRewardStore((s) => s.checkAndUnlockRewards);

  const isHydrated = isDrawHydrated && isSettingsHydrated && isRewardHydrated;

  useEffect(() => {
    if (isHydrated) {
      const dates = getDrawDates();
      checkAndUnlockRewards(dates);
    }
  }, [isHydrated, hasDrawnToday]);

  useEffect(() => {
    if (isHydrated && hasPendingDrawToday && !hasDrawnToday) {
      const dateKey = getLocalDateKey();
      navigation.navigate('DailyResult', { dateKey, isNewDraw: true });
    }
  }, [isHydrated, hasPendingDrawToday, hasDrawnToday, navigation]);

  const handleDrawCard = useCallback(async () => {
    if (isCreatingDraw) return;
    setIsCreatingDraw(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    try {
      const dateKey = getLocalDateKey();
      await prepareDraw(dateKey);
      navigation.navigate('DailyResult', { dateKey, isNewDraw: true });
    } finally {
      setIsCreatingDraw(false);
    }
  }, [prepareDraw, navigation, isCreatingDraw]);

  const handleViewTodaysDraw = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const dateKey = getLocalDateKey();
    navigation.navigate('DailyResult', { dateKey, isNewDraw: false });
  }, [navigation]);

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.container}>
        <GradientBackground variant="cosmic" />
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={60} />
          <PixelText variant="body" style={styles.loadingText}>
            {t('common.loading')}
          </PixelText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GradientBackground variant="cosmic" />
      <View style={styles.content}>
        <PixelText variant="title" style={styles.title}>
          {t('home.title')}
        </PixelText>
        
        <PixelText variant="heading" style={styles.subtitle}>
          {t('home.dailyCard')}
        </PixelText>

        <View style={styles.cardArea}>
          {hasDrawnToday && todaysDraw ? (
            <Pressable onPress={handleViewTodaysDraw} style={styles.cardContainer}>
              <PixelCard
                card={todaysDraw.drawnCard.card}
                orientation={todaysDraw.drawnCard.orientation}
                size="large"
                showFullInfo
              />
              <PixelText variant="caption" style={styles.tapHint}>
                {t('common.tapToView')}
              </PixelText>
            </Pressable>
          ) : (
            <View style={styles.drawContainer}>
              <View style={styles.cardPlaceholder}>
                <PixelText variant="title" style={styles.placeholderIcon}>
                  ✨
                </PixelText>
                <PixelText variant="caption" style={styles.placeholderText}>
                  {t('card.tapReveal')}
                </PixelText>
              </View>
              <PixelButton
                title={isCreatingDraw ? t('common.drawing') : t('home.drawCard')}
                onPress={handleDrawCard}
                variant="accent"
                size="large"
                fullWidth
                loading={isCreatingDraw}
              />
            </View>
          )}
        </View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  title: {
    color: COLORS.accent,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.xxl,
  },
  cardContainer: {
    alignItems: 'center',
  },
  tapHint: {
    marginTop: SPACING.lg,
    color: COLORS.textMuted,
  },
  drawContainer: {
    alignItems: 'center',
    width: '100%',
    gap: SPACING.xl,
  },
  cardPlaceholder: {
    width: 220,
    height: 495,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.block,
  },
  placeholderIcon: {
    fontSize: 48,
  },
  placeholderText: {
    color: COLORS.textMuted,
  },
});
