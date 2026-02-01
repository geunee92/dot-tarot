import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BACKGROUNDS } from './theme';

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
  const backgroundColor = BACKGROUNDS[variant];

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
