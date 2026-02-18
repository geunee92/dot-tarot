import React, { useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { PixelText } from '../PixelText';
import { PixelParticles } from '../PixelParticles';
import { getEvolutionStageDef } from '../../config/progression';
import { COLORS, BORDERS, RADIUS, SPACING, SHADOWS } from '../theme';

interface LevelUpModalProps {
  visible: boolean;
  newLevel: number;
  unlocks: string[];
  onDismiss: () => void;
}

const { width } = Dimensions.get('window');

export function LevelUpModal({
  visible,
  newLevel,
  unlocks,
  onDismiss,
}: LevelUpModalProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      scale.value = withSequence(
        withTiming(1.2, { duration: 300, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(1, { duration: 150 })
      );
      opacity.value = withTiming(1, { duration: 300 });
      contentTranslateY.value = withDelay(
        200,
        withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
      );

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      scale.value = 0;
      opacity.value = 0;
      contentTranslateY.value = 50;
    }
  }, [visible]);

  const handleDismiss = () => {
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(onDismiss)();
      }
    });
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const evolutionStage = getEvolutionStageDef(newLevel);
  const isEvolution = unlocks.some((u) => u.startsWith('EVOLUTION_'));

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={handleDismiss}>
        <PixelParticles count={30} colors={[COLORS.accent, COLORS.accentLight, COLORS.aurora]} />
        
        <Animated.View style={[styles.modalContainer, containerStyle]}>
          <View style={styles.header}>
            <PixelText variant="title" color={COLORS.accent} align="center">
              LEVEL UP!
            </PixelText>
          </View>

          <Animated.View style={[styles.content, contentStyle]}>
            <View style={styles.levelBadge}>
              <PixelText variant="heading" color={COLORS.text} align="center">
                {newLevel}
              </PixelText>
            </View>

            {isEvolution && (
              <View style={styles.evolutionContainer}>
                <PixelText variant="body" color={COLORS.aurora} align="center">
                  Evolution Reached!
                </PixelText>
                <PixelText variant="heading" color={COLORS.aurora} align="center">
                  {evolutionStage.nameKo}
                </PixelText>
              </View>
            )}

            {unlocks.length > 0 && (
              <View style={styles.unlocksContainer}>
                <PixelText variant="caption" color={COLORS.textMuted} align="center" style={styles.unlockTitle}>
                  UNLOCKED
                </PixelText>
                {unlocks.map((unlock, index) => (
                  <UnlockItem key={index} unlock={unlock} index={index} />
                ))}
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function UnlockItem({ unlock, index }: { unlock: string; index: number }) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(
      500 + index * 200,
      withTiming(1, { duration: 400 })
    );
    translateX.value = withDelay(
      500 + index * 200,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  let text = unlock;
  if (unlock === 'LOVE') text = '💘 연애 의뢰 해금!';
  else if (unlock === 'MONEY') text = '💰 금전 의뢰 해금!';
  else if (unlock === 'WORK') text = '💼 직업 의뢰 해금!';
  else if (unlock === 'DEEP_READING') text = '🔮 심층 의뢰 해금!';
  else if (unlock.startsWith('EVOLUTION_')) return null; // Handled separately

  return (
    <Animated.View style={[styles.unlockItem, style]}>
      <PixelText variant="body" color={COLORS.text}>
        {text}
      </PixelText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlayHeavy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surfaceLight,
  },
  evolutionContainer: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  unlocksContainer: {
    width: '100%',
    borderTopWidth: BORDERS.thin,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  unlockTitle: {
    marginBottom: SPACING.sm,
    letterSpacing: 2,
  },
  unlockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
});
