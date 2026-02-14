import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BACKGROUNDS, GRADIENTS } from './theme';

type BackgroundVariant = keyof typeof BACKGROUNDS;

interface GradientBackgroundProps {
  variant?: BackgroundVariant;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function GradientBackground({
  variant = 'cosmic',
  style,
  children,
}: GradientBackgroundProps) {
  const gradientColors = GRADIENTS[variant];
  const backgroundColor = BACKGROUNDS[variant];

  if (gradientColors) {
    return (
      <LinearGradient
        colors={gradientColors as unknown as [string, string, ...string[]]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.container, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
