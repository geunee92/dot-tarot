import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
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
  SHADOWS,
  BORDERS,
} from '../components';
import { CharacterStatus } from '../components/Character';
import { useDrawStore } from '../stores/drawStore';
import { useCharacterStore } from '../stores/characterStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useRewardStore } from '../stores/rewardStore';
import { TalismanScreenProps } from '../navigation/types';
import { useTranslation } from '../i18n';
import { getLocalDateKey } from '../utils/date';

export function TalismanScreen({ navigation }: TalismanScreenProps) {
  const { t } = useTranslation();
  const [isCreatingDraw, setIsCreatingDraw] = useState(false);

  const isDrawHydrated = useDrawStore((s) => s.isHydrated);
  const isSettingsHydrated = useSettingsStore((s) => s.isHydrated);
  const isRewardHydrated = useRewardStore((s) => s.isHydrated);
  const isCharacterHydrated = useCharacterStore((s) => s.isHydrated);

  const todaysDraw = useDrawStore((s) => s.getTodaysDraw());
  const hasDrawnToday = useDrawStore((s) => s.hasDrawnToday());
  const hasPendingDrawToday = useDrawStore((s) => s.hasPendingDrawToday());
  const prepareDraw = useDrawStore((s) => s.prepareDraw);
  const getDrawDates = useDrawStore((s) => s.getDrawDates);

  const checkAndUnlockRewards = useRewardStore((s) => s.checkAndUnlockRewards);

  const isHydrated = isDrawHydrated && isSettingsHydrated && isRewardHydrated && isCharacterHydrated;

  useEffect(() => {
    if (isHydrated) {
      const dates = getDrawDates();
      checkAndUnlockRewards(dates);
    }
  }, [isHydrated, hasDrawnToday, getDrawDates, checkAndUnlockRewards]);

  useEffect(() => {
    if (isHydrated && hasPendingDrawToday && !hasDrawnToday) {
      const dateKey = getLocalDateKey();
      navigation.navigate('TrainingResult', { dateKey, isNewDraw: true });
    }
  }, [isHydrated, hasPendingDrawToday, hasDrawnToday, navigation]);

  const handleDrawCard = useCallback(async () => {
    if (isCreatingDraw) return;
    setIsCreatingDraw(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const dateKey = getLocalDateKey();
      await prepareDraw(dateKey);
      navigation.navigate('TrainingResult', { dateKey, isNewDraw: true });
    } finally {
      setIsCreatingDraw(false);
    }
  }, [prepareDraw, navigation, isCreatingDraw]);

  const handleViewTodaysDraw = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const dateKey = getLocalDateKey();
    navigation.navigate('TrainingResult', { dateKey, isNewDraw: false });
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
        <View style={styles.statusSection}>
          <CharacterStatus />
        </View>

        <View style={styles.drawSection}>
          <PixelText variant="heading" style={styles.sectionTitle}>
            {t('talisman.title')}
          </PixelText>

          {hasDrawnToday && todaysDraw ? (
            <Pressable onPress={handleViewTodaysDraw} style={styles.drawnCardContainer}>
              <PixelCard
                card={todaysDraw.drawnCard.card}
                orientation={todaysDraw.drawnCard.orientation}
                size="medium"
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
              </View>
              <PixelButton
                title={isCreatingDraw ? t('common.drawing') : t('talisman.drawCard')}
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
    paddingTop: SPACING.md,
  },
  statusSection: {
    marginBottom: SPACING.xl,
  },
  drawSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  drawnCardContainer: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  tapHint: {
    color: COLORS.textMuted,
  },
  drawContainer: {
    alignItems: 'center',
    width: '100%',
    gap: SPACING.xl,
    maxWidth: 300,
  },
  cardPlaceholder: {
    width: 160,
    height: 240,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.block,
  },
  placeholderIcon: {
    fontSize: 48,
  },
});
