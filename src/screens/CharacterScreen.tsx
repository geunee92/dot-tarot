import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CharacterScreenProps } from '../navigation/types';
import { CharacterSprite, CharacterStatus } from '../components/Character';
import { useCharacterStore } from '../stores/characterStore';
import { useDrawStore } from '../stores/drawStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useRewardStore } from '../stores/rewardStore';
import { getEvolutionStageDef } from '../config/progression';
import { TOPIC_CONFIGS } from '../config/topics';
import { useTranslation } from '../i18n';
import {
  PixelText,
  GradientBackground,
  LoadingSpinner,
  COLORS,
  SPACING,
  BORDERS,
  SHADOWS,
} from '../components';

export function CharacterScreen({ navigation }: CharacterScreenProps) {
  const { t, locale } = useTranslation();
  const level = useCharacterStore((s) => s.level);
  const streak = useCharacterStore((s) => s.streak);
  const evolutionStage = useCharacterStore((s) => s.getEvolutionStage());
  const isCharacterHydrated = useCharacterStore((s) => s.isHydrated);
  const isDrawHydrated = useDrawStore((s) => s.isHydrated);
  const isSettingsHydrated = useSettingsStore((s) => s.isHydrated);
  const isRewardHydrated = useRewardStore((s) => s.isHydrated);
  const getDrawDates = useDrawStore((s) => s.getDrawDates);
  const checkAndUnlockRewards = useRewardStore((s) => s.checkAndUnlockRewards);

  const isHydrated = isCharacterHydrated && isDrawHydrated && isSettingsHydrated && isRewardHydrated;

  const evolutionStageDef = getEvolutionStageDef(level);
  const stageName = locale === 'ko' ? evolutionStageDef.nameKo : evolutionStageDef.nameEn;

  // Find next unlock
  const nextUnlockConfig = TOPIC_CONFIGS.find((config) => config.requiredLevel > level);

  useEffect(() => {
    if (isHydrated) {
      const dates = getDrawDates();
      checkAndUnlockRewards(dates);
    }
  }, [isHydrated]);

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
        {/* Section 1: Character Sprite & Evolution Badge */}
        <View style={styles.spriteSection}>
          <CharacterSprite
            evolutionStage={evolutionStage}
            animationState="idle"
            size="large"
          />
          <View style={styles.stageBadge}>
            <PixelText variant="caption" style={styles.stageText}>
              {stageName}
            </PixelText>
          </View>
        </View>

        {/* Section 2: Status (Level & XP) */}
        <View style={styles.section}>
          <CharacterStatus />
        </View>

        {/* Section 3: Streak Display */}
        <View style={styles.streakSection}>
          <View style={styles.streakCard}>
            <PixelText variant="title" style={styles.streakIcon}>🔥</PixelText>
            <View style={styles.streakInfo}>
              <PixelText variant="body" style={styles.streakLabel}>
                {t('character.streakDays', { count: streak.currentStreak })}
              </PixelText>
              <PixelText variant="caption" style={styles.streakSub}>
                {t('character.streak')}
              </PixelText>
            </View>
          </View>
        </View>

        {/* Section 4: Unlocked Topics */}
        <View style={styles.section}>
          <PixelText variant="heading" style={styles.sectionTitle}>
            {t('character.unlockedTopics')}
          </PixelText>
          
          <View style={styles.topicsGrid}>
            {TOPIC_CONFIGS.map((config) => {
              const isUnlocked = level >= config.requiredLevel;
              const topicLabel = t(`topics.${config.id.toLowerCase()}`);
              
              return (
                <View 
                  key={config.id} 
                  style={[
                    styles.topicCard, 
                    !isUnlocked && styles.topicCardLocked
                  ]}
                >
                  <View style={styles.topicHeader}>
                    <PixelText style={styles.topicEmoji}>
                      {isUnlocked ? config.emoji : '🔒'}
                    </PixelText>
                    {!isUnlocked && (
                      <View style={styles.lockBadge}>
                        <PixelText variant="caption" style={styles.lockText}>
                          Lv.{config.requiredLevel}
                        </PixelText>
                      </View>
                    )}
                  </View>
                  <PixelText 
                    variant="body" 
                    style={isUnlocked ? styles.topicLabel : styles.topicLabelLocked}
                  >
                    {topicLabel}
                  </PixelText>
                </View>
              );
            })}
          </View>
        </View>

        {/* Section 5: Next Unlock Preview */}
        <View style={styles.nextUnlockSection}>
          <PixelText variant="caption" style={styles.nextUnlockText}>
            {nextUnlockConfig ? (
              t('character.nextUnlockAt', { 
                level: nextUnlockConfig.requiredLevel, 
                feature: t(`topics.${nextUnlockConfig.id.toLowerCase()}`) 
              })
            ) : (
              t('character.maxLevel')
            )}
          </PixelText>
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
  spriteSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  stageBadge: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12, // Pill shape
    borderWidth: BORDERS.thin,
    borderColor: COLORS.accent,
    ...SHADOWS.blockLight,
  },
  stageText: {
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  streakSection: {
    marginBottom: SPACING.xl,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8, // Slightly rounded for pixel feel
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    ...SHADOWS.blockLight,
  },
  streakIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  streakInfo: {
    flex: 1,
  },
  streakLabel: {
    color: COLORS.text,
    marginBottom: 2,
  },
  streakSub: {
    color: COLORS.textMuted,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  topicCard: {
    width: '47%', // Roughly half minus gap
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    ...SHADOWS.blockLight,
  },
  topicCardLocked: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.border,
    opacity: 0.8,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  topicEmoji: {
    fontSize: 24,
  },
  lockBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lockText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  topicLabel: {
    color: COLORS.text,
  },
  topicLabelLocked: {
    color: COLORS.textMuted,
  },
  nextUnlockSection: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderTopWidth: BORDERS.thin,
    borderTopColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  nextUnlockText: {
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
