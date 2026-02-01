import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  PixelText,
  AdBadge,
  LoadingSpinner,
  GradientBackground,
  RewardedAdButton,
  COLORS,
  SPACING,
  FONTS,
  BORDERS,
  SHADOWS,
} from '../components';
import { useSpreadStore } from '../stores/spreadStore';
import { useGatingStore } from '../stores/gatingStore';
import { useSettingsStore } from '../stores/settingsStore';
import { SpreadsScreenProps } from '../navigation/types';
import { SpreadTopic, SpreadRecord } from '../types';
import { useTranslation, getLocale } from '../i18n';
import { getLocalDateKey, parseDateKey } from '../utils/date';

const TOPIC_IDS: { id: SpreadTopic; emoji: string }[] = [
  { id: 'LOVE', emoji: '💕' },
  { id: 'MONEY', emoji: '💰' },
  { id: 'WORK', emoji: '💼' },
];

const TOPIC_EMOJIS: Record<SpreadTopic, string> = {
  LOVE: '💕',
  MONEY: '💰',
  WORK: '💼',
};

export function SpreadsScreen({ navigation }: SpreadsScreenProps) {
  const { t } = useTranslation();
  const [isCreatingSpread, setIsCreatingSpread] = useState<SpreadTopic | null>(null);
  const [selectedAdTopic, setSelectedAdTopic] = useState<SpreadTopic | null>(null);

  const isSpreadHydrated = useSpreadStore((s) => s.isHydrated);
  const isGatingHydrated = useGatingStore((s) => s.isHydrated);
  const isSettingsHydrated = useSettingsStore((s) => s.isHydrated);
  const allSpreads = useSpreadStore((s) => s.spreads);

  const createSpread = useSpreadStore((s) => s.createSpread);
  const getUsedTopicsForDate = useSpreadStore((s) => s.getUsedTopicsForDate);
  const canDoFreeSpread = useGatingStore((s) => s.canDoFreeSpread);
  const useFreeSpread = useGatingStore((s) => s.useFreeSpread);
  const canUseAnotherTopic = useGatingStore((s) => s.canUseAnotherTopic);
  const useAnotherTopic = useGatingStore((s) => s.useAnotherTopic);
  const loadGatingForDate = useGatingStore((s) => s.loadGatingForDate);

  const isHydrated = isSpreadHydrated && isGatingHydrated && isSettingsHydrated;
  
  const usedTopics = useMemo(() => {
    if (!isHydrated) return new Set<SpreadTopic>();
    return new Set(getUsedTopicsForDate());
  }, [isHydrated, allSpreads, getUsedTopicsForDate]);

  const recentSpreads = useMemo(() => {
    const flatSpreads: SpreadRecord[] = [];
    Object.values(allSpreads).forEach((dateSpreads) => {
      flatSpreads.push(...dateSpreads);
    });
    return flatSpreads
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }, [allSpreads]);

  React.useEffect(() => {
    if (isHydrated) {
      loadGatingForDate(getLocalDateKey());
    }
  }, [isHydrated]);

  const handleTopicPress = useCallback(async (topic: SpreadTopic) => {
    if (isCreatingSpread) return;
    
    const dateKey = getLocalDateKey();
    const isFree = canDoFreeSpread(dateKey);
    
    if (!isFree) {
      if (usedTopics.has(topic)) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      setSelectedAdTopic(topic);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
  }, [canDoFreeSpread, useFreeSpread, createSpread, navigation, isCreatingSpread, usedTopics]);

  const handleAdReward = useCallback(async () => {
    if (!selectedAdTopic || isCreatingSpread) return;
    
    const dateKey = getLocalDateKey();
    setIsCreatingSpread(selectedAdTopic);
    
    try {
      await useAnotherTopic(dateKey);
      const spread = await createSpread(selectedAdTopic, dateKey);
      setSelectedAdTopic(null);
      navigation.navigate('SpreadResult', {
        dateKey,
        spreadId: spread.id,
        topic: selectedAdTopic,
        isNewSpread: true,
      });
    } finally {
      setIsCreatingSpread(null);
    }
  }, [selectedAdTopic, isCreatingSpread, useAnotherTopic, createSpread, navigation]);

  const handleCancelAdTopic = useCallback(() => {
    setSelectedAdTopic(null);
  }, []);

  const handleViewSpread = useCallback((spread: SpreadRecord) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('SpreadResult', {
      dateKey: spread.dateKey,
      spreadId: spread.id,
      topic: spread.topic,
      isNewSpread: false,
    });
  }, [navigation]);

  const formatSpreadDate = useCallback((spread: SpreadRecord) => {
    const locale = getLocale();
    const date = parseDateKey(spread.dateKey);
    if (!date) return spread.dateKey;
    return date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  }, []);

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.container}>
        <GradientBackground variant="plum" />
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={60} />
          <PixelText variant="body" style={styles.loadingText}>
            {t('common.loading')}
          </PixelText>
        </View>
      </SafeAreaView>
    );
  }

  const freeSpreadAvailable = canDoFreeSpread();
  const anotherTopicAvailable = canUseAnotherTopic();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GradientBackground variant="plum" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PixelText variant="title" style={styles.title}>
          {t('home.spreadTitle')}
        </PixelText>

        <View style={styles.statusRow}>
          <PixelText variant="caption" style={styles.subtitle}>
            {freeSpreadAvailable
              ? t('spreads.subtitle')
              : t('home.watchAd')}
          </PixelText>
          {!freeSpreadAvailable && (
            <AdBadge text={t('home.freeUsed')} />
          )}
        </View>

        <View style={styles.topicsRow}>
          {TOPIC_IDS.map((topic) => {
            const isSelected = selectedAdTopic === topic.id;
            const isUsed = usedTopics.has(topic.id);
            const noAdQuotaLeft = !anotherTopicAvailable;
            const isDisabledForAd = !freeSpreadAvailable && (isUsed || noAdQuotaLeft);
            const isDisabled = !freeSpreadAvailable && isDisabledForAd;
            
            return (
              <Pressable
                key={topic.id}
                onPress={() => handleTopicPress(topic.id)}
                disabled={isDisabled || isCreatingSpread !== null}
                style={({ pressed }) => [
                  styles.topicCard,
                  pressed && styles.topicCardPressed,
                  isSelected && styles.topicCardSelected,
                  isDisabled && styles.topicCardDisabled,
                ]}
              >
                <PixelText variant="title" style={styles.topicEmoji}>
                  {topic.emoji}
                </PixelText>
                <PixelText
                  variant="caption"
                  style={isDisabled ? styles.topicLabelDisabled : styles.topicLabel}
                >
                  {t(`home.topics.${topic.id.toLowerCase()}`)}
                </PixelText>
                {isCreatingSpread === topic.id && (
                  <LoadingSpinner size={24} color={COLORS.accent} />
                )}
                {!freeSpreadAvailable && isUsed && (
                  <View style={styles.doneBadge}>
                    <PixelText variant="caption" style={styles.doneBadgeText}>✓</PixelText>
                  </View>
                )}
                {!freeSpreadAvailable && !isUsed && !isSelected && anotherTopicAvailable && (
                  <View style={styles.adIconBadge}>
                    <PixelText variant="caption" style={styles.adIconText}>▶</PixelText>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {selectedAdTopic && (
          <View style={styles.adSection}>
            <PixelText variant="body" style={styles.adSectionTitle}>
              {t('home.topics.' + selectedAdTopic.toLowerCase())} {t('spreadResult.reading')}
            </PixelText>
            <RewardedAdButton
              title={t('spreadResult.unlockAnother')}
              subtitle={t('spreadResult.watchAdFor')}
              onRewardEarned={handleAdReward}
              disabled={isCreatingSpread !== null}
            />
            <Pressable onPress={handleCancelAdTopic} style={styles.cancelButton}>
              <PixelText variant="caption" style={styles.cancelText}>
                {t('common.cancel')}
              </PixelText>
            </Pressable>
          </View>
        )}

        {recentSpreads.length > 0 && (
          <View style={styles.historySection}>
            <PixelText variant="heading" style={styles.historySectionTitle}>
              {t('spreads.recentReadings')}
            </PixelText>

            <View style={styles.historyList}>
              {recentSpreads.map((spread) => (
                <Pressable
                  key={spread.id}
                  onPress={() => handleViewSpread(spread)}
                  style={({ pressed }) => [
                    styles.historyCard,
                    pressed && styles.historyCardPressed,
                  ]}
                >
                  <View style={styles.historyHeader}>
                    <View style={styles.historyHeaderLeft}>
                      <PixelText variant="body" style={styles.historyEmoji}>
                        {TOPIC_EMOJIS[spread.topic]}
                      </PixelText>
                      <PixelText variant="body" style={styles.historyTopic}>
                        {t(`home.topics.${spread.topic.toLowerCase()}`)}
                      </PixelText>
                    </View>
                    <PixelText variant="caption" style={styles.historyDate}>
                      {formatSpreadDate(spread)}
                    </PixelText>
                  </View>
                  
                  <View style={styles.miniCardsRow}>
                    {spread.cards.map((sc, i) => (
                      <View key={i} style={styles.miniCard}>
                        <PixelText variant="caption" style={styles.miniCardNumber}>
                          {sc.drawnCard.card.id}
                        </PixelText>
                        <PixelText
                          variant="caption"
                          color={
                            sc.drawnCard.orientation === 'upright'
                              ? COLORS.upright
                              : COLORS.reversed
                          }
                        >
                          {sc.drawnCard.orientation === 'upright' ? '↑' : '↓'}
                        </PixelText>
                      </View>
                    ))}
                    
                    {spread.clarifier && (
                      <View style={[styles.miniCard, styles.clarifierMini]}>
                        <PixelText variant="caption" style={styles.miniCardNumber}>
                          +{spread.clarifier.drawnCard.card.id}
                        </PixelText>
                      </View>
                    )}
                  </View>
                  
                  <PixelText variant="caption" style={styles.tapHint}>
                    {t('common.tapToView')}
                  </PixelText>
                </Pressable>
              ))}
            </View>
          </View>
        )}
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
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  title: {
    color: COLORS.accent,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  subtitle: {
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  topicsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  topicCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    ...SHADOWS.block,
  },
  topicCardPressed: {
    transform: [{ translateY: 2 }],
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.accent,
  },
  topicCardDisabled: {
    opacity: 0.5,
  },
  topicCardSelected: {
    borderColor: COLORS.accent,
    borderWidth: BORDERS.thick,
    backgroundColor: COLORS.surfaceLight,
  },
  topicEmoji: {
    fontSize: FONTS.title,
  },
  topicLabel: {
    color: COLORS.text,
  },
  topicLabelDisabled: {
    color: COLORS.textDark,
  },
  adIconBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.accent,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adIconText: {
    color: COLORS.background,
    fontSize: 10,
  },
  doneBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.success,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBadgeText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  adSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.accent,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  adSectionTitle: {
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  cancelText: {
    color: COLORS.textMuted,
  },
  historySection: {
    marginTop: SPACING.md,
  },
  historySectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  historyList: {
    gap: SPACING.md,
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  historyCardPressed: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.accent,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  historyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  historyEmoji: {
    fontSize: FONTS.lg,
  },
  historyTopic: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: FONTS.lg,
  },
  historyDate: {
    color: COLORS.textMuted,
  },
  miniCardsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  miniCard: {
    width: 50,
    height: 60,
    backgroundColor: COLORS.background,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clarifierMini: {
    borderColor: COLORS.accent,
  },
  miniCardNumber: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  tapHint: {
    color: COLORS.textDark,
    marginTop: SPACING.sm,
  },
});
