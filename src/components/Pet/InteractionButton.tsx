import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PixelText } from '../PixelText';
import { COLORS, BORDERS, SPACING, SHADOWS } from '../theme';

type InteractionVariant = 'feed' | 'pet' | 'play' | 'tarot';

interface InteractionButtonProps {
  title: string;
  icon: string;
  onPress: () => void;
  disabled?: boolean;
  cooldownActive?: boolean;
  remainingCount?: number;
  variant?: InteractionVariant;
}

const VARIANT_COLORS: Record<InteractionVariant, string> = {
  feed: '#4ade80',
  pet: '#f8b500',
  play: '#00d9ff',
  tarot: '#a855f7',
};

export function InteractionButton({
  title,
  icon,
  onPress,
  disabled = false,
  cooldownActive = false,
  remainingCount,
  variant = 'feed',
}: InteractionButtonProps) {
  const color = VARIANT_COLORS[variant];
  const isDisabled = disabled || cooldownActive;

  const handlePress = () => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { borderColor: isDisabled ? COLORS.border : color },
        isDisabled && styles.disabled,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isDisabled}
    >
      <PixelText variant="body" style={styles.icon}>{icon}</PixelText>
      <PixelText
        variant="caption"
        style={styles.title}
        color={isDisabled ? COLORS.textMuted : color}
      >
        {title}
      </PixelText>
      {cooldownActive && (
        <View style={styles.cooldownBadge}>
          <PixelText variant="caption" style={styles.cooldownText}>⏱</PixelText>
        </View>
      )}
      {remainingCount !== undefined && (
        <PixelText variant="caption" style={styles.countText} color={COLORS.textMuted}>
          {remainingCount}x
        </PixelText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.thin,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    minHeight: 72,
    borderBottomWidth: BORDERS.thin * 3,
    borderRightWidth: BORDERS.thin * 3,
    ...SHADOWS.blockLight,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 8,
    textAlign: 'center',
  },
  cooldownBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
  },
  cooldownText: {
    fontSize: 10,
  },
  countText: {
    fontSize: 7,
    position: 'absolute',
    bottom: SPACING.xs,
    right: SPACING.xs,
  },
});
