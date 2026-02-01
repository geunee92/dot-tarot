# Draft: Retro Dot Game UI Transformation

## User's Request (UPDATED)
Transform tarot app UI to authentic **retro dot game aesthetic** like classic Pokemon (Game Boy) or Dragon Quest.

**User Frustration**: "수정한게 전혀 없는 거 같은데 레트로 느낌이 전혀 안 나와 UI의 분위기가 완전히 달라져야 해"
(The changes don't seem to exist - no retro feel at all. The UI atmosphere must completely change.)

**Root Cause Analysis**:
1. **Colors still modern** - Deep navy/purple palette feels like a "premium app" not a game
2. **Gradients still in use** - LinearGradient backgrounds = completely wrong
3. **NO pixel font** - PixelText.tsx uses system fonts, not actual pixel fonts
4. **Rounded corners still present** - RADIUS values are 4-16, not 0

## Current State Analysis

### Theme System (`/src/components/theme.ts`)
| Constant | Current Values |
|----------|----------------|
| RADIUS | `sm: 4, md: 8, lg: 12, xl: 16, round: 999` |
| SHADOWS.soft | `shadowOffset: {0, 4}, shadowRadius: 8, opacity: 0.15` |
| SHADOWS.subtle | `shadowOffset: {0, 2}, shadowRadius: 4, opacity: 0.1` |
| SHADOWS.glow | `shadowRadius: 12` (decorative glow) |
| BORDERS | `thin: 1, medium: 2, thick: 3` |

### Component Styling Patterns

**PixelButton.tsx:**
- `borderRadius: RADIUS.md` (8px)
- `...SHADOWS.subtle`
- Press effect: `transform: [{ scale: 0.97 }]`

**PixelCard.tsx:**
- `borderRadius: RADIUS.lg` (12px)
- `...SHADOWS.soft`

**TabNavigator.tsx:**
- `iconContainer`: `borderRadius: RADIUS.md` (8px)
- No shadows on tab bar

### Screen Styling Audit

**PRIMARY SCREENS (need retro conversion):**
| Screen | RADIUS Usage | SHADOW Usage |
|--------|--------------|--------------|
| DailyScreen | `RADIUS.lg` (cardPlaceholder) | `SHADOWS.soft` |
| SpreadsScreen | `RADIUS.lg` (topicCard) | `SHADOWS.soft` |
| JourneyScreen | `RADIUS.lg/md/sm` (multiple) | `SHADOWS.soft/subtle/glow` |

**SECONDARY SCREENS (already sharp corners):**
| Screen | RADIUS | SHADOW | Notes |
|--------|--------|--------|-------|
| DailyResultScreen | NONE | NONE | Already retro-friendly |
| SpreadResultScreen | NONE | NONE | Already retro-friendly |
| HistoryDetailScreen | NONE | NONE | Already retro-friendly |
| SettingsScreen | NONE | NONE | Already retro-friendly |

### Other Components to Update
- CalendarGrid: `BORDERS.medium` (already sharp)
- CalendarDay: No radius (already sharp)
- LanguageSwitcher: No radius (already sharp)

## Target Aesthetic (Retro Game UI)

### Characteristics to Implement
1. **Sharp corners**: `borderRadius: 0` or max `RADIUS.sm: 4`
2. **Block shadows**: Solid offset, NO blur (`shadowRadius: 0`)
3. **Thicker borders**: `BORDERS.medium` or `BORDERS.thick`
4. **Press effect**: `translateY(2)` instead of `scale(0.97)`

### Example Block Shadow
```typescript
SHADOWS.block = {
  shadowColor: '#000',
  shadowOffset: { width: 3, height: 3 },
  shadowRadius: 0,
  shadowOpacity: 0.8,
  elevation: 4,
}
```

## Scope Boundaries

### IN SCOPE
- [ ] Theme system updates (SHADOWS, possibly RADIUS)
- [ ] PixelButton.tsx retro styling
- [ ] PixelCard.tsx retro styling
- [ ] TabNavigator.tsx retro styling
- [ ] DailyScreen.tsx (cardPlaceholder)
- [ ] SpreadsScreen.tsx (topicCard)
- [ ] JourneyScreen.tsx (progressBox, skinItem, etc.)

### OUT OF SCOPE (already retro-friendly)
- DailyResultScreen, SpreadResultScreen, HistoryDetailScreen, SettingsScreen
- CalendarGrid, CalendarDay, LanguageSwitcher

## CRITICAL MISSING PIECES (Must Fix)

### 1. COLOR PALETTE (theme.ts)
**Current**: Smooth cosmic purple palette (`#12101f`, `#1e1a35`, `#7b4a8f`)
**Target**: High-contrast retro game palette
```typescript
// PROPOSED RETRO PALETTE
COLORS = {
  background: '#0f0f23',     // Deep space black (darker)
  surface: '#16213e',        // Navy blue panel
  surfaceLight: '#1f4068',   // Lighter navy
  
  primary: '#4a69bd',        // Royal blue (saturated)
  primaryLight: '#6a89cc',   // Light blue
  primaryDark: '#1e3799',    // Deep blue
  
  accent: '#f8b500',         // Game gold (saturated)
  accentLight: '#ffd32a',    // Bright gold
  accentDark: '#c69500',     // Dark gold
  
  text: '#f5f5f5',           // Pure white (high contrast)
  textMuted: '#b8c5d6',      // Light gray-blue
  textDark: '#7f8fa6',       // Muted gray
  
  border: '#4a69bd',         // Blue border (visible)
  borderLight: '#6a89cc',    // Light border
  borderAccent: '#f8b500',   // Gold highlight
  
  success: '#26de81',        // Green
  warning: '#fed330',        // Yellow
  error: '#fc5c65',          // Red
  
  upright: '#26de81',        // Green for upright
  reversed: '#fed330',       // Yellow for reversed
}
```

### 2. GRADIENTS → SOLID COLORS
**Current**: `GRADIENTS.cosmic = ['#12101f', '#1e1a35', '#2d2650']`
**Target**: Remove gradients entirely OR convert to solid color references
```typescript
// REMOVE expo-linear-gradient usage
// GradientBackground should use solid View with backgroundColor
```

### 3. PIXEL FONT
**Current**: System fonts with fontWeight: 'bold'
**Target**: Press Start 2P font from expo-google-fonts
```bash
npx expo install @expo-google-fonts/press-start-2p expo-font
```

### 4. RADIUS → 0
**Current**: `RADIUS = { sm: 4, md: 8, lg: 12, xl: 16, round: 999 }`
**Target**: `RADIUS = { sm: 0, md: 0, lg: 0, xl: 0, round: 0 }`

## Open Questions (Need User Input)

## Technical Decisions (TBD)
- Block shadow color: Use `#000` or derive from `COLORS.background`?
- Elevation value for Android: Match with shadow offset?

## Research Findings (from Librarian Agent)

### Pokemon Game Boy UI Patterns
- **Double border**: Outer 2px dark, inner 1px light (optional - keeping single for simplicity)
- **Block shadow**: `shadowRadius: 0` is CRITICAL - any blur breaks pixel authenticity
- **Shadow offset**: 2-3px for authentic retro feel
- **Press effect**: `translateY: 2` + shadow reduction

### Dragon Quest UI Patterns
- **Menu box**: Black background, 2px blue border, block shadow
- **Text**: Monospace, uppercase, wider letter-spacing

### React Native Implementation
- **Block shadow confirmed**: `shadowRadius: 0, shadowOffset: {width: 3, height: 3}`
- **Animation**: `Animated.spring` with `friction: 8, tension: 40` OR Reanimated `withSpring({damping: 15, stiffness: 150})`
- **Press feedback**: Combine translateY with shadow offset reduction on press

### Key Values from Research
| Property | Value | Source |
|----------|-------|--------|
| shadowRadius | 0 | Critical for pixel effect |
| shadowOffset | 2-3px | Authentic retro feel |
| translateY (pressed) | 2px | Button "push down" effect |
| borderWidth (outer) | 2-3px | Standard retro border |
| animation friction | 8 | Controls spring bounciness |
| animation tension | 40 | Controls spring speed |
