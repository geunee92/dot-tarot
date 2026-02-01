import React from 'react';
import { Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { COLORS, FONTS } from './theme';

interface GlowTextProps {
  children: React.ReactNode;
  glow?: boolean;
  glowColor?: string;
  style?: TextStyle;
  variant?: 'body' | 'heading' | 'title' | 'talisman';
}

const AnimatedText = Animated.createAnimatedComponent(Text);

export function GlowText({
  children,
  glow = true,
  glowColor = COLORS.accent,
  style,
  variant = 'body',
}: GlowTextProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (glow) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [glow]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const variantStyle = getVariantStyle(variant);
  const shadowStyle = glow ? getShadowStyle(glowColor) : {};

  return (
    <AnimatedText
      style={[variantStyle, shadowStyle, style, glow && animatedStyle]}
    >
      {children}
    </AnimatedText>
  );
}

function getVariantStyle(variant: string): TextStyle {
  switch (variant) {
    case 'title':
      return { fontSize: FONTS.title, fontWeight: 'bold', color: COLORS.accent };
    case 'heading':
      return { fontSize: FONTS.xl, fontWeight: 'bold', color: COLORS.text };
    case 'talisman':
      return { fontSize: FONTS.lg, fontStyle: 'italic', color: COLORS.accent, textAlign: 'center' };
    default:
      return { fontSize: FONTS.md, color: COLORS.text };
  }
}

function getShadowStyle(glowColor: string): ViewStyle {
  return {
    textShadowColor: glowColor,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  } as ViewStyle;
}

const styles = StyleSheet.create({});
