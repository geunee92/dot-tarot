// ============================================
// Date Key Formatters (Local Timezone)
// ============================================

/**
 * Get date key in YYYY-MM-DD format (local timezone)
 * @param date - Date object, defaults to now
 */
export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get month key in YYYY-MM format (local timezone)
 * @param date - Date object, defaults to now
 */
export function getMonthKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Parse a date key (YYYY-MM-DD) into a Date object
 * Returns null if invalid format
 */
export function parseDateKey(dateKey: string): Date | null {
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  
  const [, year, month, day] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  // Validate the date is real (e.g., not Feb 31)
  if (
    date.getFullYear() !== parseInt(year) ||
    date.getMonth() !== parseInt(month) - 1 ||
    date.getDate() !== parseInt(day)
  ) {
    return null;
  }
  
  return date;
}

/**
 * Parse a month key (YYYY-MM) into year and month
 */
export function parseMonthKey(monthKey: string): { year: number; month: number } | null {
  const match = monthKey.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  
  const year = parseInt(match[1]);
  const month = parseInt(match[2]);
  
  if (month < 1 || month > 12) return null;
  
  return { year, month };
}

// ============================================
// Date Comparison
// ============================================

/**
 * Check if two dates are the same day (local timezone)
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is today (local timezone)
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if a date key represents today
 */
export function isDateKeyToday(dateKey: string): boolean {
  return dateKey === getLocalDateKey();
}

// ============================================
// Calendar Utilities
// ============================================

/**
 * Get the number of days in a month
 * @param year - Full year (e.g., 2026)
 * @param month - Month (1-12)
 */
export function getDaysInMonth(year: number, month: number): number {
  // Day 0 of next month = last day of current month
  return new Date(year, month, 0).getDate();
}

/**
 * Get the day of week for the first day of a month
 * @param year - Full year (e.g., 2026)
 * @param month - Month (1-12)
 * @returns 0 (Sunday) to 6 (Saturday)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * Get all date keys for a given month
 * @param year - Full year (e.g., 2026)
 * @param month - Month (1-12)
 * @returns Array of date keys in YYYY-MM-DD format
 */
export function getMonthDateKeys(year: number, month: number): string[] {
  const daysInMonth = getDaysInMonth(year, month);
  const monthStr = String(month).padStart(2, '0');
  
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    return `${year}-${monthStr}-${day}`;
  });
}

/**
 * Generate calendar grid data for a month
 * Returns array of weeks, each week is array of day numbers (0 = empty cell)
 */
export function getCalendarGrid(year: number, month: number): number[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const grid: number[][] = [];
  let currentWeek: number[] = [];
  
  // Add empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(0);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    
    // Start new week on Sunday
    if (currentWeek.length === 7) {
      grid.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Add empty cells to complete the last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(0);
    }
    grid.push(currentWeek);
  }
  
  return grid;
}

// ============================================
// Month Navigation
// ============================================

/**
 * Get the previous month key
 */
export function getPreviousMonthKey(monthKey: string): string {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) return monthKey;
  
  let { year, month } = parsed;
  month--;
  if (month < 1) {
    month = 12;
    year--;
  }
  
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Get the next month key
 */
export function getNextMonthKey(monthKey: string): string {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) return monthKey;
  
  let { year, month } = parsed;
  month++;
  if (month > 12) {
    month = 1;
    year++;
  }
  
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Format month key for display (e.g., "January 2026")
 */
export function formatMonthDisplay(monthKey: string): string {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) return monthKey;
  
  const date = new Date(parsed.year, parsed.month - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ============================================
// Attendance Calculation
// ============================================

/**
 * Count attendance days in a month from a set of date keys
 * @param dateKeys - Set of date keys (YYYY-MM-DD)
 * @param monthKey - Target month (YYYY-MM)
 */
export function countAttendanceInMonth(
  dateKeys: Set<string> | string[],
  monthKey: string
): number {
  const keys = dateKeys instanceof Set ? dateKeys : new Set(dateKeys);
  let count = 0;
  
  for (const key of keys) {
    if (key.startsWith(monthKey)) {
      count++;
    }
  }
  
  return count;
}
