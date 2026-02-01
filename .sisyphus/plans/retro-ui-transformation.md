# Retro UI Transformation - Pokemon/Dragon Quest Style (COMPLETE OVERHAUL)

## TL;DR

> **Quick Summary**: COMPLETE UI transformation from modern "cosmic purple" aesthetic to authentic retro dot game feel (Pokemon/Dragon Quest style). This is NOT a minor tweak - it's a full visual overhaul including new color palette, pixel font, solid backgrounds, and sharp corners.
> 
> **Previous Attempt Failed Because**: Only shadows/corners were changed. Colors stayed modern, fonts stayed system fonts, gradients remained. User said: "레트로 느낌이 전혀 안 나와" (no retro feel at all).
> 
> **Deliverables**:
> - **NEW** retro color palette in `theme.ts` (navy blue, gold, high contrast)
> - **NEW** Press Start 2P pixel font via expo-google-fonts
> - **REMOVED** LinearGradient backgrounds → solid colors
> - **UPDATED** all RADIUS to 0 (sharp corners)
> - **UPDATED** all components with pixel font and retro colors
> - **UPDATED** font loading in App.tsx
> 
> **Estimated Effort**: Medium-Large (9 tasks)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (font pkg) → Task 4 (PixelText) → Task 8 (App.tsx) → Task 9 (verify)

---

## Context

### Original Request
Complete UI transformation to authentic **retro dot game aesthetic** like classic Pokemon (Game Boy) or Dragon Quest.

