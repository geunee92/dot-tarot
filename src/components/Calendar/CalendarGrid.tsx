import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDay } from './CalendarDay';
import { COLORS, BORDERS } from '../theme';
import {
  getCalendarGrid,
  parseMonthKey,
  getLocalDateKey,
  getDaysInMonth,
} from '../../utils/date';

interface CalendarGridProps {
  monthKey: string;
  drawDates: Set<string>;
  spreadDates?: Set<string>;
  reflectionDates?: Set<string>;
  onDayPress: (dateKey: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarGrid({
  monthKey,
  drawDates,
  spreadDates = new Set(),
  reflectionDates = new Set(),
  onDayPress,
  onPreviousMonth,
  onNextMonth,
}: CalendarGridProps) {
  const todayKey = getLocalDateKey();
  const parsed = parseMonthKey(monthKey);
  
  const calendarData = useMemo(() => {
    if (!parsed) return [];
    return getCalendarGrid(parsed.year, parsed.month);
  }, [monthKey]);

  const attendanceCount = useMemo(() => {
    let count = 0;
    drawDates.forEach((date) => {
      if (date.startsWith(monthKey)) {
        count++;
      }
    });
    return count;
  }, [drawDates, monthKey]);

  const totalDays = parsed ? getDaysInMonth(parsed.year, parsed.month) : 0;

  const formatDateKey = (day: number): string => {
    if (!parsed || day === 0) return '';
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(parsed.month).padStart(2, '0');
    return `${parsed.year}-${monthStr}-${dayStr}`;
  };

  return (
    <View style={styles.container}>
      <CalendarHeader
        monthKey={monthKey}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
        attendanceCount={attendanceCount}
        totalDays={totalDays}
      />
      
      <View style={styles.grid}>
        {calendarData.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => {
              const dateKey = formatDateKey(day);
              return (
                <CalendarDay
                  key={`${weekIndex}-${dayIndex}`}
                  day={day}
                  dateKey={dateKey}
                  isToday={dateKey === todayKey}
                  hasDrawn={drawDates.has(dateKey)}
                  hasSpread={spreadDates.has(dateKey)}
                  hasReflection={reflectionDates.has(dateKey)}
                  onPress={onDayPress}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  grid: {
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    borderTopWidth: 0,
  },
  weekRow: {
    flexDirection: 'row',
  },
});
