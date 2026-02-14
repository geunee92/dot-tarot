import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { COLORS } from './theme';

interface PixelParticlesProps {
  count?: number;
  colors?: string[];
  size?: number;
  speed?: number;
  active?: boolean;
  style?: ViewStyle;
}

interface ParticleConfig {
  id: number;
  x: number; // percentage 0-100
  delay: number;
  duration: number;
  color: string;
  particleSize: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Particle = ({ config, active, speed }: { config: ParticleConfig; active: boolean; speed: number }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      // Reset values
      translateY.value = 0;
      opacity.value = 0;
      translateX.value = 0;

      const duration = config.duration / speed;
      const delay = config.delay;

      // Vertical movement: from bottom (0) to top (-SCREEN_HEIGHT)
      // We assume the container is roughly screen height or less. 
      // Moving by SCREEN_HEIGHT ensures it goes off screen.
      translateY.value = withDelay(
        delay,
        withRepeat(
          withTiming(-SCREEN_HEIGHT - 50, { // Go well beyond the top
            duration: duration,
            easing: Easing.linear,
          }),
          -1, // Infinite repeat
          false // No reverse
        )
      );

      // Horizontal drift (sine wave approximation)
      translateX.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(15, { duration: duration / 4, easing: Easing.sin }),
            withTiming(-15, { duration: duration / 2, easing: Easing.sin }),
            withTiming(0, { duration: duration / 4, easing: Easing.sin })
          ),
          -1,
          false
        )
      );

      // Opacity: Fade in -> Stay -> Fade out
      opacity.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: duration * 0.1 }), // Fade in
            withTiming(1, { duration: duration * 0.6 }), // Stay visible
            withTiming(0, { duration: duration * 0.3 })  // Fade out
          ),
          -1,
          false
        )
      );
    } else {
      // Fade out gracefully when inactive
      opacity.value = withTiming(0, { duration: 500 });
    }
    
    return () => {
      cancelAnimation(translateY);
      cancelAnimation(translateX);
      cancelAnimation(opacity);
    };
  }, [active, config, speed]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: `${config.x}%`,
          width: config.particleSize,
          height: config.particleSize,
          backgroundColor: config.color,
          bottom: -20, // Start slightly below the container
        },
        animatedStyle,
      ]}
    />
  );
};

export const PixelParticles: React.FC<PixelParticlesProps> = ({
  count = 12,
  colors = [COLORS.accent, COLORS.aurora, COLORS.accentLight],
  size = 4,
  speed = 1,
  active = true,
  style,
}) => {
  const particles = useMemo<ParticleConfig[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3000,
      duration: 3000 + Math.random() * 4000,
      color: colors[i % colors.length],
      particleSize: Math.max(2, size + Math.floor(Math.random() * 3) - 1),
    })),
    [count, colors, size]
  );

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {particles.map((p) => (
        <Particle key={p.id} config={p} active={active} speed={speed} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 10,
  },
  particle: {
    position: 'absolute',
  },
});