**User Frustration**: "수정한게 전혀 없는 거 같은데 레트로 느낌이 전혀 안 나와 UI의 분위기가 완전히 달라져야 해"
(The changes don't seem to exist - no retro feel at all. The UI atmosphere must completely change.)

### Why Previous Attempt Failed
The previous plan only addressed:
- ✅ SHADOWS.block constant (added)
- ✅ Sharp corners (some removed)
- ✅ translateY press effect

But **MISSED the critical visual elements**:
- ❌ Colors still modern cosmic purple (#12101f, #1e1a35, #7b4a8f)
- ❌ GradientBackground still uses LinearGradient
- ❌ PixelText uses system fonts, NOT pixel fonts
- ❌ Overall "premium app" feel instead of "game menu" feel

### Root Cause Analysis
1. **Colors are too smooth** - Deep navy/purple feels like premium app, not retro game
2. **Gradients exist** - LinearGradient = modern, Solid colors = retro
3. **No pixel font** - Text is the #1 visual element; system fonts = modern
4. **Not enough contrast** - Retro games use HIGH contrast, limited palette

### Research Findings
**From Librarian Agent (expo-google-fonts research)**:
- Press Start 2P font: `@expo-google-fonts/press-start-2p`
- Font family name: `PressStart2P_400Regular`
- Pixel fonts need smaller sizes (they render larger)
- React Native 0.81 (Expo 54) has boxShadow support

**From Codebase Analysis**:
- 5 core components: theme.ts, GradientBackground, PixelText, PixelButton, PixelCard
- 7 screens, all use GradientBackground
- App.tsx needs font loading setup
- expo-font already in package.json

---

## Work Objectives

### Core Objective
Transform EVERY visual element of the app to feel like a classic Game Boy/NES game menu, NOT a modern premium app. The atmosphere must completely change.

### Concrete Deliverables
1. `theme.ts` - **COMPLETE** color palette replacement + RADIUS = 0 + remove glow shadows
2. `GradientBackground.tsx` - Convert to solid color View (remove LinearGradient)
3. `PixelText.tsx` - Use Press Start 2P pixel font
4. `PixelButton.tsx` - Pixel font + retro colors + block shadows
5. `PixelCard.tsx` - Pixel font + retro colors + block shadows
6. `TabNavigator.tsx` - Pixel font + retro styling
7. `App.tsx` - Font loading setup with useFonts hook
8. `package.json` - Add @expo-google-fonts/press-start-2p dependency

### Definition of Done
- [ ] `npx expo start` launches without errors
- [ ] **ALL text renders in Press Start 2P pixel font**
- [ ] **NO gradients visible anywhere** (solid backgrounds only)
- [ ] **ALL corners are sharp** (RADIUS = 0)
- [ ] **Colors are high-contrast game-like** (navy blue, gold, white)
- [ ] TypeScript compilation succeeds: `npx tsc --noEmit`

### Must Have
- Press Start 2P font loading and usage in ALL text
- Solid color backgrounds (NO gradients)
- Sharp corners everywhere (RADIUS = 0)
- High-contrast retro color palette (see exact values below)
- Block shadows only (offset, no blur, no glow)

### Must NOT Have (Guardrails)
- ❌ NO gradients in ANY background
- ❌ NO rounded corners (borderRadius must be 0)
- ❌ NO glow shadows (shadowRadius must be 0)
- ❌ NO soft/blurred effects
- ❌ NO system fonts in PixelText (MUST use pixel font)
- ❌ NO changes to business logic or navigation structure
- ❌ NO new screens or features (styling only)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: Manual verification via Expo Go
- **Framework**: none
- **QA approach**: Visual verification + TypeScript compilation

### Verification Procedures

**For TypeScript check**:
```bash
cd taro-app && npx tsc --noEmit
# Assert: Exit code 0, no errors
```

**For visual verification** (using Expo Go):
```bash
cd taro-app && npx expo start --tunnel
# Scan QR code with Expo Go app on physical device
```

**Visual Checklist**:
1. ✅ ALL text is in pixel font (blocky, retro look)
2. ✅ NO smooth gradients anywhere (solid colors only)
3. ✅ ALL corners are sharp (no rounded edges)
4. ✅ Colors are high-contrast (navy blue, gold, white)
5. ✅ Shadows are block-style (offset, no blur)
6. ✅ App feels like "game menu" not "premium app"

**Evidence Requirements:**
- TypeScript compilation output (must be clean)
- Visual confirmation app looks like Pokemon/Dragon Quest menu

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - Foundation):
├── Task 1: Install Press Start 2P font package
└── Task 2: Transform theme.ts (colors, radius, shadows)

Wave 2 (After Wave 1 - Components):
├── Task 3: Convert GradientBackground to solid colors
├── Task 4: Update PixelText with pixel font
├── Task 5: Update PixelButton with retro styling
├── Task 6: Update PixelCard with retro styling
└── Task 7: Update TabNavigator with retro styling

Wave 3 (After Wave 2 - Integration):
├── Task 8: Setup font loading in App.tsx
└── Task 9: Final verification and cleanup

Critical Path: Task 1 → Task 4 → Task 8 → Task 9
Parallel Speedup: ~50% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 4, 8 | 2 |
| 2 | None | 3, 4, 5, 6, 7 | 1 |
| 3 | 2 | 9 | 4, 5, 6, 7 |
| 4 | 1, 2 | 8 | 3, 5, 6, 7 |
| 5 | 2 | 9 | 3, 4, 6, 7 |
| 6 | 2 | 9 | 3, 4, 5, 7 |
| 7 | 2 | 9 | 3, 4, 5, 6 |
| 8 | 1, 4 | 9 | None |
| 9 | 3-8 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | dispatch parallel, category="quick" |
| 2 | 3, 4, 5, 6, 7 | dispatch parallel, category="quick" |
| 3 | 8, 9 | sequential, category="quick" |

---

## EXACT COLOR VALUES (Reference for All Tasks)

```typescript
// NEW RETRO COLOR PALETTE - Use these exact values
export const COLORS = {
  // Backgrounds - deep and dark
  background: '#0f0f23',      // Deep space black
  surface: '#16213e',         // Navy blue panel
  surfaceLight: '#1f4068',    // Lighter navy
  
  // Primary - royal blue (Pokemon menu feel)
  primary: '#4a69bd',         // Royal blue
  primaryLight: '#6a89cc',    // Light blue
  primaryDark: '#1e3799',     // Deep blue
  
  // Accent - game gold (high visibility)
  accent: '#f8b500',          // Saturated gold
  accentLight: '#ffd32a',     // Bright gold
  accentDark: '#c69500',      // Dark gold
  
  // Aurora - teal accent
  aurora: '#26de81',          // Bright teal
  auroraLight: '#7bed9f',     // Light teal
  
  // Text - high contrast
  text: '#f5f5f5',            // Pure white
  textMuted: '#a4b0be',       // Light gray
  textDark: '#747d8c',        // Muted gray
  
  // Status colors
  success: '#26de81',         // Green
  warning: '#fed330',         // Yellow
  error: '#fc5c65',           // Red
  
  // Card orientations
  upright: '#26de81',         // Green
  reversed: '#fed330',        // Yellow/amber
  
  // Borders - visible and contrasting
  border: '#4a69bd',          // Blue border
  borderLight: '#6a89cc',     // Light border
  borderAccent: '#f8b500',    // Gold highlight
} as const;

// ALL RADIUS = 0
export const RADIUS = {
  sm: 0,
  md: 0,
  lg: 0,
  xl: 0,
  round: 0,
} as const;

// GRADIENTS become solid colors (for API compatibility)
export const GRADIENTS = {
  cosmic: ['#0f0f23', '#0f0f23', '#0f0f23'],
  plum: ['#1e3799', '#1e3799', '#1e3799'],
  aurora: ['#0f0f23', '#0f0f23', '#0f0f23'],
  gold: ['#16213e', '#16213e', '#16213e'],
  card: ['#16213e', '#16213e', '#16213e'],
} as const;

// SHADOWS - block only (no glow, no blur)
export const SHADOWS = {
  block: {
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
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
  blockHeavy: {
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
} as const;
```

---

## TODOs

- [ ] 1. Install Press Start 2P Pixel Font Package

  **What to do**:
  - Run: `npx expo install @expo-google-fonts/press-start-2p`
  - Verify package.json includes the new dependency
  - No code changes yet (just installation)

  **Must NOT do**:
  - Do not modify any source files yet
  - Do not attempt to use the font yet (that's Task 4 and 8)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single command execution
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 4, Task 8
  - **Blocked By**: None

  **References**:
  - `taro-app/package.json` - Current dependencies (expo-font at line 19)
  - Docs: https://github.com/expo/google-fonts/tree/master/font-packages/press-start-2p

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  cat taro-app/package.json | grep "press-start-2p"
  # Assert: Output contains "@expo-google-fonts/press-start-2p"
  ```

  **Commit**: NO (groups with Task 2)

---

- [ ] 2. Transform theme.ts with Complete Retro Overhaul

  **What to do**:
  - Replace ENTIRE `COLORS` object with retro palette (see exact values above)
  - Set ALL `RADIUS` values to 0
  - Update `GRADIENTS` to solid color arrays (for API compatibility)
  - Replace ALL `SHADOWS` with block-only variants (remove glow, soft, subtle)
  - Keep SPACING, BORDERS, FONTS unchanged

  **Exact changes** (see "EXACT COLOR VALUES" section above for full definitions):
  - COLORS: Replace all 31 color values with retro palette
  - RADIUS: All values become 0
  - GRADIENTS: Each becomes array of same solid color
  - SHADOWS: Only keep block, blockLight, blockHeavy (remove glow*, soft, subtle)

  **Must NOT do**:
  - Do not change SPACING values
  - Do not change BORDERS values
  - Do not change FONTS values
  - Do not remove any COLORS keys (maintain API compatibility)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, mechanical replacement
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 3, 4, 5, 6, 7
  - **Blocked By**: None

  **References**:
  - `taro-app/src/components/theme.ts:1-127` - Complete file to transform

  **Acceptance Criteria**:
  ```bash
  # Agent runs TypeScript check:
  cd taro-app && npx tsc --noEmit
  # Assert: Exit code 0

  # Verify new background color:
  grep "background:" taro-app/src/components/theme.ts | head -1
  # Assert: Contains '#0f0f23'

  # Verify RADIUS all zero:
  grep -E "sm:|md:|lg:|xl:" taro-app/src/components/theme.ts
  # Assert: All show value 0

  # Verify no glow shadows:
  grep -c "glow" taro-app/src/components/theme.ts
  # Assert: Output is 0
  ```

  **Commit**: YES
  - Message: `style(theme): complete retro overhaul - new colors, no gradients, sharp corners`
  - Files: `taro-app/src/components/theme.ts`
  - Pre-commit: `cd taro-app && npx tsc --noEmit`

---

- [ ] 3. Convert GradientBackground to Solid Colors

  **What to do**:
  - Remove LinearGradient import
  - Replace LinearGradient with plain View
  - Map variants to solid background colors
  - Keep same props interface for backward compatibility

  **New implementation**:
  ```typescript
  import React from 'react';
  import { View, StyleSheet, ViewStyle } from 'react-native';
  import { COLORS } from './theme';

  type BackgroundVariant = 'cosmic' | 'plum' | 'aurora' | 'gold' | 'card';

  interface GradientBackgroundProps {
    variant?: BackgroundVariant;
    style?: ViewStyle;
    children?: React.ReactNode;
  }

  const VARIANT_COLORS: Record<BackgroundVariant, string> = {
    cosmic: COLORS.background,      // #0f0f23
    plum: COLORS.primaryDark,       // #1e3799
    aurora: COLORS.background,      // #0f0f23
    gold: COLORS.surface,           // #16213e
    card: COLORS.surface,           // #16213e
  };

  export function GradientBackground({
    variant = 'cosmic',
    style,
    children,
  }: GradientBackgroundProps) {
    return (
      <View style={[styles.container, { backgroundColor: VARIANT_COLORS[variant] }, style]}>
        {children}
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  });
  ```

  **Must NOT do**:
  - Do not change component name (keep as GradientBackground)
  - Do not change props interface
  - Do not remove GRADIENTS from theme.ts (other code might reference)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file replacement

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6, 7)
  - **Blocks**: Task 9
  - **Blocked By**: Task 2

  **References**:
  - `taro-app/src/components/GradientBackground.tsx:1-42` - Current implementation
  - `taro-app/src/screens/DailyScreen.tsx:75,88` - Usage example (variant="cosmic")
  - `taro-app/src/screens/SpreadsScreen.tsx:87,102` - Usage example (variant="plum")

  **Acceptance Criteria**:
  ```bash
  # Agent runs TypeScript check:
  cd taro-app && npx tsc --noEmit
  # Assert: Exit code 0

  # Verify no LinearGradient import:
  grep -c "LinearGradient" taro-app/src/components/GradientBackground.tsx
  # Assert: Output is 0

  # Verify View is used:
  grep -c "<View" taro-app/src/components/GradientBackground.tsx
  # Assert: Output is 1 or more
  ```

  **Commit**: NO (groups with Wave 2)

---

- [ ] 4. Update PixelText with Press Start 2P Font

  **What to do**:
  - Export font family constant: `export const PIXEL_FONT_FAMILY = 'PressStart2P_400Regular';`
  - Add fontFamily to ALL text style variants
  - Reduce font sizes (pixel fonts render larger):
    - title: 20 (was 32)
    - heading: 14 (was 20)
    - body: 10 (was 14)
    - caption: 8 (was 12)
    - talisman: 12 (was 16)
  - Remove fontWeight: 'bold' (pixel fonts don't need bold)
  - Remove fontStyle: 'italic' from talisman (pixel fonts don't do italic)

  **Updated styles**:
  ```typescript
  export const PIXEL_FONT_FAMILY = 'PressStart2P_400Regular';

  const styles = StyleSheet.create({
    title: {
      fontFamily: PIXEL_FONT_FAMILY,
      fontSize: 20,
      fontWeight: 'normal',
      color: COLORS.text,
      letterSpacing: 1,
    },
    heading: {
      fontFamily: PIXEL_FONT_FAMILY,
      fontSize: 14,
      fontWeight: 'normal',
      color: COLORS.text,
    },
    body: {
      fontFamily: PIXEL_FONT_FAMILY,
      fontSize: 10,
      color: COLORS.text,
      lineHeight: 18,
    },
    caption: {
      fontFamily: PIXEL_FONT_FAMILY,
      fontSize: 8,
      color: COLORS.textMuted,
    },
    talisman: {
      fontFamily: PIXEL_FONT_FAMILY,
      fontSize: 12,
      fontWeight: 'normal',
      color: COLORS.accent,
      fontStyle: 'normal',
      textAlign: 'center',
    },
  });
  ```

  **Must NOT do**:
  - Do not change component interface
  - Do not remove any variants

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file modification

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5, 6, 7)
  - **Blocks**: Task 8
  - **Blocked By**: Task 1, Task 2

  **References**:
  - `taro-app/src/components/PixelText.tsx:1-66` - Current implementation
  - expo-google-fonts docs: Font family name is `PressStart2P_400Regular`

  **Acceptance Criteria**:
  ```bash
  # Agent runs TypeScript check:
  cd taro-app && npx tsc --noEmit
  # Assert: Exit code 0

  # Verify fontFamily is set in all variants:
  grep -c "fontFamily: PIXEL_FONT_FAMILY" taro-app/src/components/PixelText.tsx
  # Assert: Output is 5 (one per variant)

  # Verify export exists:
  grep "export const PIXEL_FONT_FAMILY" taro-app/src/components/PixelText.tsx
  # Assert: Shows the export
  ```

  **Commit**: NO (groups with Wave 2)

---

- [ ] 5. Update PixelButton with Retro Styling

  **What to do**:
  - Add pixel font to text style: `fontFamily: 'PressStart2P_400Regular'`
  - Change fontWeight to 'normal' (not 'bold')
  - Ensure SHADOWS.block is used (not glow)
  - Ensure no borderRadius (RADIUS values are now 0 from theme)

  **Key updates**:
  ```typescript
  // In accent variant - change from glow to block:
  accent: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accentDark,
    ...SHADOWS.block,  // Changed from SHADOWS.glow
  },

  // In text style:
  text: {
    fontFamily: 'PressStart2P_400Regular',
    fontWeight: 'normal',
    textAlign: 'center',
  },
  ```

  **Must NOT do**:
  - Do not change haptic feedback
  - Do not change button sizes
  - Do not change component interface

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file modification

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4, 6, 7)
  - **Blocks**: Task 9
  - **Blocked By**: Task 2

  **References**:
  - `taro-app/src/components/PixelButton.tsx:1-159` - Current implementation
  - `taro-app/src/components/PixelButton.tsx:118-122` - Accent variant to fix

  **Acceptance Criteria**:
  ```bash
  # Agent runs TypeScript check:
  cd taro-app && npx tsc --noEmit
  # Assert: Exit code 0

  # Verify no SHADOWS.glow:
  grep -c "SHADOWS.glow" taro-app/src/components/PixelButton.tsx
  # Assert: Output is 0

  # Verify pixel font in text:
  grep "PressStart2P" taro-app/src/components/PixelButton.tsx
  # Assert: Shows fontFamily usage
  ```

  **Commit**: NO (groups with Wave 2)

---

- [ ] 6. Update PixelCard with Retro Styling

  **What to do**:
  - Add pixel font to ALL text styles in PixelCard
  - Reduce font sizes for pixel font
  - Ensure SHADOWS.block is used
  - Colors will auto-update from theme

  **Key text style updates**:
  ```typescript
  cardNumber: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 20,  // Reduced from FONTS.title (32)
    fontWeight: 'normal',
    color: 'rgba(255,255,255,0.3)',
  },
  cardKey: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: 'rgba(255,255,255,0.5)',
    marginTop: SPACING.xs,
  },
  cardName: {
    fontFamily: 'PressStart2P_400Regular',
    flex: 1,
    fontSize: 8,
    fontWeight: 'normal',
    color: COLORS.text,
  },
  orientationText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    fontWeight: 'normal',
    color: COLORS.background,
  },
  keywordText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 6,
    color: COLORS.text,
  },
  meaning: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: COLORS.textMuted,
    lineHeight: 14,
  },
  ```

  **Must NOT do**:
  - Do not change card functionality
  - Do not change card sizes
  - Do not change props interface

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file modification

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4, 5, 7)
  - **Blocks**: Task 9
  - **Blocked By**: Task 2

  **References**:
  - `taro-app/src/components/PixelCard.tsx:1-150` - Current implementation
  - `taro-app/src/components/PixelCard.tsx:92-148` - Text styles to update

  **Acceptance Criteria**:
  ```bash
  # Agent runs TypeScript check:
  cd taro-app && npx tsc --noEmit
  # Assert: Exit code 0

  # Verify fontFamily added to text styles:
  grep -c "PressStart2P" taro-app/src/components/PixelCard.tsx
  # Assert: Output is 6 or more (multiple text styles)
  ```

  **Commit**: NO (groups with Wave 2)

---

- [ ] 7. Update TabNavigator with Retro Styling

  **What to do**:
  - Add pixel font to tab labels (tabLabel, tabLabelFocused)
  - Reduce font size for pixel font (6-8px)
  - Thicker tab bar border
  - Ensure iconContainerFocused has no borderRadius

  **Key updates**:
  ```typescript
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: BORDERS.thick,  // Thicker border
    borderTopColor: COLORS.border,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.sm,
  },
  iconContainerFocused: {
    backgroundColor: COLORS.primaryDark,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.accent,
    borderRadius: 0,  // Explicit 0
  },
  tabLabel: {
    fontFamily: 'PressStart2P_400Regular',
    color: COLORS.textMuted,
    fontSize: 6,  // Very small for pixel font
  },
  tabLabelFocused: {
    fontFamily: 'PressStart2P_400Regular',
    color: COLORS.accent,
    fontWeight: 'normal',
    fontSize: 6,
  },
  ```

  **Must NOT do**:
  - Do not change navigation structure
  - Do not change tab order
  - Do not modify haptic feedback

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file modification

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4, 5, 6)
  - **Blocks**: Task 9
  - **Blocked By**: Task 2

  **References**:
  - `taro-app/src/navigation/TabNavigator.tsx:1-125` - Current implementation
  - `taro-app/src/navigation/TabNavigator.tsx:84-124` - Styles to update

  **Acceptance Criteria**:
  ```bash
  # Agent runs TypeScript check:
  cd taro-app && npx tsc --noEmit
  # Assert: Exit code 0

  # Verify fontFamily added to tab labels:
  grep -c "PressStart2P" taro-app/src/navigation/TabNavigator.tsx
  # Assert: Output is 2 (tabLabel and tabLabelFocused)
  ```

  **Commit**: YES (commits all Wave 2 changes)
  - Message: `style(ui): apply pixel font and retro styling to all components`
  - Files:
    - `taro-app/src/components/GradientBackground.tsx`
    - `taro-app/src/components/PixelText.tsx`
    - `taro-app/src/components/PixelButton.tsx`
    - `taro-app/src/components/PixelCard.tsx`
    - `taro-app/src/navigation/TabNavigator.tsx`
  - Pre-commit: `cd taro-app && npx tsc --noEmit`

---

- [ ] 8. Setup Font Loading in App.tsx

  **What to do**:
  - Import useFonts hook and PressStart2P_400Regular font
  - Add font loading logic at app root
  - Show loading state while font loads
  - Ensure app doesn't render until font is ready

  **New App.tsx**:
  ```typescript
  import 'react-native-gesture-handler';
  import { StatusBar } from 'expo-status-bar';
  import { GestureHandlerRootView } from 'react-native-gesture-handler';
  import { StyleSheet, View, ActivityIndicator } from 'react-native';
  import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
  import { RootNavigator } from './src/navigation';
  import { COLORS } from './src/components/theme';

  export default function App() {
    const [fontsLoaded, fontError] = useFonts({
      PressStart2P_400Regular,
    });

    if (!fontsLoaded && !fontError) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      );
    }

    return (
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="light" />
        <RootNavigator />
      </GestureHandlerRootView>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.background,
    },
  });
  ```

  **Must NOT do**:
  - Do not change navigation structure
  - Do not remove GestureHandlerRootView
  - Do not add any other fonts

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file modification

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential)
  - **Blocks**: Task 9
  - **Blocked By**: Task 1, Task 4

  **References**:
  - `taro-app/App.tsx:1-21` - Current implementation
  - expo-google-fonts useFonts pattern

  **Acceptance Criteria**:
  ```bash
  # Agent runs TypeScript check:
  cd taro-app && npx tsc --noEmit
  # Assert: Exit code 0

  # Verify font import:
  grep "PressStart2P_400Regular" taro-app/App.tsx
  # Assert: Output shows import

  # Verify useFonts hook:
  grep "useFonts" taro-app/App.tsx
  # Assert: Output shows usage
  ```

  **Commit**: YES
  - Message: `feat(app): add Press Start 2P pixel font loading`
  - Files: `taro-app/App.tsx`
  - Pre-commit: `cd taro-app && npx tsc --noEmit`

---

- [ ] 9. Final Verification and Cleanup

  **What to do**:
  - Run full TypeScript check
  - Start Expo dev server
  - Visual verification via Expo Go:
    1. ALL text is in pixel font (blocky, retro look)
    2. NO gradients visible (solid backgrounds)
    3. ALL corners are sharp
    4. Colors are high-contrast (navy blue, gold, white)
    5. Shadows are block-style (offset, no blur)
  - Verify no console errors or warnings
  - Export PIXEL_FONT_FAMILY from components/index.ts if needed

  **Visual Verification Checklist**:
  - [ ] DailyScreen: Pixel font title, solid background, sharp card placeholder
  - [ ] SpreadsScreen: Pixel font, solid plum background, sharp topic cards
  - [ ] JourneyScreen: Pixel font, progress boxes sharp, skin cards sharp
  - [ ] TabNavigator: Pixel font labels, thick border, sharp focused state
  - [ ] Buttons: Pixel font text, block shadow, press animation works
  - [ ] Overall: Feels like "game menu" not "premium app"

  **Must NOT do**:
  - Do not add new features
  - Do not change business logic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Requires visual verification
  - **Skills**: `playwright` for potential screenshot verification

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (final)
  - **Blocks**: None
  - **Blocked By**: All previous tasks

  **References**:
  - All modified files:
    - `taro-app/package.json`
    - `taro-app/src/components/theme.ts`
    - `taro-app/src/components/GradientBackground.tsx`
    - `taro-app/src/components/PixelText.tsx`
    - `taro-app/src/components/PixelButton.tsx`
    - `taro-app/src/components/PixelCard.tsx`
    - `taro-app/src/navigation/TabNavigator.tsx`
    - `taro-app/App.tsx`

  **Acceptance Criteria**:
  ```bash
  # Agent runs full TypeScript check:
  cd taro-app && npx tsc --noEmit
  # Assert: Exit code 0, no errors

  # Agent starts Expo:
  cd taro-app && npx expo start --tunnel &
  sleep 10
  # Assert: Server starts without errors

  # Visual verification via Expo Go:
  # Scan QR code, verify:
  # 1. Pixel font renders on ALL text
  # 2. No gradients visible
  # 3. All corners sharp
  # 4. Retro colors (navy, gold, white)
  # 5. Block shadows (offset, no blur)
  ```

  **Evidence to Capture:**
  - [ ] Terminal output from `npx tsc --noEmit`
  - [ ] App running in Expo Go with retro appearance

  **Commit**: YES (if any final fixes needed)
  - Message: `chore: final cleanup for retro UI transformation`
  - Files: Any final fixes
  - Pre-commit: `cd taro-app && npx tsc --noEmit`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 2 | `style(theme): complete retro overhaul - new colors, no gradients, sharp corners` | theme.ts | `npx tsc --noEmit` |
| 7 | `style(ui): apply pixel font and retro styling to all components` | GradientBackground, PixelText, PixelButton, PixelCard, TabNavigator | `npx tsc --noEmit` |
| 8 | `feat(app): add Press Start 2P pixel font loading` | App.tsx | `npx tsc --noEmit` |
| 9 | `chore: final cleanup for retro UI transformation` | Any fixes | `npx tsc --noEmit` + visual |

---

## Success Criteria

### Verification Commands
```bash
# TypeScript check
cd taro-app && npx tsc --noEmit
# Expected: Exit code 0

