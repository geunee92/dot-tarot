import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { PixelText } from './PixelText';
import { COLORS, SPACING, BORDERS } from './theme';

interface SkeletonTextProps {
  lines?: number;
  showLabel?: boolean;
  label?: string;
}

export function SkeletonText({
  lines = 4,
  showLabel = true,
  label = 'AI is thinking',
}: SkeletonTextProps) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for skeleton lines
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Animated dots
    const dotsAnimation = Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
      ])
    );
    dotsAnimation.start();

    return () => {
      pulse.stop();
      dotsAnimation.stop();
    };
  }, [pulseAnim, dot1, dot2, dot3]);

  // Generate line widths (last line shorter)
  const lineWidths = Array.from({ length: lines }, (_, i) =>
    i === lines - 1 ? '65%' : '100%'
  );

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <PixelText variant="caption" style={styles.label}>
            {label}
          </PixelText>
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { opacity: dot1 }]} />
            <Animated.View style={[styles.dot, { opacity: dot2 }]} />
            <Animated.View style={[styles.dot, { opacity: dot3 }]} />
          </View>
        </View>
      )}

      <View style={styles.linesContainer}>
        {lineWidths.map((width, index) => (
          <Animated.View
            key={index}
            style={[
              styles.line,
              { width: width as any, opacity: pulseAnim },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.textMuted,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: SPACING.xs,
  },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: COLORS.accent,
    marginHorizontal: 2,
  },
  linesContainer: {
    gap: SPACING.sm,
  },
  line: {
    height: 14,
    backgroundColor: COLORS.border,
  },
});
