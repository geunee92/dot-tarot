import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  PixelText,
  CalendarGrid,
  LoadingSpinner,
  GradientBackground,
  COLORS,
  SPACING,
  FONTS,
  BORDERS,
  RADIUS,
  SHADOWS,
} from '../components';
import { useDrawStore } from '../stores/drawStore';
import { useSpreadStore } from '../stores/spreadStore';
import { useRewardStore, getMilestoneProgress } from '../stores/rewardStore';
import { useSettingsStore } from '../stores/settingsStore';
import { TrainingLogScreenProps } from '../navigation/types';
import { BackSkin, REWARD_MILESTONES } from '../types';
import { BACK_SKINS } from '../data';
import { useTranslation } from '../i18n';
import {
  getLocalDateKey,
  getMonthKey,
  getPreviousMonthKey,
  getNextMonthKey,
} from '../utils/date';

export function TrainingLogScreen({ navigation }: TrainingLogScreenProps) {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(getMonthKey());

  const isDrawHydrated = useDrawStore((s) => s.isHydrated);
  const isSpreadHydrated = useSpreadStore((s) => s.isHydrated);
  const isRewardHydrated = useRewardStore((s) => s.isHydrated);
  const isSettingsHydrated = useSettingsStore((s) => s.isHydrated);

  const loadDrawsForMonth = useDrawStore((s) => s.loadDrawsForMonth);
  const loadSpreadsForDate = useSpreadStore((s) => s.loadSpreadsForDate);

  const unlockedSkinIds = useRewardStore((s) => s.unlockedSkins);
  const selectedSkinId = useRewardStore((s) => s.selectedSkinId);
  const selectSkin = useRewardStore((s) => s.selectSkin);

  const isHydrated = isDrawHydrated && isSpreadHydrated && isRewardHydrated && isSettingsHydrated;

  const draws = useDrawStore((s) => s.draws);
  const spreadsState = useSpreadStore((s) => s.spreads);

  const unlockedSkins = useMemo(() => {
    return BACK_SKINS.filter((skin) => unlockedSkinIds.includes(skin.id));
  }, [unlockedSkinIds]);

  const lockedSkins = useMemo(() => {
    return BACK_SKINS.filter((skin) => !unlockedSkinIds.includes(skin.id));
  }, [unlockedSkinIds]);

  const drawDates = useMemo(() => Object.keys(draws), [draws]);
  const totalAttendanceDays = drawDates.length;
  
  const nextMilestone = useMemo(() => {
    for (const milestone of REWARD_MILESTONES) {
      if (totalAttendanceDays < milestone.days && !unlockedSkinIds.includes(milestone.skinId)) {
        return milestone;
      }
    }
    return null;
  }, [totalAttendanceDays, unlockedSkinIds]);

  const progress = getMilestoneProgress(totalAttendanceDays, nextMilestone);

  useEffect(() => {
    if (isHydrated) {
      loadDrawsForMonth(currentMonth);
      loadSpreadsForDate(getLocalDateKey());
    }
  }, [isHydrated, currentMonth]);

  const drawDatesSet = useMemo(() => {
    return new Set(drawDates);
  }, [drawDates]);

  const spreadDatesSet = useMemo(() => {
    return new Set(
      Object.keys(spreadsState).filter((dateKey) => spreadsState[dateKey].length > 0)
    );
  }, [spreadsState]);

  const reflectionDatesSet = useMemo(() => {
    const dates = new Set<string>();
    Object.entries(draws).forEach(([dateKey, draw]) => {
      if (draw.reflection) dates.add(dateKey);
    });
    Object.entries(spreadsState).forEach(([dateKey, spreadList]) => {
      if (spreadList.some((s) => s.reflection)) dates.add(dateKey);
    });
    return dates;
  }, [draws, spreadsState]);

  const handleCalendarDayPress = useCallback((dateKey: string) => {
    if (!dateKey) return;
    if (!drawDatesSet.has(dateKey) && !spreadDatesSet.has(dateKey)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('HistoryDetail', { dateKey });
  }, [drawDatesSet, spreadDatesSet, navigation]);

  const handlePreviousMonth = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMonth((prev) => getPreviousMonthKey(prev));
  }, []);

  const handleNextMonth = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMonth((prev) => getNextMonthKey(prev));
  }, []);

  const handleSelectSkin = useCallback(async (skinId: string) => {
    if (skinId === selectedSkinId) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await selectSkin(skinId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [selectSkin, selectedSkinId]);

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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PixelText variant="title" style={styles.title}>
          {t('journey.title')}
        </PixelText>

        <View style={styles.section}>
          <PixelText variant="heading" style={styles.sectionTitle}>
            {t('journey.calendar')}
          </PixelText>
          <CalendarGrid
            monthKey={currentMonth}
            drawDates={drawDatesSet}
            spreadDates={spreadDatesSet}
            reflectionDates={reflectionDatesSet}
            onDayPress={handleCalendarDayPress}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
          />
        </View>

        <View style={styles.section}>
          <PixelText variant="heading" style={styles.sectionTitle}>
            {t('journey.collection')}
          </PixelText>
          
          <View style={styles.progressBox}>
            <View style={styles.progressHeader}>
              <PixelText variant="body" style={styles.progressLabel}>
                {t('deck.thisMonth')}
              </PixelText>
              <PixelText variant="body" style={styles.progressValue}>
                {totalAttendanceDays} {t('deck.days')}
              </PixelText>
            </View>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
            </View>
            
            {nextMilestone ? (
              <PixelText variant="caption" style={styles.nextMilestone}>
                {t('deck.nextRewardAt', { days: nextMilestone.days, remaining: nextMilestone.days - totalAttendanceDays })}
              </PixelText>
            ) : (
              <PixelText variant="caption" style={styles.allUnlocked}>
                {t('deck.allUnlocked')}
              </PixelText>
            )}
          </View>

          <View style={styles.skinsRow}>
            {unlockedSkins.map((skin) => (
              <Pressable
                key={skin.id}
                onPress={() => handleSelectSkin(skin.id)}
                style={[
                  styles.skinItem,
                  skin.id === selectedSkinId && styles.skinItemSelected,
                ]}
              >
                <View style={styles.skinPreview}>
                  <Image
                    source={skin.image}
                    style={styles.skinImage}
                    resizeMode="cover"
                  />
                </View>
                {skin.id === selectedSkinId && (
                  <View style={styles.activeBadge}>
                    <PixelText variant="caption" style={styles.activeBadgeText}>
                      {t('deck.active')}
                    </PixelText>
                  </View>
                )}
              </Pressable>
            ))}
            {lockedSkins.map((skin) => (
              <View key={skin.id} style={[styles.skinItem, styles.skinItemLocked]}>
                <View style={styles.skinPreviewLocked}>
                  <Image
                    source={skin.image}
                    style={[styles.skinImage, styles.skinImageLocked]}
                    resizeMode="cover"
                  />
                  <View style={styles.lockOverlay}>
                    <PixelText variant="body" style={styles.skinSymbol}>🔒</PixelText>
                  </View>
                </View>
                <PixelText variant="caption" style={styles.unlockText}>
                  {skin.requiredDays}d
                </PixelText>
              </View>
            ))}
          </View>
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
  title: {
    color: COLORS.accent,
    textAlign: 'center',
    marginVertical: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  progressBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.block,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    color: COLORS.textMuted,
  },
  progressValue: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.background,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  nextMilestone: {
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  allUnlocked: {
    color: COLORS.success,
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  skinsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  skinItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    ...SHADOWS.blockLight,
  },
  skinItemSelected: {
    borderColor: COLORS.accent,
    borderWidth: BORDERS.thick,
    ...SHADOWS.glow,
  },
  skinItemLocked: {
    opacity: 0.5,
  },
  skinPreview: {
    width: 50,
    height: 75,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
  },
  skinPreviewLocked: {
    width: 50,
    height: 75,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    position: 'relative',
  },
  skinImage: {
    width: '100%',
    height: '100%',
  },
  skinImageLocked: {
    opacity: 0.4,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlayLight,
  },
  skinSymbol: {
    fontSize: FONTS.lg,
    color: COLORS.text,
  },
  activeBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    marginTop: SPACING.xs,
  },
  activeBadgeText: {
    color: COLORS.background,
    fontSize: FONTS.xs,
    fontWeight: 'bold',
  },
  unlockText: {
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    fontSize: FONTS.xs,
  },
});
