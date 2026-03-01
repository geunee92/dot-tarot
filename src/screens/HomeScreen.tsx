import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, ScrollView, StyleSheet, Pressable, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { HomeScreenProps } from '../navigation/types';
import { CharacterSprite } from '../components/Character';
import { StatBar, InteractionButton, FeedAnimation } from '../components/Pet';
import type { FeedAnimationRef } from '../components/Pet';
import { useCharacterStore } from '../stores/characterStore';
import { useDrawStore } from '../stores/drawStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useRewardStore } from '../stores/rewardStore';
import { usePetStore } from '../stores/petStore';
import { getEvolutionStageDef, getXPForLevel } from '../config/progression';
import { PET_CONFIG } from '../config/pet';
import { useTranslation } from '../i18n';
import { getLocalDateKey } from '../utils/date';
import { CharacterAnimationState } from '../types/character';
import {
  PixelButton,
  PixelText,
  PixelCard,
  LoadingSpinner,
  GradientBackground,
  PixelParticles,
  Toast,
  COLORS,
  SPACING,
  BORDERS,
  SHADOWS,
} from '../components';

function getAnimationStateFromStats(hunger: number, mood: number): CharacterAnimationState {
  if (hunger < PET_CONFIG.TAROT_MIN_STAT) return 'hungry';
  if (mood < PET_CONFIG.TAROT_MIN_STAT) return 'sad';
  if (hunger < 30 || mood < 30) return 'tired';
  return 'idle';
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { t, locale } = useTranslation();
  const [isCreatingDraw, setIsCreatingDraw] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const feedAnimRef = useRef<FeedAnimationRef>(null);
  const [particlesActive, setParticlesActive] = useState(false);
  const [particleColors, setParticleColors] = useState<string[]>([COLORS.accent]);
  const animTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAnimTimers = useCallback(() => {
    animTimersRef.current.forEach(clearTimeout);
    animTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearAnimTimers();
  }, [clearAnimTimers]);

  // Character store
  const level = useCharacterStore((s) => s.level);
  const currentXP = useCharacterStore((s) => s.currentXP);
  const evolutionStage = useCharacterStore((s) => s.getEvolutionStage());
  const isCharacterHydrated = useCharacterStore((s) => s.isHydrated);
  // Draw store
  const isDrawHydrated = useDrawStore((s) => s.isHydrated);
  const todaysDraw = useDrawStore((s) => s.getTodaysDraw());
  const hasDrawnToday = useDrawStore((s) => s.hasDrawnToday());
  const hasPendingDrawToday = useDrawStore((s) => s.hasPendingDrawToday());
  const prepareDraw = useDrawStore((s) => s.prepareDraw);
  const getDrawDates = useDrawStore((s) => s.getDrawDates);

  // Other stores
  const isSettingsHydrated = useSettingsStore((s) => s.isHydrated);
  const isRewardHydrated = useRewardStore((s) => s.isHydrated);
  const checkAndUnlockRewards = useRewardStore((s) => s.checkAndUnlockRewards);

  // Pet store
  const isPetHydrated = usePetStore((s) => s.isHydrated);
  const hunger = usePetStore((s) => s.stats.hunger);
  const mood = usePetStore((s) => s.stats.mood);
  const applyDecay = usePetStore((s) => s.applyDecay);
  const feed = usePetStore((s) => s.feed);
  const pet = usePetStore((s) => s.pet);
  const canFeed = usePetStore((s) => s.canFeed);
  const canPet = usePetStore((s) => s.canPet);
  const canPlayMiniGame = usePetStore((s) => s.canPlayMiniGame);
  const canDoTarotCheck = usePetStore((s) => s.canDoTarot);
  const getTarotBlockReason = usePetStore((s) => s.getTarotBlockReason);
  const getMiniGameRemainingCount = usePetStore((s) => s.getMiniGameRemainingCount);

  const isHydrated = isCharacterHydrated && isDrawHydrated && isSettingsHydrated && isRewardHydrated && isPetHydrated;

  const evolutionStageDef = getEvolutionStageDef(level);
  const stageName = locale === 'ko' ? evolutionStageDef.nameKo : evolutionStageDef.nameEn;
  const neededXP = getXPForLevel(level);

  // Force re-render periodically for cooldown updates
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  // Animation state based on pet stats
  const [animState, setAnimState] = useState<CharacterAnimationState>('idle');

  useEffect(() => {
    if (isHydrated) {
      setAnimState(getAnimationStateFromStats(hunger, mood));
    }
  }, [isHydrated, hunger, mood]);

  // Apply decay on mount and when returning from background
  useEffect(() => {
    if (isHydrated) {
      applyDecay();
    }
  }, [isHydrated]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && isHydrated) {
        applyDecay();
      }
    });
    return () => subscription.remove();
  }, [isHydrated, applyDecay]);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const checkTarotGating = (): boolean => {
    if (!canDoTarotCheck()) {
      const reason = getTarotBlockReason();
      if (reason === 'hunger') {
        showToast(t('pet.tarotBlocked'));
      } else {
        showToast(t('pet.tarotBlockedMood'));
      }
      return false;
    }
    return true;
  };

  const handleDrawCard = useCallback(async () => {
    if (isCreatingDraw) return;
    if (!checkTarotGating()) return;

    setIsCreatingDraw(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const dateKey = getLocalDateKey();
      await prepareDraw(dateKey);
      navigation.navigate('TrainingResult', { dateKey, isNewDraw: true });
    } finally {
      setIsCreatingDraw(false);
    }
  }, [prepareDraw, navigation, isCreatingDraw, canDoTarotCheck]);

  const handleViewTodaysDraw = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const dateKey = getLocalDateKey();
    navigation.navigate('TrainingResult', { dateKey, isNewDraw: false });
  }, [navigation]);

  const handleFeed = useCallback(() => {
    const result = feed();
    if (result) {
      clearAnimTimers();
      setAnimState('eating');
      feedAnimRef.current?.show(result.hungerGain, '🍚');
      showToast(t('pet.feedSuccess'));
      setParticleColors(['#4ade80', '#22c55e', '#86efac']);
      setParticlesActive(true);
      animTimersRef.current.push(
        setTimeout(() => setParticlesActive(false), 2000),
        setTimeout(() => {
          setAnimState('happy');
          animTimersRef.current.push(
            setTimeout(() => {
              setAnimState(getAnimationStateFromStats(
                usePetStore.getState().stats.hunger,
                usePetStore.getState().stats.mood
              ));
            }, 800)
          );
        }, 1500)
      );
    } else {
      showToast(t('pet.feedCooldown'));
    }
  }, [feed, t, clearAnimTimers]);

  const handlePet = useCallback(() => {
    const result = pet();
    if (result) {
      clearAnimTimers();
      setAnimState('petted');
      feedAnimRef.current?.show(result.moodGain, '💕');
      showToast(t('pet.petSuccess'));
      setParticleColors(['#fbbf24', '#f59e0b', '#fcd34d']);
      setParticlesActive(true);
      animTimersRef.current.push(
        setTimeout(() => setParticlesActive(false), 2000),
        setTimeout(() => {
          setAnimState('happy');
          animTimersRef.current.push(
            setTimeout(() => {
              setAnimState(getAnimationStateFromStats(
                usePetStore.getState().stats.hunger,
                usePetStore.getState().stats.mood
              ));
            }, 800)
          );
        }, 1200)
      );
    } else {
      showToast(t('pet.petCooldown'));
    }
  }, [pet, t, clearAnimTimers]);

  const handlePlay = useCallback(() => {
    if (!canPlayMiniGame()) {
      const remaining = getMiniGameRemainingCount();
      if (remaining <= 0) {
        showToast(t('pet.miniGameLimitReached'));
      } else {
        showToast(t('pet.miniGameCooldown'));
      }
      return;
    }
    navigation.navigate('MiniGame');
  }, [canPlayMiniGame, getMiniGameRemainingCount, navigation, t]);

  const handleTarot = useCallback(() => {
    if (!checkTarotGating()) return;
    navigation.navigate('MainTabs', { screen: 'SpreadTab' });
  }, [navigation, canDoTarotCheck]);

  const handlePetCharacter = useCallback(() => {
    handlePet();
  }, [handlePet]);

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
          <View style={styles.characterContainer}>
            <Pressable onPress={handlePetCharacter}>
              <CharacterSprite
                evolutionStage={evolutionStage}
                animationState={animState}
                size="hero"
              />
            </Pressable>
            <PixelParticles
              count={8}
              colors={particleColors}
              size={3}
              speed={1.5}
              active={particlesActive}
            />
          </View>
          <View style={styles.stageBadge}>
            <PixelText variant="caption" style={styles.stageText}>
              {stageName}
            </PixelText>
          </View>
        </View>

        {/* B. Stats Bars */}
        <View style={styles.statsSection}>
          <StatBar
            icon="🍖"
            label={t('pet.hunger')}
            value={hunger}
            maxValue={100}
          />
          <StatBar
            icon="😊"
            label={t('pet.mood')}
            value={mood}
            maxValue={100}
          />
          <StatBar
            icon="⭐"
            label={t('pet.mastery')}
            value={currentXP}
            maxValue={neededXP}
            suffix={`Lv.${level}`}
          />
        </View>

        {/* C. Interaction Buttons 2x2 */}
        <View style={styles.interactionGrid}>
          <View style={styles.interactionRow}>
            <InteractionButton
              title={t('pet.feed')}
              icon="🍚"
              onPress={handleFeed}
              variant="feed"
              cooldownActive={!canFeed()}
            />
            <InteractionButton
              title={t('pet.petAction')}
              icon="✋"
              onPress={handlePet}
              variant="pet"
              cooldownActive={!canPet()}
            />
          </View>
          <View style={styles.interactionRow}>
            <InteractionButton
              title={t('pet.play')}
              icon="🎮"
              onPress={handlePlay}
              variant="play"
              cooldownActive={!canPlayMiniGame()}
              remainingCount={getMiniGameRemainingCount()}
            />
            <InteractionButton
              title={t('pet.tarot')}
              icon="🔮"
              onPress={handleTarot}
              variant="tarot"
              disabled={!canDoTarotCheck()}
            />
          </View>
        </View>

        {/* D. Daily Talisman Draw */}
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

      <FeedAnimation ref={feedAnimRef} />

      <Toast
        message={toastMessage || ''}
        visible={!!toastMessage}
        onDismiss={() => setToastMessage(null)}
      />
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
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
  },
  characterContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageBadge: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
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
  statsSection: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.blockLight,
  },
  interactionGrid: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  interactionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
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
