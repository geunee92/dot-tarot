import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDERS, FONTS } from './theme';
import { showRewardedAd, isAdReady, loadAd } from '../services/ads';
import { useGatingStore } from '../stores/gatingStore';

interface RewardedAdButtonProps {
  title: string;
  subtitle?: string;
  onRewardEarned: () => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  style?: object;
}

export function RewardedAdButton({
  title,
  subtitle = 'Watch a short video',
  onRewardEarned,
  onError,
  disabled = false,
  style,
}: RewardedAdButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  
  const canShowAd = useGatingStore((state) => state.canShowAd);
  const markAdShown = useGatingStore((state) => state.markAdShown);
  const getAdCooldownRemaining = useGatingStore((state) => state.getAdCooldownRemaining);

  useEffect(() => {
    const checkCooldown = () => {
      const remaining = getAdCooldownRemaining();
      setCooldownRemaining(remaining);
    };
    
    checkCooldown();
    const interval = setInterval(checkCooldown, 100);
    return () => clearInterval(interval);
  }, []);

  const handlePress = useCallback(async () => {
    if (disabled || isLoading || !canShowAd()) return;
    
    setError(null);
    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const adReady = isAdReady();
    if (!adReady) {
      setError('Ad not ready. Try again.');
      setIsLoading(false);
      loadAd();
      return;
    }

    const success = await showRewardedAd({
      onRewarded: () => {
        markAdShown();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onRewardEarned();
      },
      onError: (err) => {
        setError(err.message);
        onError?.(err);
      },
      onClosed: () => {
        setIsLoading(false);
      },
    });

    if (!success) {
      setIsLoading(false);
    }
  }, [disabled, isLoading, canShowAd, markAdShown, onRewardEarned, onError]);

  const isDisabled = disabled || isLoading || cooldownRemaining > 0;
  const adNotReady = !isAdReady() && !isLoading;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
        style,
      ]}
    >
      <View style={styles.iconContainer}>
        {isLoading ? (
          <ActivityIndicator color={COLORS.text} size="small" />
        ) : (
          <Text style={styles.icon}>▶</Text>
        )}
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, isDisabled && styles.textDisabled]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, isDisabled && styles.textDisabled]}>
          {cooldownRemaining > 0
            ? `Wait ${Math.ceil(cooldownRemaining / 1000)}s...`
            : adNotReady
            ? 'Loading ad...'
            : subtitle}
        </Text>
      </View>

      {error && (
        <Pressable onPress={handlePress} style={styles.retryBadge}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.accentLight,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
  },
  icon: {
    fontSize: FONTS.lg,
    color: COLORS.accent,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONTS.md,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  subtitle: {
    fontSize: FONTS.sm,
    color: COLORS.background,
    opacity: 0.8,
  },
  textDisabled: {
    color: COLORS.textMuted,
  },
  retryBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  retryText: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
