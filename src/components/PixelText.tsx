import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { COLORS, FONTS } from './theme';

interface PixelTextProps {
  children: React.ReactNode;
  variant?: 'title' | 'heading' | 'body' | 'caption' | 'talisman';
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  numberOfLines?: number;
}

export function PixelText({
  children,
  variant = 'body',
  color,
  align = 'left',
  style,
  numberOfLines,
}: PixelTextProps) {
  return (
    <Text
      style={[
        styles[variant],
        color && { color },
        { textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
  },
  heading: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  body: {
    fontSize: FONTS.md,
    color: COLORS.text,
    lineHeight: FONTS.md * 1.6,
  },
  caption: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
  },
  talisman: {
    fontSize: FONTS.lg,
    fontWeight: 'bold',
    color: COLORS.accent,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
