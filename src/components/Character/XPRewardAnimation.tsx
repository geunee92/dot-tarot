import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
} from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { PixelText } from '../PixelText';
import { COLORS, SPACING } from '../theme';

export interface XPRewardAnimationRef {
  show: (amount: number, bonusAmount?: number) => void;
}

export const XPRewardAnimation = forwardRef<XPRewardAnimationRef>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [bonus, setBonus] = useState(0);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  useImperativeHandle(ref, () => ({
    show: (amount: number, bonusAmount: number = 0) => {
      setXpAmount(amount);
      setBonus(bonusAmount);
      setVisible(true);

      opacity.value = 0;
      translateY.value = 0;

      opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 500 }, (finished) => {
          if (finished) {
            runOnJS(hide)();
          }
        })
      );

      translateY.value = withTiming(-60, {
        duration: 1800,
        easing: Easing.out(Easing.quad),
      });
    },
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.content, animatedStyle]}>
        <PixelText
          variant="heading"
          color={COLORS.accent}
          style={styles.mainText}
        >
          +{xpAmount} XP
        </PixelText>
        {bonus > 0 && (
          <PixelText variant="caption" color={COLORS.warning}>
            (+{bonus} streak bonus)
          </PixelText>
        )}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
  },
  mainText: {
    textShadowColor: COLORS.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: SPACING.xs,
  },
});
