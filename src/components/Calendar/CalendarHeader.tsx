import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDERS, FONTS } from '../theme';
import { formatMonthDisplay } from '../../utils/date';

interface CalendarHeaderProps {
  monthKey: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  attendanceCount?: number;
  totalDays?: number;
}

export function CalendarHeader({
  monthKey,
  onPreviousMonth,
  onNextMonth,
  attendanceCount = 0,
  totalDays,
}: CalendarHeaderProps) {
  const handlePrevious = async () => {
    await Haptics.selectionAsync();
    onPreviousMonth();
  };

  const handleNext = async () => {
    await Haptics.selectionAsync();
    onNextMonth();
  };

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <Pressable onPress={handlePrevious} style={styles.navButton}>
          <Text style={styles.navArrow}>◀</Text>
        </Pressable>

        <Text style={styles.monthText}>{formatMonthDisplay(monthKey)}</Text>

        <Pressable onPress={handleNext} style={styles.navButton}>
          <Text style={styles.navArrow}>▶</Text>
        </Pressable>
      </View>

      {attendanceCount > 0 && (
        <View style={styles.attendanceRow}>
          <Text style={styles.attendanceLabel}>Attendance: </Text>
          <Text style={styles.attendanceCount}>{attendanceCount}</Text>
          {totalDays && (
            <Text style={styles.attendanceTotal}> / {totalDays} days</Text>
          )}
        </View>
      )}

      <View style={styles.weekdayRow}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <View key={index} style={styles.weekdayCell}>
            <Text style={[
              styles.weekdayText,
              index === 0 && styles.sundayText,
              index === 6 && styles.saturdayText,
            ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    borderBottomWidth: 0,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.border,
  },
  navButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
  },
  navArrow: {
    fontSize: FONTS.lg,
    color: COLORS.accent,
  },
  monthText: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surfaceLight,
  },
  attendanceLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
  },
  attendanceCount: {
    fontSize: FONTS.lg,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  attendanceTotal: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
  },
  weekdayRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderTopWidth: BORDERS.thin,
    borderTopColor: COLORS.border,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  weekdayText: {
    fontSize: FONTS.sm,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  sundayText: {
    color: COLORS.error,
  },
  saturdayText: {
    color: COLORS.primary,
  },
});
