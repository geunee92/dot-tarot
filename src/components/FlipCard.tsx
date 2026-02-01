import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  isFlipped?: boolean;
  duration?: number;
  onFlipStart?: () => void;
  onFlipEnd?: (isFlipped: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
  cardStyle?: ViewStyle;
}

export interface FlipCardRef {
  flip: () => void;
  flipTo: (flipped: boolean) => void;
  isFlipped: () => boolean;
}

export const FlipCard = forwardRef<FlipCardRef, FlipCardProps>(
  (
    {
      frontContent,
      backContent,
      isFlipped: controlledFlipped,
      duration = 600,
      onFlipStart,
      onFlipEnd,
      disabled = false,
      style,
      cardStyle,
    },
    ref
  ) => {
    const flipProgress = useSharedValue(controlledFlipped ? 1 : 0);
    const isFlippedInternal = useSharedValue(controlledFlipped ?? false);

    useEffect(() => {
      if (controlledFlipped !== undefined) {
        flipProgress.value = withTiming(controlledFlipped ? 1 : 0, {
          duration,
          easing: Easing.inOut(Easing.ease),
        });
        isFlippedInternal.value = controlledFlipped;
      }
    }, [controlledFlipped]);

    useImperativeHandle(ref, () => ({
      flip: () => {
        const newState = !isFlippedInternal.value;
        triggerFlip(newState);
      },
      flipTo: (flipped: boolean) => {
        triggerFlip(flipped);
      },
      isFlipped: () => isFlippedInternal.value,
    }));

    const triggerFlip = async (toFlipped: boolean) => {
      if (disabled) return;
      
      onFlipStart?.();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      isFlippedInternal.value = toFlipped;
      flipProgress.value = withTiming(
        toFlipped ? 1 : 0,
        { duration, easing: Easing.inOut(Easing.ease) },
        (finished) => {
          'worklet';
          if (finished && onFlipEnd) {
            runOnJS(onFlipEnd)(toFlipped);
          }
        }
      );
    };

    const handlePress = () => {
      if (controlledFlipped === undefined) {
        triggerFlip(!isFlippedInternal.value);
      }
    };

    const backAnimatedStyle = useAnimatedStyle(() => {
      const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
      return {
        transform: [
          { perspective: 1200 },
          { rotateY: `${rotateY}deg` },
        ],
        backfaceVisibility: 'hidden',
        zIndex: flipProgress.value < 0.5 ? 1 : 0,
      };
    });

    const frontAnimatedStyle = useAnimatedStyle(() => {
      const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
      return {
        transform: [
          { perspective: 1200 },
          { rotateY: `${rotateY}deg` },
        ],
        backfaceVisibility: 'hidden',
        zIndex: flipProgress.value >= 0.5 ? 1 : 0,
      };
    });

    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || controlledFlipped !== undefined}
        style={[styles.container, cardStyle, style]}
      >
        <Animated.View style={[styles.card, cardStyle, backAnimatedStyle]}>
          {backContent}
        </Animated.View>
        <Animated.View style={[styles.card, cardStyle, styles.frontCard, frontAnimatedStyle]}>
          {frontContent}
        </Animated.View>
      </Pressable>
    );
  }
);

FlipCard.displayName = 'FlipCard';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backfaceVisibility: 'hidden',
  },
  frontCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
