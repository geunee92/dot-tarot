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
  PixelButton,
  PixelText,
  PixelCard,
  AdBadge,
  LoadingSpinner,
  CalendarGrid,
  COLORS,
  SPACING,
  FONTS,
  BORDERS,
} from '../components';
import { useDrawStore } from '../stores/drawStore';
import { useSpreadStore } from '../stores/spreadStore';
import { useGatingStore } from '../stores/gatingStore';
import { useRewardStore } from '../stores/rewardStore';
import { HomeScreenProps } from '../navigation/types';
import { SpreadTopic } from '../types';
import {
  getLocalDateKey,
  getMonthKey,
  getPreviousMonthKey,
  getNextMonthKey,
} from '../utils/date';

const TOPICS: { id: SpreadTopic; label: string; emoji: string }[] = [
  { id: 'LOVE', label: 'Love', emoji: '💕' },
  { id: 'MONEY', label: 'Money', emoji: '💰' },
  { id: 'WORK', label: 'Work', emoji: '💼' },
];

export function HomeScreen({ navigation }: HomeScreenProps) {
  const [currentMonth, setCurrentMonth] = useState(getMonthKey());
  const [isCreatingDraw, setIsCreatingDraw] = useState(false);
  const [isCreatingSpread, setIsCreatingSpread] = useState<SpreadTopic | null>(null);

  const isDrawHydrated = useDrawStore((s) => s.isHydrated);
  const isSpreadHydrated = useSpreadStore((s) => s.isHydrated);
  const isGatingHydrated = useGatingStore((s) => s.isHydrated);
  const isRewardHydrated = useRewardStore((s) => s.isHydrated);

  const todaysDraw = useDrawStore((s) => s.getTodaysDraw());
  const hasDrawnToday = useDrawStore((s) => s.hasDrawnToday());
  const createDraw = useDrawStore((s) => s.createDraw);
  const getDrawDates = useDrawStore((s) => s.getDrawDates);
  const loadDrawsForMonth = useDrawStore((s) => s.loadDrawsForMonth);

  const createSpread = useSpreadStore((s) => s.createSpread);
  const loadSpreadsForDate = useSpreadStore((s) => s.loadSpreadsForDate);
  const getSpreadsForDate = useSpreadStore((s) => s.getSpreadsForDate);

  const canDoFreeSpread = useGatingStore((s) => s.canDoFreeSpread);
  const useFreeSpread = useGatingStore((s) => s.useFreeSpread);
  const loadGatingForDate = useGatingStore((s) => s.loadGatingForDate);

  const checkAndUnlockRewards = useRewardStore((s) => s.checkAndUnlockRewards);

  const isHydrated = isDrawHydrated && isSpreadHydrated && isGatingHydrated && isRewardHydrated;

  useEffect(() => {
    if (isHydrated) {
      loadDrawsForMonth(currentMonth);
      loadGatingForDate(getLocalDateKey());
      loadSpreadsForDate(getLocalDateKey());
    }
  }, [isHydrated, currentMonth]);

  useEffect(() => {
    if (isHydrated) {
      const dates = getDrawDates();
      checkAndUnlockRewards(dates);
    }
  }, [isHydrated, hasDrawnToday]);

  const drawDatesSet = useMemo(() => {
    return new Set(getDrawDates());
  }, [getDrawDates()]);

  const spreadDatesSet = useMemo(() => {
    const spreads = getSpreadsForDate(getLocalDateKey());
    return new Set(spreads.map((s) => s.dateKey));
  }, [getSpreadsForDate]);

  const handleDrawCard = useCallback(async () => {
    if (isCreatingDraw) return;
    setIsCreatingDraw(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    try {
      const dateKey = getLocalDateKey();
      await createDraw(dateKey);
      navigation.navigate('DailyResult', { dateKey, isNewDraw: true });
    } finally {
      setIsCreatingDraw(false);
    }
  }, [createDraw, navigation, isCreatingDraw]);

  const handleViewTodaysDraw = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const dateKey = getLocalDateKey();
    navigation.navigate('DailyResult', { dateKey, isNewDraw: false });
  }, [navigation]);

  const handleTopicPress = useCallback(async (topic: SpreadTopic) => {
    if (isCreatingSpread) return;
    
    const dateKey = getLocalDateKey();
    const isFree = canDoFreeSpread(dateKey);
    
    if (!isFree) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    
    setIsCreatingSpread(topic);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    try {
      await useFreeSpread(dateKey);
      const spread = await createSpread(topic, dateKey);
      navigation.navigate('SpreadResult', {
        dateKey,
        spreadId: spread.id,
        topic,
        isNewSpread: true,
      });
    } finally {
      setIsCreatingSpread(null);
    }
  }, [canDoFreeSpread, useFreeSpread, createSpread, navigation, isCreatingSpread]);

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

  const handleDeckPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Deck');
  }, [navigation]);

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={60} />
          <PixelText variant="body" style={styles.loadingText}>
            Loading...
          </PixelText>
        </View>
      </SafeAreaView>
    );
  }

  const freeSpreadAvailable = canDoFreeSpread();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <PixelText variant="title" style={styles.title}>
            Pixel Talisman
          </PixelText>
          <Pressable onPress={handleDeckPress} style={styles.deckButton}>
            <PixelText variant="caption" style={styles.deckButtonText}>
              Card Backs
            </PixelText>
          </Pressable>
        </View>

        <View style={styles.section}>
          <PixelText variant="heading" style={styles.sectionTitle}>
            Daily Card
          </PixelText>
          
          {hasDrawnToday && todaysDraw ? (
            <Pressable onPress={handleViewTodaysDraw} style={styles.todaysCardContainer}>
              <PixelCard
                card={todaysDraw.drawnCard.card}
                orientation={todaysDraw.drawnCard.orientation}
                size="medium"
              />
              <PixelText variant="caption" style={styles.tapHint}>
                Tap to view details
              </PixelText>
            </Pressable>
          ) : (
            <View style={styles.drawButtonContainer}>
              <PixelButton
                title={isCreatingDraw ? 'Drawing...' : "Draw Today's Card"}
                onPress={handleDrawCard}
                variant="accent"
                size="large"
                fullWidth
                loading={isCreatingDraw}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <PixelText variant="heading" style={styles.sectionTitle}>
              3-Card Spread
            </PixelText>
            {!freeSpreadAvailable && (
              <AdBadge text="Free used" />
            )}
          </View>
          
          <PixelText variant="caption" style={styles.topicHint}>
            {freeSpreadAvailable
              ? 'Choose a topic for your daily reading'
              : 'Watch an ad for another reading'}
          </PixelText>

          <View style={styles.topicContainer}>
            {TOPICS.map((topic) => (
              <Pressable
                key={topic.id}
                onPress={() => handleTopicPress(topic.id)}
                disabled={!freeSpreadAvailable || isCreatingSpread !== null}
                style={({ pressed }) => [
                  styles.topicButton,
                  pressed && styles.topicButtonPressed,
                  !freeSpreadAvailable && styles.topicButtonDisabled,
                ]}
              >
                <PixelText variant="body" style={styles.topicEmoji}>
                  {topic.emoji}
                </PixelText>
                <PixelText
                  variant="body"
                  style={!freeSpreadAvailable ? styles.topicLabelDisabled : styles.topicLabel}
                >
                  {topic.label}
                </PixelText>
                {isCreatingSpread === topic.id && (
                  <LoadingSpinner size={20} color={COLORS.accent} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <PixelText variant="heading" style={styles.sectionTitle}>
            Attendance
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  title: {
    color: COLORS.accent,
  },
  deckButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  deckButtonText: {
    color: COLORS.textMuted,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  todaysCardContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  tapHint: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
  },
  drawButtonContainer: {
    paddingVertical: SPACING.md,
  },
  topicHint: {
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  topicContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  topicButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  topicButtonPressed: {
    transform: [{ translateY: 2 }],
    backgroundColor: COLORS.surfaceLight,
  },
  topicButtonDisabled: {
    opacity: 0.5,
  },
  topicEmoji: {
    fontSize: FONTS.xxl,
  },
  topicLabel: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  topicLabelDisabled: {
    color: COLORS.textDark,
  },
});
