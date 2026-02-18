import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useCharacterStore } from '../../stores/characterStore';
import { getEvolutionStageDef, getXPForLevel } from '../../config/progression';
import { PixelText } from '../PixelText';
import { COLORS, BORDERS, RADIUS, SPACING } from '../theme';

interface CharacterStatusProps {
  compact?: boolean;
}

export function CharacterStatus({ compact = false }: CharacterStatusProps) {
  const level = useCharacterStore((s) => s.level);
  const currentXP = useCharacterStore((s) => s.currentXP);
  const streak = useCharacterStore((s) => s.streak);

  const neededXP = getXPForLevel(level);
  const xpPercentage = neededXP > 0 ? currentXP / neededXP : 0;
  
  const evolutionStageDef = getEvolutionStageDef(level);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(xpPercentage, { duration: 500 });
  }, [xpPercentage]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactRow}>
          <PixelText variant="caption" color={COLORS.accent}>
            Lv.{level}
          </PixelText>
          <View style={styles.compactBarBg}>
            <Animated.View
              style={[
                styles.barFill,
                progressStyle,
                { backgroundColor: COLORS.accent },
              ]}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.levelBadge}>
          <PixelText variant="body" color={COLORS.accent}>
            Lv.{level} {evolutionStageDef.nameKo}
          </PixelText>
        </View>
        
        {streak.currentStreak > 0 && (
          <View style={styles.streakBadge}>
            <PixelText variant="caption" color={COLORS.warning}>
              🔥 {streak.currentStreak}일 연속
            </PixelText>
          </View>
        )}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.barFill,
              progressStyle,
              { backgroundColor: COLORS.accent },
            ]}
          />
        </View>
        <PixelText variant="caption" align="right" style={styles.xpText}>
          {currentXP}/{neededXP} XP
        </PixelText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  barFill: {
    height: '100%',
  },
  xpText: {
    opacity: 0.8,
  },
  compactContainer: {
    padding: SPACING.xs,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  compactBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
});
