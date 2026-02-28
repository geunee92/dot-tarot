import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { HomeScreenProps } from '../navigation/types';
import { CharacterSprite, CharacterStatus } from '../components/Character';
import { useCharacterStore } from '../stores/characterStore';
import { useDrawStore } from '../stores/drawStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useRewardStore } from '../stores/rewardStore';
import { getEvolutionStageDef } from '../config/progression';
import { useTranslation } from '../i18n';
import { getLocalDateKey } from '../utils/date';
import {
  PixelButton,
  PixelText,
  PixelCard,
  LoadingSpinner,
  GradientBackground,
  COLORS,
  SPACING,
  BORDERS,
  SHADOWS,
} from '../components';

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { t, locale } = useTranslation();
  const [isCreatingDraw, setIsCreatingDraw] = useState(false);

  const level = useCharacterStore((s) => s.level);
  const evolutionStage = useCharacterStore((s) => s.getEvolutionStage());
  const isCharacterHydrated = useCharacterStore((s) => s.isHydrated);

  const isDrawHydrated = useDrawStore((s) => s.isHydrated);
  const isSettingsHydrated = useSettingsStore((s) => s.isHydrated);
  const isRewardHydrated = useRewardStore((s) => s.isHydrated);

  const todaysDraw = useDrawStore((s) => s.getTodaysDraw());
  const hasDrawnToday = useDrawStore((s) => s.hasDrawnToday());
  const hasPendingDrawToday = useDrawStore((s) => s.hasPendingDrawToday());
  const prepareDraw = useDrawStore((s) => s.prepareDraw);
  const getDrawDates = useDrawStore((s) => s.getDrawDates);
  const checkAndUnlockRewards = useRewardStore((s) => s.checkAndUnlockRewards);

  const isHydrated = isCharacterHydrated && isDrawHydrated && isSettingsHydrated && isRewardHydrated;

  const evolutionStageDef = getEvolutionStageDef(level);
  const stageName = locale === 'ko' ? evolutionStageDef.nameKo : evolutionStageDef.nameEn;

  useEffect(() => {
    if (isHydrated) {
      const dates = getDrawDates();
      checkAndUnlockRewards(dates);
    }
  }, [isHydrated]);

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
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GradientBackground variant="cosmic" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* A. Character Hero Area */}
        <View style={styles.heroSection}>
          <CharacterSprite
            evolutionStage={evolutionStage}
            animationState="idle"
            size="hero"
          />
          <View style={styles.stageBadge}>
            <PixelText variant="caption" style={styles.stageText}>
              {stageName}
            </PixelText>
          </View>
          <CharacterStatus variant="inline" />
        </View>

        {/* B. Daily Talisman Draw (CTA) */}
        <View style={styles.talismanSection}>
          <PixelText variant="heading" style={styles.sectionTitle}>
            {t('home.todaysTalisman')}
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
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  stageBadge: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.accent,
    ...SHADOWS.blockLight,
  },
  stageText: {
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  talismanSection: {
    alignItems: 'center',
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
