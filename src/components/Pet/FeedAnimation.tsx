import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { PixelText } from '../PixelText';
import { COLORS, SPACING } from '../theme';

// --- EmojiParticle sub-component ---
interface EmojiParticleProps {
  emoji: string;
  angle: number;
  distance: number;
  delay: number;
}

function EmojiParticle({ emoji, angle, distance, delay }: EmojiParticleProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.5);

  React.useEffect(() => {
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    translateX.value = withDelay(delay, withTiming(dx, { duration: 800, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(delay, withTiming(dy, { duration: 800, easing: Easing.out(Easing.quad) }));
    scale.value = withDelay(delay, withSequence(
      withTiming(1.2, { duration: 200 }),
      withTiming(0.3, { duration: 600 })
    ));
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 600 })
    ));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.emojiParticle, animStyle]}>
      <PixelText variant="body" style={styles.emojiParticleText}>{emoji}</PixelText>
    </Animated.View>
  );
}

// --- Main FeedAnimation ---
export interface FeedAnimationRef {
  show: (amount: number, icon?: string) => void;
}

export const FeedAnimation = forwardRef<FeedAnimationRef>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState(0);
  const [emoji, setEmoji] = useState('🍚');
  const [particleKey, setParticleKey] = useState(0);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  // Generate 5 particles with random angles/distances
  const particles = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      angle: (Math.PI * 2 * i) / 5 + (Math.random() - 0.5) * 0.6,
      distance: 40 + Math.random() * 30,
      delay: i * 80,
    }));
  }, [particleKey]);

  useImperativeHandle(ref, () => ({
    show: (amt: number, icon: string = '🍚') => {
      setAmount(amt);
      setEmoji(icon);
      setVisible(true);
      setParticleKey((k) => k + 1);

      opacity.value = 0;
      translateY.value = 0;
      scale.value = 1;

      // Scale bounce: 1 → 1.4 → 1
      scale.value = withSequence(
        withTiming(1.4, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 300, easing: Easing.inOut(Easing.quad) })
      );

      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 800 }),
        withTiming(0, { duration: 400 }, (finished) => {
          if (finished) {
            runOnJS(hide)();
          }
        })
      );

      translateY.value = withTiming(-50, {
        duration: 1400,
        easing: Easing.out(Easing.quad),
      });
    },
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.content, animatedStyle]}>
        <PixelText variant="body" style={styles.emoji}>{emoji}</PixelText>
        <PixelText
          variant="heading"
          color={COLORS.success}
          style={styles.amountText}
        >
          +{amount}
        </PixelText>
      </Animated.View>
      {/* Emoji particles spreading outward */}
      <View style={styles.particleCenter}>
        {particles.map((p) => (
          <EmojiParticle
            key={`${particleKey}-${p.id}`}
            emoji={emoji}
            angle={p.angle}
            distance={p.distance}
            delay={p.delay}
          />
        ))}
      </View>
    </View>
  );
});

FeedAnimation.displayName = 'FeedAnimation';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  emoji: {
    fontSize: 28,
  },
  amountText: {
    textShadowColor: COLORS.success,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  particleCenter: {
    position: 'absolute',
    width: 0,
    height: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiParticle: {
    position: 'absolute',
  },
  emojiParticleText: {
    fontSize: 20,
  },
});
