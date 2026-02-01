import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDERS, FONTS } from '../theme';

interface CalendarDayProps {
  day: number;
  dateKey: string;
  isToday: boolean;
  hasDrawn: boolean;
  hasSpread: boolean;
  onPress: (dateKey: string) => void;
}

export function CalendarDay({
  day,
  dateKey,
  isToday,
  hasDrawn,
  hasSpread,
  onPress,
}: CalendarDayProps) {
  if (day === 0) {
    return (
      <View style={styles.cell}>
        <Text style={styles.dayText}> </Text>
        <View style={styles.indicators} />
      </View>
    );
  }

  const handlePress = async () => {
    if (hasDrawn || hasSpread) {
      await Haptics.selectionAsync();
      onPress(dateKey);
    }
  };

  const hasActivity = hasDrawn || hasSpread;

  return (
    <Pressable
      onPress={handlePress}
      disabled={!hasActivity}
      style={({ pressed }) => [
        styles.cell,
        isToday && styles.todayCell,
        hasActivity && styles.activeCell,
        pressed && hasActivity && styles.pressedCell,
      ]}
    >
      <Text style={[
        styles.dayText,
        isToday && styles.todayText,
        hasActivity && styles.activeText,
      ]}>
        {day}
      </Text>
      
      <View style={styles.indicators}>
        {hasDrawn && <View style={[styles.indicator, styles.drawIndicator]} />}
        {hasSpread && <View style={[styles.indicator, styles.spreadIndicator]} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xs,
  },
  todayCell: {
    borderColor: COLORS.accent,
  },
  activeCell: {
    backgroundColor: COLORS.surfaceLight,
  },
  pressedCell: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    fontSize: FONTS.md,
    color: COLORS.textMuted,
  },
  todayText: {
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  activeText: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  indicators: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  indicator: {
    width: 6,
    height: 6,
  },
  drawIndicator: {
    backgroundColor: COLORS.upright,
  },
  spreadIndicator: {
    backgroundColor: COLORS.primary,
  },
});
