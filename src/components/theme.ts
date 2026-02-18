export const COLORS = {
  background: '#0f0f23',
  surface: '#1a1a2e',
  surfaceLight: '#16213e',
  
  primary: '#1f4068',
  primaryLight: '#4a69bd',
  primaryDark: '#0c1829',
  
  accent: '#f8b500',
  accentLight: '#ffd700',
  accentDark: '#c49000',
  
  aurora: '#00d9ff',
  auroraLight: '#7fecff',
  
  text: '#f5f5f5',
  textMuted: '#a0a0a0',
  textDark: '#606060',
  
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#ef4444',
  
  upright: '#4ade80',
  reversed: '#f97316',
  
  border: '#4a69bd',
  borderLight: '#6b8cce',
  borderAccent: '#f8b500',
  
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  overlayHeavy: 'rgba(0, 0, 0, 0.85)',
} as const;

export const BACKGROUNDS = {
  cosmic: '#0f0f23',
  plum: '#1a1a2e',
  aurora: '#0c1829',
  gold: '#16213e',
  card: '#1a1a2e',
} as const;

export const GRADIENTS = {
  cosmic: ['#0f0f23', '#1a1a3e', '#0c1829'],
  plum: ['#1a1a2e', '#2d1b4e', '#1a1a2e'],
  aurora: ['#0c1829', '#0f2847', '#0c1829'],
  gold: ['#16213e', '#1a2a50', '#0f1a30'],
  card: ['#1a1a2e', '#252547', '#1a1a2e'],
} as const;

export const RADIUS = {
  sm: 0,
  md: 0,
  lg: 0,
  xl: 0,
  round: 999,
} as const;

export const SHADOWS = {
  block: {
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 4,
  },
  blockLight: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 3,
  },
  glow: {
    shadowColor: '#f8b500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  glowPrimary: {
    shadowColor: '#4a69bd',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  glowAurora: {
    shadowColor: '#00d9ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 4,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 2,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const BORDERS = {
  thin: 2,
  medium: 3,
  thick: 4,
} as const;

export const FONTS = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  title: 28,
} as const;

export const FONT_FAMILY = {
  pixel: 'PressStart2P_400Regular',
  korean: 'Galmuri11',
  system: undefined,
} as const;
