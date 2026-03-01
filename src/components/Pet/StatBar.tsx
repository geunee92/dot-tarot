import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { PixelText } from '../PixelText';
import { COLORS, BORDERS, SPACING } from '../theme';
import { getStatColor } from '../../config/pet';

interface StatBarProps {
  icon: string;
  label: string;
  value: number;
  maxValue: number;
  suffix?: string;
}

export function StatBar({ icon, label, value, maxValue, suffix }: StatBarProps) {
  const percentage = maxValue > 0 ? value / maxValue : 0;
  // Use percentage-based color when suffix is provided (e.g. mastery/XP bar)
  const normalizedValue = suffix ? percentage * 100 : value;
  const color = getStatColor(normalizedValue);
  const isLow = !suffix && value < 20;

  const progressWidth = useSharedValue(0);
  const barOpacity = useSharedValue(1);

  useEffect(() => {
    progressWidth.value = withTiming(percentage, { duration: 500 });
  }, [percentage]);

  useEffect(() => {
    if (isLow) {
      barOpacity.value = withRepeat(
        withTiming(0.3, { duration: 500 }),
        -1,
        true
      );
    } else {
      barOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [isLow]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const opacityStyle = useAnimatedStyle(() => ({
    opacity: barOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <PixelText variant="caption" style={styles.icon}>{icon}</PixelText>
      <PixelText variant="caption" style={styles.label} color={COLORS.textMuted}>
        {label}
      </PixelText>
      <Animated.View style={[styles.barBg, opacityStyle]}>
        <Animated.View
          style={[
            styles.barFill,
            progressStyle,
            { backgroundColor: color },
          ]}
        />
      </Animated.View>
      <PixelText variant="caption" style={styles.valueText} color={color}>
        {suffix || `${Math.round(value)}%`}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
  },
  label: {
    width: 48,
    fontSize: 8,
  },
  barBg: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  valueText: {
    width: 44,
    fontSize: 8,
    textAlign: 'right',
  },
});
