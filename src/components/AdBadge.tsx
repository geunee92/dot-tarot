import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDERS, FONTS } from './theme';

interface AdBadgeProps {
  text?: string;
  size?: 'small' | 'medium';
}

export function AdBadge({ text = 'Ad to unlock', size = 'small' }: AdBadgeProps) {
  return (
    <View style={[styles.badge, styles[size]]}>
      <Text style={[styles.icon, size === 'small' ? styles.smallIcon : styles.mediumIcon]}>▶</Text>
      <Text style={[styles.text, size === 'small' ? styles.smallText : styles.mediumText]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.accentLight,
  },
  small: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  medium: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  icon: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  smallIcon: { fontSize: FONTS.xs },
  mediumIcon: { fontSize: FONTS.sm },
  text: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  smallText: { fontSize: FONTS.xs },
  mediumText: { fontSize: FONTS.sm },
});
