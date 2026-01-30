// Pixel Talisman Color Palette
export const COLORS = {
  // Backgrounds
  background: '#1a1a2e',
  surface: '#16213e',
  surfaceLight: '#1f2b47',
  
  // Primary colors
  primary: '#6b21a8',
  primaryLight: '#9333ea',
  primaryDark: '#4c1d95',
  
  // Accent
  accent: '#f59e0b',
  accentLight: '#fbbf24',
  
  // Text
  text: '#e0e0e0',
  textMuted: '#9ca3af',
  textDark: '#6b7280',
  
  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  
  // Card orientations
  upright: '#10b981',
  reversed: '#f59e0b',
  
  // Borders (pixel style)
  border: '#4a5568',
  borderLight: '#6b7280',
  borderAccent: '#f59e0b',
} as const;

// Pixel-style spacing (multiples of 4 for pixel grid alignment)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// Border widths for pixel aesthetic
export const BORDERS = {
  thin: 2,
  medium: 3,
  thick: 4,
} as const;

// Font sizes
export const FONTS = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  title: 32,
} as const;
