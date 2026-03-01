import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { XPRewardAnimation } from '../components/Character';
import type { XPRewardAnimationRef } from '../components/Character';
import { LevelUpModal } from '../components/Character';
import { usePetStore } from '../stores/petStore';
import { useCharacterStore } from '../stores/characterStore';
import { useRewardStore } from '../stores/rewardStore';
import { PET_CONFIG } from '../config/pet';
import { getRandomCards, getCardImageSource, getBackSkinImageSource } from '../utils/cards';
import { useTranslation } from '../i18n';
import { MiniGameCard } from '../types/pet';
import {
  PixelText,
  PixelButton,
  GradientBackground,
  Toast,
  COLORS,
  SPACING,
  BORDERS,
  SHADOWS,
} from '../components';
import { MiniGameScreenProps } from '../navigation/types';

const { width, height } = Dimensions.get('window');
const GRID_COLS = 2;
const GRID_ROWS = 4;
const CARD_GAP = SPACING.sm;
// header(~60) + completeSection 여유(~120) + safeArea 등을 제외한 가용 높이
const AVAILABLE_HEIGHT = height - 240;
const CARD_WIDTH_BY_W = (width - SPACING.lg * 2 - CARD_GAP * (GRID_COLS - 1)) / GRID_COLS;
const CARD_HEIGHT_BY_H = (AVAILABLE_HEIGHT - CARD_GAP * (GRID_ROWS - 1)) / GRID_ROWS;
// 높이 기준 카드 폭 역산 (비율 1.4)
const CARD_WIDTH_BY_H = CARD_HEIGHT_BY_H / 1.4;
// 폭/높이 중 작은 쪽 채택 → 한 화면에 맞춤
const CARD_WIDTH = Math.min(CARD_WIDTH_BY_W, CARD_WIDTH_BY_H);

function createGameCards(): MiniGameCard[] {
  const cards = getRandomCards(4);
  const gameCards: MiniGameCard[] = [];

  cards.forEach((card, index) => {
    // Each card appears twice for matching
    gameCards.push({
      id: index * 2,
      cardKey: card.key,
      pairIndex: index,
      isFlipped: false,
      isMatched: false,
    });
    gameCards.push({
      id: index * 2 + 1,
      cardKey: card.key,
      pairIndex: index,
      isFlipped: false,
      isMatched: false,
    });
  });

  // Shuffle
  for (let i = gameCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
  }

  return gameCards;
}

export function MiniGameScreen({ navigation }: MiniGameScreenProps) {
  const { t } = useTranslation();

  const completeMiniGame = usePetStore((s) => s.completeMiniGame);
  const addXP = useCharacterStore((s) => s.addXP);
  const selectedSkin = useRewardStore((s) => s.getSelectedSkin());

  const xpAnimRef = useRef<XPRewardAnimationRef>(null);
  const [cards, setCards] = useState<MiniGameCard[]>(() => createGameCards());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [levelUpUnlocks, setLevelUpUnlocks] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleCardPress = useCallback((index: number) => {
    if (isChecking || isComplete) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndices.length >= 2) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newCards = [...cards];
    newCards[index] = { ...newCards[index], isFlipped: true };
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsChecking(true);
      const [first, second] = newFlipped;
      const isMatch = newCards[first].pairIndex === newCards[second].pairIndex;

      if (isMatch) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[first] = { ...updated[first], isMatched: true };
            updated[second] = { ...updated[second], isMatched: true };
            return updated;
          });
          setFlippedIndices([]);
          setIsChecking(false);
        }, 400);
      } else {
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[first] = { ...updated[first], isFlipped: false };
            updated[second] = { ...updated[second], isFlipped: false };
            return updated;
          });
          setFlippedIndices([]);
          setIsChecking(false);
        }, 800);
      }
    }
  }, [cards, flippedIndices, isChecking, isComplete]);

  // Check game completion
  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.isMatched) && !isComplete) {
      setIsComplete(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Apply rewards
      completeMiniGame();
      const xpResult = addXP('mini_game');

      showToast(t('pet.miniGameCongrats'));

      setTimeout(() => {
        xpAnimRef.current?.show(xpResult.event.totalAmount, xpResult.event.bonusAmount);
        if (xpResult.leveledUp) {
          setNewLevel(xpResult.newLevel);
          setLevelUpUnlocks(xpResult.unlocks);
          setTimeout(() => setShowLevelUp(true), 1500);
        }
      }, 500);
    }
  }, [cards, isComplete]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const renderCard = (card: MiniGameCard, index: number) => {
    const showFront = card.isFlipped || card.isMatched;

    return (
      <Pressable
        key={card.id}
        style={[
          styles.card,
          card.isMatched && styles.cardMatched,
        ]}
        onPress={() => handleCardPress(index)}
        disabled={card.isMatched || card.isFlipped || isChecking}
      >
        {showFront ? (
          <Image
            source={getCardImageSource({ key: card.cardKey } as any)}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={getBackSkinImageSource(selectedSkin.id)}
            style={styles.cardImage}
            resizeMode="cover"
          />
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <GradientBackground variant="aurora" />

      <View style={styles.header}>
        <PixelText variant="heading" style={styles.title}>
          {t('pet.miniGameTitle')}
        </PixelText>
      </View>

      <View style={styles.grid}>
        {cards.map((card, index) => renderCard(card, index))}
      </View>

      {isComplete && (
        <View style={styles.completeSection}>
          <PixelText variant="body" color={COLORS.success} style={styles.completeText}>
            {t('pet.miniGameMoodGain', { amount: PET_CONFIG.MINI_GAME_MOOD_GAIN })}
          </PixelText>
          <PixelButton
            title={t('common.backHome')}
            onPress={handleGoBack}
            variant="accent"
            size="large"
          />
        </View>
      )}

      <XPRewardAnimation ref={xpAnimRef} />

      <LevelUpModal
        visible={showLevelUp}
        newLevel={newLevel}
        unlocks={levelUpUnlocks}
        onDismiss={() => setShowLevelUp(false)}
      />

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
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  title: {
    color: COLORS.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: CARD_GAP,
    paddingHorizontal: SPACING.lg,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    overflow: 'hidden',
    borderBottomWidth: BORDERS.thin * 3,
    borderRightWidth: BORDERS.thin * 3,
    ...SHADOWS.blockLight,
  },
  cardMatched: {
    opacity: 0.6,
    borderColor: COLORS.success,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  completeSection: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    gap: SPACING.lg,
  },
  completeText: {
    textAlign: 'center',
  },
});