# Check font package installed
cat taro-app/package.json | grep "press-start-2p"
# Expected: "@expo-google-fonts/press-start-2p" present

# Check new background color
grep "background:" taro-app/src/components/theme.ts | head -1
# Expected: Contains '#0f0f23'

# Check no LinearGradient in backgrounds
grep -c "LinearGradient" taro-app/src/components/GradientBackground.tsx
# Expected: 0

# Check pixel font usage
grep -c "PressStart2P" taro-app/src/components/PixelText.tsx
# Expected: 5+ (one per variant)

# Start app for visual verification
cd taro-app && npx expo start --tunnel
# Expected: App launches, QR code displayed
```

### Final Checklist
- [ ] All "Must Have" present:
  - [ ] Press Start 2P font loads and displays on ALL text
  - [ ] Solid backgrounds only (NO LinearGradient rendering)
  - [ ] Sharp corners everywhere (ALL RADIUS = 0)
  - [ ] High-contrast retro colors (navy blue, gold, white)
  - [ ] Block shadows only (offset, no blur, no glow)
- [ ] All "Must NOT Have" absent:
  - [ ] NO gradients visible anywhere
  - [ ] NO rounded corners
  - [ ] NO glow/blur shadows
  - [ ] NO soft effects
  - [ ] NO system fonts in PixelText
- [ ] TypeScript compiles without errors
- [ ] App runs in Expo Go without errors
- [ ] **UI FEELS LIKE A GAME MENU, NOT A PREMIUM APP**
