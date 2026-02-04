import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// Generic Storage Operations
// ============================================

/**
 * Get item from AsyncStorage with JSON parsing
 * Returns null if not found or on error
 */
export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Set item in AsyncStorage with JSON serialization
 * Returns true on success, false on error
 */
export async function setItem<T>(key: string, value: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove item from AsyncStorage
 * Returns true on success, false on error
 */
export async function removeItem(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all keys from AsyncStorage
 */
export async function getAllKeys(): Promise<string[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return [...keys];
  } catch {
    return [];
  }
}

/**
 * Clear all data from AsyncStorage
 * USE WITH CAUTION
 */
export async function clearAll(): Promise<boolean> {
  try {
    await AsyncStorage.clear();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get multiple items at once
 */
export async function multiGet<T>(keys: string[]): Promise<Map<string, T | null>> {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    const result = new Map<string, T | null>();
    for (const [key, value] of pairs) {
      result.set(key, value ? JSON.parse(value) : null);
    }
    return result;
  } catch {
    return new Map();
  }
}

// ============================================
// Storage Key Generators
// ============================================

// Key prefixes for different data types
export const STORAGE_KEYS = {
  DRAW_PREFIX: 'draw:',
  SPREADS_PREFIX: 'spreads:',
  GATING_PREFIX: 'gating:',
  REWARDS: 'rewards',
} as const;

/**
 * Generate storage key for daily draw
 * @param dateKey - Date in YYYY-MM-DD format
 */
export function getDrawKey(dateKey: string): string {
  return `${STORAGE_KEYS.DRAW_PREFIX}${dateKey}`;
}

/**
 * Generate storage key for spreads
 * @param dateKey - Date in YYYY-MM-DD format
 */
export function getSpreadsKey(dateKey: string): string {
  return `${STORAGE_KEYS.SPREADS_PREFIX}${dateKey}`;
}

/**
 * Generate storage key for gating state
 * @param dateKey - Date in YYYY-MM-DD format
 */
export function getGatingKey(dateKey: string): string {
  return `${STORAGE_KEYS.GATING_PREFIX}${dateKey}`;
}

/**
 * Get rewards storage key (singleton, not date-based)
 */
export function getRewardsKey(): string {
  return STORAGE_KEYS.REWARDS;
}

// ============================================
// Key Extraction Utilities
// ============================================

/**
 * Extract date from a draw/spreads/gating key
 * @param key - Storage key like "draw:2026-01-31"
 * @returns dateKey or null if invalid
 */
export function extractDateFromKey(key: string): string | null {
  const prefixes = [
    STORAGE_KEYS.DRAW_PREFIX,
    STORAGE_KEYS.SPREADS_PREFIX,
    STORAGE_KEYS.GATING_PREFIX,
  ];
  
  for (const prefix of prefixes) {
    if (key.startsWith(prefix)) {
      return key.slice(prefix.length);
    }
  }
  return null;
}

/**
 * Get all draw keys from storage
 */
export async function getAllDrawKeys(): Promise<string[]> {
  const allKeys = await getAllKeys();
  return allKeys.filter(key => key.startsWith(STORAGE_KEYS.DRAW_PREFIX));
}

/**
 * Get all spread keys from storage
 */
export async function getAllSpreadKeys(): Promise<string[]> {
  const allKeys = await getAllKeys();
  return allKeys.filter(key => key.startsWith(STORAGE_KEYS.SPREADS_PREFIX));
}

/**
 * Get keys for a specific month
 * @param prefix - Key prefix (DRAW_PREFIX, SPREADS_PREFIX, etc.)
 * @param monthKey - Month in YYYY-MM format
 */
export async function getKeysForMonth(
  prefix: string,
  monthKey: string
): Promise<string[]> {
  const allKeys = await getAllKeys();
  return allKeys.filter(
    key => key.startsWith(prefix) && key.includes(monthKey)
  );
}
