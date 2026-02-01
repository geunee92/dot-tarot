import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDERS, FONTS, SHADOWS, FONT_FAMILY } from './theme';

interface PixelButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function PixelButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}: PixelButtonProps) {
  const handlePress = async () => {
    if (disabled || loading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary': return styles.primary;
      case 'secondary': return styles.secondary;
      case 'accent': return styles.accent;
      case 'ghost': return styles.ghost;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small': return styles.small;
      case 'medium': return styles.medium;
      case 'large': return styles.large;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textDark;
    switch (variant) {
      case 'accent': return COLORS.background;
      case 'ghost': return COLORS.textMuted;
      default: return COLORS.text;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return FONTS.xs;
      case 'medium': return FONTS.sm;
      case 'large': return FONTS.md;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.text} size="small" />
      ) : (
        <Text style={[
          styles.text,
          { color: getTextColor(), fontSize: getTextSize() },
          textStyle,
        ]}>{title.toUpperCase()}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: BORDERS.medium,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.block,
  },
  primary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  secondary: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  accent: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accentDark,
    ...SHADOWS.glow,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  small: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    minWidth: 80,
  },
  medium: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    minWidth: 120,
  },
  large: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    minWidth: 160,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ translateY: 3 }],
    opacity: 0.9,
    shadowOffset: { width: 1, height: 1 },
  },
  text: {
    fontFamily: FONT_FAMILY.pixel,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
});
