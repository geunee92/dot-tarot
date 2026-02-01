import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
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
import { JourneyScreenProps } from '../navigation/types';
import { BackSkin, REWARD_MILESTONES } from '../types';
import { BACK_SKINS } from '../data';
import { useTranslation } from '../i18n';
import {
  getLocalDateKey,
  getMonthKey,
  getPreviousMonthKey,
  getNextMonthKey,
  countAttendanceInMonth,
} from '../utils/date';

export function JourneyScreen({ navigation }: JourneyScreenProps) {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(getMonthKey());

  const isDrawHydrated = useDrawStore((s) => s.isHydrated);
  const isSpreadHydrated = useSpreadStore((s) => s.isHydrated);
  const isRewardHydrated = useRewardStore((s) => s.isHydrated);
  const isSettingsHydrated = useSettingsStore((s) => s.isHydrated);

  const getDrawDates = useDrawStore((s) => s.getDrawDates);
  const loadDrawsForMonth = useDrawStore((s) => s.loadDrawsForMonth);
  const getSpreadsForDate = useSpreadStore((s) => s.getSpreadsForDate);
  const loadSpreadsForDate = useSpreadStore((s) => s.loadSpreadsForDate);

  const unlockedSkinIds = useRewardStore((s) => s.unlockedSkins);
  const selectedSkinId = useRewardStore((s) => s.selectedSkinId);
  const selectSkin = useRewardStore((s) => s.selectSkin);

  const isHydrated = isDrawHydrated && isSpreadHydrated && isRewardHydrated && isSettingsHydrated;

  const unlockedSkins = useMemo(() => {
    return BACK_SKINS.filter((skin) => unlockedSkinIds.includes(skin.id));
  }, [unlockedSkinIds]);

  const lockedSkins = useMemo(() => {
    return BACK_SKINS.filter((skin) => !unlockedSkinIds.includes(skin.id));
  }, [unlockedSkinIds]);

  const drawDates = useMemo(() => getDrawDates(), [isHydrated]);
  const attendanceDays = countAttendanceInMonth(drawDates, currentMonth);
  
  const nextMilestone = useMemo(() => {
    for (const milestone of REWARD_MILESTONES) {
      if (attendanceDays < milestone.days && !unlockedSkinIds.includes(milestone.skinId)) {
        return milestone;
      }
    }
    return null;
  }, [attendanceDays, unlockedSkinIds]);

  const progress = getMilestoneProgress(attendanceDays, nextMilestone);

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
    const spreads = getSpreadsForDate(getLocalDateKey());
    return new Set(spreads.map((s) => s.dateKey));
  }, [isHydrated]);

  const handleCalendarDayPress = useCallback((dateKey: string) => {
    if (!dateKey || !drawDatesSet.has(dateKey)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('HistoryDetail', { dateKey });
  }, [drawDatesSet, navigation]);

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
                {attendanceDays} {t('deck.days')}
              </PixelText>
            </View>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
            </View>
            
            {nextMilestone ? (
              <PixelText variant="caption" style={styles.nextMilestone}>
                {t('deck.nextRewardAt', { days: nextMilestone.days, remaining: nextMilestone.days - attendanceDays })}
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
                <View style={[styles.skinPreview, { backgroundColor: getSkinColor(skin.id) }]}>
                  <PixelText variant="body" style={styles.skinSymbol}>✦</PixelText>
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
                  <PixelText variant="body" style={styles.skinSymbol}>🔒</PixelText>
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

function getSkinColor(skinId: string): string {
  const colors: Record<string, string> = {
    skin_default: COLORS.primary,
    skin_1: '#1e3a5f',
    skin_2: '#5c4033',
    skin_3: '#4a1942',
    skin_special: '#0f0f2d',
  };
  return colors[skinId] || COLORS.primary;
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
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skinPreviewLocked: {
    width: 50,
    height: 70,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skinSymbol: {
    fontSize: FONTS.lg,
    color: COLORS.accent,
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
