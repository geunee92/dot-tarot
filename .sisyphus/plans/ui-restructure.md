# Tarot App UI/UX Navigation Restructure

## TL;DR

> **Quick Summary**: Restructure the Pixel Talisman tarot app from a monolithic HomeScreen to a 4-tab bottom navigation (Daily, Spreads, Journey, Settings) to reduce information overload and improve UX.
> 
> **Deliverables**:
> - Install `@react-navigation/bottom-tabs`
> - New navigation architecture: Root Stack → Bottom Tabs → Modal screens
> - 3 new tab screens: `DailyScreen`, `SpreadsScreen`, `JourneyScreen`
> - Updated type definitions for nested navigation
> - Updated i18n keys for tab labels
> - Simplified HomeScreen (removed, functionality distributed)
> 
> **Estimated Effort**: Medium (8-12 hours)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Tasks 4,5,6 (parallel) → Task 7 → Task 8

---

## Context

### Original Request
"현재 한장 뽑기, 세장 뽑기, 달력 모두가 하나의 페이지에 있어서 정보량이 너무 많아"
(Too much information - daily card, 3-card spread, and calendar all crammed into one home screen)

### Interview Summary
**Key Discussions**:
- **Tab Structure**: 4 tabs (Daily, Spreads, Journey, Settings) - research-backed by competitor analysis
- **Deck Location**: Inside Journey tab with Calendar and History
- **Tab Icons**: Emoji (✨ 🔮 📅 ⚙️) - matches existing pixel art aesthetic
- **Ritual Immersion**: Modal presentation for DailyResult/SpreadResult to hide tabs

**Research Findings**:
- Successful tarot apps use 4-5 tab bottom navigation
- "Daily habit (quick) vs intentional exploration (deeper) should be SEPARATED"
- Golden Thread Tarot model: Daily card as hero element, separate from spreads

### Gap Analysis (Metis-Style Review)
**Identified Gaps** (addressed):
- Deep linking support: Out of scope for MVP
- Tab badge notifications: Out of scope
- Gesture navigation between tabs: Default RN behavior sufficient

**Guardrails Applied**:
- DO NOT modify DailyResultScreen or SpreadResultScreen
- DO NOT modify any Zustand stores
- DO NOT add new features
- MUST use COLORS from theme.ts for tab bar

---

## Work Objectives

### Core Objective
Restructure navigation from single-page monolith to 4-tab architecture, distributing HomeScreen sections across purpose-specific tabs while preserving all existing functionality.

### Concrete Deliverables
- `package.json` updated with `@react-navigation/bottom-tabs`
- `/src/navigation/types.ts` - New type definitions for nested navigation
- `/src/navigation/RootNavigator.tsx` - Refactored with bottom tabs
- `/src/navigation/TabNavigator.tsx` - NEW: Bottom tab navigator component
- `/src/screens/DailyScreen.tsx` - NEW: Daily card hero tab
- `/src/screens/SpreadsScreen.tsx` - NEW: Topic selection tab
- `/src/screens/JourneyScreen.tsx` - NEW: Calendar + History + Deck tab
- `/src/screens/index.ts` - Updated exports
- `/src/i18n/translations/en.json` - New tab label keys
- `/src/i18n/translations/ko.json` - Korean translations

### Definition of Done
- [ ] App launches with 4 visible tabs at bottom
- [ ] Daily tab shows only today's card draw functionality
- [ ] Spreads tab shows only topic selection (Love/Money/Work)
- [ ] Journey tab shows calendar, history access, and deck link
- [ ] Settings tab shows existing settings screen
- [ ] Tapping "Draw Card" navigates to DailyResult (modal, tabs hidden)
- [ ] Tapping a topic navigates to SpreadResult (modal, tabs hidden)
- [ ] Tapping calendar day navigates to HistoryDetail (modal, tabs hidden)
- [ ] All i18n strings render correctly in English and Korean
- [ ] No TypeScript errors (`npx tsc --noEmit` passes)

### Must Have
- 4-tab bottom navigation (Daily, Spreads, Journey, Settings)
- Modal presentation for result screens (hides tab bar)
- Emoji tab icons matching pixel art theme
- Type-safe navigation throughout
- i18n support for tab labels
- Preserve all haptic feedback

### Must NOT Have (Guardrails)
- NO modifications to DailyResultScreen.tsx
- NO modifications to SpreadResultScreen.tsx
- NO modifications to Zustand stores
- NO new features (only restructuring)
- NO redesigning Calendar component
- NO hardcoded colors (use theme.ts)
- NO new icon library dependencies
- NO "History List" screen (use existing HistoryDetail via calendar)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: Manual-only
- **Framework**: None (Playwright for UI verification)

### Automated Verification (Agent-Executable)

Each TODO includes verification using Playwright browser automation and terminal commands.

**Evidence Requirements:**
- Screenshots saved to `.sisyphus/evidence/`
- Command outputs captured and compared
- TypeScript compilation verified via `npx tsc --noEmit`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Install @react-navigation/bottom-tabs

Wave 2 (After Wave 1):
├── Task 2: Update navigation types (types.ts)
└── Task 3: Create TabNavigator component

Wave 3 (After Wave 2):
├── Task 4: Create DailyScreen
├── Task 5: Create SpreadsScreen
└── Task 6: Create JourneyScreen

Wave 4 (After Wave 3):
└── Task 7: Refactor RootNavigator (integrate tabs + modals)

Wave 5 (After Wave 4):
├── Task 8: Update i18n translations
└── Task 9: Update screen exports

Wave 6 (After Wave 5):
└── Task 10: Final integration verification

Critical Path: 1 → 2 → 3 → 7 → 10
Parallel Speedup: ~35% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3 | None |
| 2 | 1 | 3, 4, 5, 6, 7 | None |
| 3 | 2 | 7 | 4, 5, 6 |
| 4 | 2 | 7 | 3, 5, 6 |
| 5 | 2 | 7 | 3, 4, 6 |
| 6 | 2 | 7 | 3, 4, 5 |
| 7 | 3, 4, 5, 6 | 8, 9 | None |
| 8 | 7 | 10 | 9 |
| 9 | 7 | 10 | 8 |
| 10 | 8, 9 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1 | Quick task - single command |
| 2 | 2, 3 | Sequential (types must exist before TabNavigator) |
| 3 | 4, 5, 6 | Parallel - independent screen creation |
| 4 | 7 | Integration task |
| 5 | 8, 9 | Parallel - independent updates |
| 6 | 10 | Verification with Playwright |

---

## TODOs

### Task 1: Install Bottom Tabs Package

**What to do**:
- Install `@react-navigation/bottom-tabs` via bun
- Verify installation in package.json

**Must NOT do**:
- Install any other packages
- Modify any source files yet

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Single terminal command, no code changes
- **Skills**: None needed
- **Skills Evaluated but Omitted**:
  - `git-master`: Not needed until commit phase

**Parallelization**:
- **Can Run In Parallel**: NO (prerequisite for all)
- **Parallel Group**: Wave 1 (solo)
- **Blocks**: Tasks 2, 3
- **Blocked By**: None (can start immediately)

**References**:
- `taro-app/package.json:14` - Where @react-navigation/native-stack is declared (follow same version pattern)

**Acceptance Criteria**:

```bash
# Agent runs:
cd /Users/geunee/Desktop/taro/taro-app && bun add @react-navigation/bottom-tabs
# Assert: Exit code 0

# Verify:
grep -q "bottom-tabs" package.json
# Assert: Exit code 0 (package found in dependencies)
```

**Evidence to Capture:**
- [ ] Terminal output showing successful installation
- [ ] `package.json` diff showing new dependency

**Commit**: YES
- Message: `feat(nav): install @react-navigation/bottom-tabs`
- Files: `package.json`, `bun.lockb`
- Pre-commit: None

---

### Task 2: Update Navigation Type Definitions

**What to do**:
- Create new type definitions for bottom tab navigation
- Define `RootStackParamList` (for modal screens at root level)
- Define `TabParamList` (for bottom tabs)
- Define composite navigation types for screens
- Export all types

**Must NOT do**:
- Modify RootNavigator.tsx yet
- Create any screen files yet
- Add runtime code (types only)

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Small file, focused TypeScript types work
- **Skills**: None needed
- **Skills Evaluated but Omitted**:
  - `frontend-ui-ux`: Not visual work

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Wave 2 (sequential with Task 3)
- **Blocks**: Tasks 3, 4, 5, 6, 7
- **Blocked By**: Task 1

**References**:

**Pattern References** (existing code to follow):
- `taro-app/src/navigation/types.ts:1-31` - Current type structure to extend (NativeStackScreenProps pattern)

**API/Type References** (contracts to implement against):
- React Navigation v7 docs: Nested navigator types pattern
- `@react-navigation/bottom-tabs` exports `BottomTabScreenProps`

**WHY Each Reference Matters**:
- `types.ts:1-31`: Shows existing param list structure and screen props pattern - replicate for tabs
- Current `RootStackParamList` becomes the modal screens list at root level

**Acceptance Criteria**:

```bash
# Agent runs:
cd /Users/geunee/Desktop/taro/taro-app && npx tsc --noEmit src/navigation/types.ts
# Assert: Exit code 0 (no type errors)

# Verify types exist:
grep -q "TabParamList" src/navigation/types.ts
grep -q "DailyScreenProps" src/navigation/types.ts
grep -q "SpreadsScreenProps" src/navigation/types.ts
grep -q "JourneyScreenProps" src/navigation/types.ts
# Assert: All exit code 0
```

**Type Structure to Implement:**
```typescript
// Bottom tabs
export type TabParamList = {
  DailyTab: undefined;
  SpreadsTab: undefined;
  JourneyTab: undefined;
  SettingsTab: undefined;
};

// Root stack (modals + tabs)
export type RootStackParamList = {
  MainTabs: undefined;
  DailyResult: { dateKey: string; isNewDraw?: boolean };
  SpreadResult: { dateKey: string; spreadId: string; topic: SpreadTopic; isNewSpread?: boolean };
  HistoryDetail: { dateKey: string };
};

// Composite types for screens
export type DailyScreenProps = CompositeScreenProps<...>;
```

**Evidence to Capture:**
- [ ] TypeScript compilation success output
- [ ] Grep results showing all new types exist

**Commit**: YES (groups with Task 3)
- Message: `feat(nav): add bottom tab navigation types`
- Files: `src/navigation/types.ts`
- Pre-commit: `npx tsc --noEmit`

---

### Task 3: Create TabNavigator Component

**What to do**:
- Create new file `src/navigation/TabNavigator.tsx`
- Implement bottom tab navigator with 4 tabs
- Use COLORS from theme.ts for tab bar styling
- Use emoji icons (✨ 🔮 📅 ⚙️)
- Import placeholder screens (will be created in Tasks 4-6)

**Must NOT do**:
- Create the actual tab screens (Tasks 4-6)
- Modify RootNavigator yet (Task 7)
- Use hardcoded colors

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
  - Reason: UI component with visual styling (tab bar)
- **Skills**: [`frontend-ui-ux`]
  - `frontend-ui-ux`: Tab bar styling to match pixel art theme
- **Skills Evaluated but Omitted**:
  - `playwright`: Not verification phase yet

**Parallelization**:
- **Can Run In Parallel**: YES (with Tasks 4, 5, 6 after types ready)
- **Parallel Group**: Wave 3 (with 4, 5, 6)
- **Blocks**: Task 7
- **Blocked By**: Task 2

**References**:

**Pattern References** (existing code to follow):
- `taro-app/src/navigation/RootNavigator.tsx:16-20` - COLORS definition pattern
- `taro-app/src/navigation/RootNavigator.tsx:25-39` - Navigator screenOptions pattern

**API/Type References** (contracts to implement against):
- `taro-app/src/navigation/types.ts` (after Task 2) - TabParamList type
- `taro-app/src/components/theme.ts:1-39` - COLORS.background, COLORS.surface, COLORS.accent

**Documentation References**:
- React Navigation Bottom Tabs: `https://reactnavigation.org/docs/bottom-tab-navigator`

**WHY Each Reference Matters**:
- `RootNavigator.tsx:16-20`: Shows how colors are used in navigation options
- `theme.ts`: Source of truth for cosmic color palette - MUST use these values
- React Navigation docs: Tab bar styling options (`tabBarStyle`, `tabBarActiveTintColor`)

**Tab Bar Styling Requirements:**
```typescript
// Must match cosmic theme
tabBarStyle: {
  backgroundColor: COLORS.surface, // #1a1633
  borderTopColor: COLORS.border,   // #3d3557
  borderTopWidth: 2,               // pixel border
}
tabBarActiveTintColor: COLORS.accent,    // #FFD700
tabBarInactiveTintColor: COLORS.textMuted, // #b8b0c7
```

**Acceptance Criteria**:

```bash
# Agent runs:
cd /Users/geunee/Desktop/taro/taro-app && npx tsc --noEmit src/navigation/TabNavigator.tsx
# Assert: Exit code 0

# Verify structure:
grep -q "createBottomTabNavigator" src/navigation/TabNavigator.tsx
grep -q "COLORS.surface" src/navigation/TabNavigator.tsx
grep -q "COLORS.accent" src/navigation/TabNavigator.tsx
# Assert: All exit code 0 (theme colors used, not hardcoded)
```

**Evidence to Capture:**
- [ ] TypeScript compilation success
- [ ] Grep results showing theme colors are used

**Commit**: NO (groups with Task 7)

---

### Task 4: Create DailyScreen

**What to do**:
- Create new file `src/screens/DailyScreen.tsx`
- Extract daily card functionality from HomeScreen lines 207-235
- Implement hero-style layout for daily card (centered, prominent)
- Keep header with title only (no deck/settings buttons - those move to Journey/Settings)
- Use existing stores: `useDrawStore`, `useRewardStore`
- Preserve haptic feedback patterns
- Navigate to DailyResult via root stack (modal)

**Must NOT do**:
- Include spread functionality
- Include calendar functionality
- Modify existing stores
- Add new features

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
  - Reason: UI screen with layout considerations
- **Skills**: [`frontend-ui-ux`]
  - `frontend-ui-ux`: Hero card layout design
- **Skills Evaluated but Omitted**:
  - `git-master`: Not commit phase

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Tasks 3, 5, 6)
- **Blocks**: Task 7
- **Blocked By**: Task 2

**References**:

**Pattern References** (existing code to follow):
- `taro-app/src/screens/HomeScreen.tsx:207-235` - Daily card section to EXTRACT
- `taro-app/src/screens/HomeScreen.tsx:44-116` - Store usage pattern (useDrawStore, useRewardStore)
- `taro-app/src/screens/HomeScreen.tsx:167-178` - Loading state with hydration check

**API/Type References** (contracts to implement against):
- `taro-app/src/navigation/types.ts` (after Task 2) - DailyScreenProps
- `taro-app/src/stores/drawStore.ts` - useDrawStore hooks

**WHY Each Reference Matters**:
- `HomeScreen.tsx:207-235`: This is the EXACT code to extract - shows PixelCard, PixelButton usage
- `HomeScreen.tsx:44-116`: Shows hydration pattern (`isHydrated`) - MUST replicate
- `HomeScreen.tsx:167-178`: Loading spinner pattern for initial load

**Screen Structure:**
```tsx
// DailyScreen structure
- SafeAreaView (edges: ['top'])
  - Header (title: t('tabs.daily') or t('home.dailyCard'))
  - Hero Card Container (centered, prominent)
    - IF hasDrawnToday: Show PixelCard + "Tap to view"
    - ELSE: Show "Draw Today's Card" button
  - (Optional) Inspirational message or empty space
```

**Acceptance Criteria**:

```bash
# Agent runs:
cd /Users/geunee/Desktop/taro/taro-app && npx tsc --noEmit src/screens/DailyScreen.tsx
# Assert: Exit code 0

# Verify key elements:
grep -q "useDrawStore" src/screens/DailyScreen.tsx
grep -q "hasDrawnToday" src/screens/DailyScreen.tsx
grep -q "DailyResult" src/screens/DailyScreen.tsx
grep -q "PixelCard" src/screens/DailyScreen.tsx
# Assert: All exit code 0
```

**Playwright Verification (after full integration):**
```
1. Navigate to: Daily tab (http://localhost:8081)
2. Assert: No spread buttons visible
3. Assert: No calendar visible
4. Assert: "Draw Today's Card" button OR card image visible
5. Screenshot: .sisyphus/evidence/task-4-daily-screen.png
```

**Evidence to Capture:**
- [ ] TypeScript compilation success
- [ ] Screenshot of isolated daily tab

**Commit**: NO (groups with Task 7)

---

### Task 5: Create SpreadsScreen

**What to do**:
- Create new file `src/screens/SpreadsScreen.tsx`
- Extract 3-card spread functionality from HomeScreen lines 237-280
- Show topic selection (Love 💕, Money 💰, Work 💼)
- Include free spread status and AdBadge
- Use existing stores: `useSpreadStore`, `useGatingStore`
- Preserve haptic feedback patterns
- Navigate to SpreadResult via root stack (modal)

**Must NOT do**:
- Include daily card functionality
- Include calendar functionality
- Modify existing stores
- Add new spread types

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
  - Reason: UI screen with card-based layout
- **Skills**: [`frontend-ui-ux`]
  - `frontend-ui-ux`: Topic card grid layout
- **Skills Evaluated but Omitted**:
  - `playwright`: Not verification phase

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Tasks 3, 4, 6)
- **Blocks**: Task 7
- **Blocked By**: Task 2

**References**:

**Pattern References** (existing code to follow):
- `taro-app/src/screens/HomeScreen.tsx:237-280` - Spread section to EXTRACT
- `taro-app/src/screens/HomeScreen.tsx:38-42` - TOPIC_IDS constant definition
- `taro-app/src/screens/HomeScreen.tsx:118-144` - handleTopicPress implementation

**API/Type References** (contracts to implement against):
- `taro-app/src/navigation/types.ts` (after Task 2) - SpreadsScreenProps
- `taro-app/src/stores/spreadStore.ts` - useSpreadStore hooks
- `taro-app/src/stores/gatingStore.ts` - useGatingStore.canDoFreeSpread

**WHY Each Reference Matters**:
- `HomeScreen.tsx:237-280`: EXACT code to extract - topic buttons and AdBadge
- `HomeScreen.tsx:38-42`: TOPIC_IDS array - copy this constant
- `HomeScreen.tsx:118-144`: Free spread gating logic - preserve exactly

**Screen Structure:**
```tsx
// SpreadsScreen structure
- SafeAreaView (edges: ['top'])
  - Header (title: t('home.spreadTitle'), with AdBadge if !freeSpreadAvailable)
  - Topic hint text
  - Topic buttons grid (Love, Money, Work)
    - Each button: emoji + label + loading spinner when creating
```

**Acceptance Criteria**:

```bash
# Agent runs:
cd /Users/geunee/Desktop/taro/taro-app && npx tsc --noEmit src/screens/SpreadsScreen.tsx
# Assert: Exit code 0

# Verify key elements:
grep -q "useSpreadStore" src/screens/SpreadsScreen.tsx
grep -q "useGatingStore" src/screens/SpreadsScreen.tsx
grep -q "canDoFreeSpread" src/screens/SpreadsScreen.tsx
grep -q "TOPIC_IDS\|LOVE\|MONEY\|WORK" src/screens/SpreadsScreen.tsx
# Assert: All exit code 0
```

**Playwright Verification (after full integration):**
```
1. Navigate to: Spreads tab
2. Assert: 3 topic buttons visible (Love, Money, Work)
3. Assert: No daily card section visible
4. Assert: No calendar visible
5. Screenshot: .sisyphus/evidence/task-5-spreads-screen.png
```

**Evidence to Capture:**
- [ ] TypeScript compilation success
- [ ] Screenshot of isolated spreads tab

**Commit**: NO (groups with Task 7)

---

### Task 6: Create JourneyScreen

**What to do**:
- Create new file `src/screens/JourneyScreen.tsx`
- Extract calendar functionality from HomeScreen lines 282-295
- Add Deck section below calendar (attendance progress + skin collection)
- Consolidate "journey" experience: Calendar → History (via day tap) → Collection
- Use existing stores: `useDrawStore`, `useSpreadStore`, `useRewardStore`
- Use existing `CalendarGrid` component
- Navigate to HistoryDetail via root stack (modal)

**Must NOT do**:
- Create a new "History List" screen (use existing HistoryDetail)
- Redesign CalendarGrid component
- Include daily card or spread functionality
- Modify stores

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
  - Reason: Complex screen with multiple sections
- **Skills**: [`frontend-ui-ux`]
  - `frontend-ui-ux`: Section layout and hierarchy
- **Skills Evaluated but Omitted**:
  - `playwright`: Not verification phase

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Tasks 3, 4, 5)
- **Blocks**: Task 7
- **Blocked By**: Task 2

**References**:

**Pattern References** (existing code to follow):
- `taro-app/src/screens/HomeScreen.tsx:282-295` - Calendar section to EXTRACT
- `taro-app/src/screens/HomeScreen.tsx:146-160` - Calendar navigation handlers
- `taro-app/src/screens/DeckScreen.tsx:103-176` - Deck content to INLINE (progress + skins)

**API/Type References** (contracts to implement against):
- `taro-app/src/navigation/types.ts` (after Task 2) - JourneyScreenProps
- `taro-app/src/components/Calendar/CalendarGrid.tsx` - CalendarGrid props interface

**WHY Each Reference Matters**:
- `HomeScreen.tsx:282-295`: Calendar section with CalendarGrid usage
- `HomeScreen.tsx:146-160`: Month navigation handlers (previous/next)
- `DeckScreen.tsx:103-176`: This content should be INLINED into JourneyScreen (not navigate away)

**Screen Structure:**
```tsx
// JourneyScreen structure
- SafeAreaView (edges: ['top'])
  - ScrollView
    - Header (title: t('tabs.journey'))
    - Calendar Section
      - CalendarGrid (existing component)
      - onDayPress -> navigate to HistoryDetail (modal)
    - Deck Section (inlined from DeckScreen)
      - Attendance Progress box
      - Unlocked Skins list
      - Locked Skins list (collapsed/expandable?)
```

**Acceptance Criteria**:

```bash
# Agent runs:
cd /Users/geunee/Desktop/taro/taro-app && npx tsc --noEmit src/screens/JourneyScreen.tsx
# Assert: Exit code 0

# Verify key elements:
grep -q "CalendarGrid" src/screens/JourneyScreen.tsx
grep -q "useRewardStore" src/screens/JourneyScreen.tsx
grep -q "HistoryDetail" src/screens/JourneyScreen.tsx
grep -q "getUnlockedSkins\|unlockedSkins" src/screens/JourneyScreen.tsx
# Assert: All exit code 0
```

**Playwright Verification (after full integration):**
```
1. Navigate to: Journey tab
2. Assert: Calendar visible
3. Assert: Attendance progress section visible
4. Assert: Skin collection section visible
5. Assert: No daily card or spread buttons
6. Screenshot: .sisyphus/evidence/task-6-journey-screen.png
```

**Evidence to Capture:**
- [ ] TypeScript compilation success
- [ ] Screenshot of journey tab with calendar and deck sections

**Commit**: NO (groups with Task 7)

---

### Task 7: Refactor RootNavigator (Integration)

**What to do**:
- Refactor `src/navigation/RootNavigator.tsx` to use new architecture
- Structure: Root Stack contains TabNavigator + Modal screens
- Configure modal presentation for DailyResult, SpreadResult, HistoryDetail
- Remove old HomeScreen from navigation
- Update navigation index.ts if needed

**Must NOT do**:
- Modify individual tab screens
- Change modal screen implementations (DailyResultScreen, etc.)
- Add new screens

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
  - Reason: Navigation integration with visual impact
- **Skills**: [`frontend-ui-ux`]
  - `frontend-ui-ux`: Navigation flow and transitions
- **Skills Evaluated but Omitted**:
  - `git-master`: Will commit after this task

**Parallelization**:
- **Can Run In Parallel**: NO (integration point)
- **Parallel Group**: Wave 4 (solo)
- **Blocks**: Tasks 8, 9
- **Blocked By**: Tasks 3, 4, 5, 6

**References**:

**Pattern References** (existing code to follow):
- `taro-app/src/navigation/RootNavigator.tsx:1-95` - Current structure to REFACTOR
- `taro-app/src/navigation/RootNavigator.tsx:75-83` - HistoryDetail modal config (reuse)

**API/Type References** (contracts to implement against):
- `taro-app/src/navigation/types.ts` (after Task 2) - RootStackParamList
- `taro-app/src/navigation/TabNavigator.tsx` (Task 3) - TabNavigator component

**Documentation References**:
- React Navigation: Nesting navigators best practices

**WHY Each Reference Matters**:
- `RootNavigator.tsx:1-95`: This is the file being refactored - understand current structure
- `RootNavigator.tsx:75-83`: Modal presentation config - reuse for all modals
- `TabNavigator.tsx`: Import and render this as the main tabs screen

**New Structure:**
```tsx
// RootNavigator new structure
<NavigationContainer>
  <Stack.Navigator>
    <Stack.Screen 
      name="MainTabs" 
      component={TabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="DailyResult" 
      component={DailyResultScreen}
      options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
    />
    <Stack.Screen 
      name="SpreadResult" 
      component={SpreadResultScreen}
      options={{ presentation: 'modal' }}
    />
    <Stack.Screen 
      name="HistoryDetail" 
      component={HistoryDetailScreen}
      options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
    />
  </Stack.Navigator>
</NavigationContainer>
```

**Acceptance Criteria**:

```bash
# Agent runs:
cd /Users/geunee/Desktop/taro/taro-app && npx tsc --noEmit
# Assert: Exit code 0 (full project compiles)

# Verify structure:
grep -q "MainTabs" src/navigation/RootNavigator.tsx
grep -q "TabNavigator" src/navigation/RootNavigator.tsx
grep -q "presentation: 'modal'" src/navigation/RootNavigator.tsx
# Assert: All exit code 0
```

**Evidence to Capture:**
- [ ] Full TypeScript compilation success
- [ ] Grep results showing new navigation structure

**Commit**: YES
- Message: `feat(nav): restructure to bottom tab navigation with modal screens`
- Files: `src/navigation/RootNavigator.tsx`, `src/navigation/TabNavigator.tsx`, `src/navigation/types.ts`, `src/screens/DailyScreen.tsx`, `src/screens/SpreadsScreen.tsx`, `src/screens/JourneyScreen.tsx`, `src/navigation/index.ts`
- Pre-commit: `npx tsc --noEmit`

---

### Task 8: Update i18n Translations

**What to do**:
- Add new translation keys for tab labels in both en.json and ko.json
- Add keys: `tabs.daily`, `tabs.spreads`, `tabs.journey`, `tabs.settings`
- Ensure existing keys are not modified

**Must NOT do**:
- Restructure existing translation keys
- Remove any existing translations
- Add translations for features not being implemented

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Small JSON edits
- **Skills**: None needed
- **Skills Evaluated but Omitted**:
  - All skills: Simple JSON updates

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 5 (with Task 9)
- **Blocks**: Task 10
- **Blocked By**: Task 7

**References**:

**Pattern References** (existing code to follow):
- `taro-app/src/i18n/translations/en.json:1-108` - Existing structure (nested by feature)
- `taro-app/src/i18n/translations/ko.json` - Korean translations to mirror

**WHY Each Reference Matters**:
- `en.json:1-108`: Shows nesting pattern - add new `tabs` key at root level
- Both files must stay in sync with same key structure

**Translations to Add:**
```json
// en.json - add at root level
"tabs": {
  "daily": "Daily",
  "spreads": "Spreads", 
  "journey": "Journey",
  "settings": "Settings"
}

// ko.json - add at root level
"tabs": {
  "daily": "오늘의 카드",
  "spreads": "스프레드",
  "journey": "여정",
  "settings": "설정"
}
```

**Acceptance Criteria**:

```bash
# Agent runs:
cd /Users/geunee/Desktop/taro/taro-app

# Verify en.json:
grep -q '"tabs"' src/i18n/translations/en.json
grep -q '"daily"' src/i18n/translations/en.json
# Assert: Exit code 0

# Verify ko.json:
grep -q '"tabs"' src/i18n/translations/ko.json
grep -q '"오늘의 카드"' src/i18n/translations/ko.json
# Assert: Exit code 0

# Verify JSON validity:
node -e "require('./src/i18n/translations/en.json')"
node -e "require('./src/i18n/translations/ko.json')"
# Assert: Exit code 0 (valid JSON)
```

**Evidence to Capture:**
- [ ] Grep results showing new keys
- [ ] JSON parse success

**Commit**: YES (groups with Task 9)
- Message: `feat(i18n): add tab navigation translations`
- Files: `src/i18n/translations/en.json`, `src/i18n/translations/ko.json`
- Pre-commit: `node -e "require('./src/i18n/translations/en.json')"`

---

### Task 9: Update Screen Exports

**What to do**:
- Update `src/screens/index.ts` to export new screens
- Add exports: DailyScreen, SpreadsScreen, JourneyScreen
- Optionally remove HomeScreen export (or keep for reference)

**Must NOT do**:
- Delete HomeScreen.tsx file (keep for reference/rollback)
- Modify screen implementations

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Single file, few lines
- **Skills**: None needed
- **Skills Evaluated but Omitted**:
  - All skills: Simple export additions

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 5 (with Task 8)
- **Blocks**: Task 10
- **Blocked By**: Task 7

**References**:

**Pattern References** (existing code to follow):
- `taro-app/src/screens/index.ts:1-7` - Current export pattern

**WHY Each Reference Matters**:
- `index.ts:1-7`: Follow same export pattern for new screens

**New Exports to Add:**
```typescript
export { DailyScreen } from './DailyScreen';
export { SpreadsScreen } from './SpreadsScreen';
export { JourneyScreen } from './JourneyScreen';
// Keep HomeScreen export commented or removed
```

**Acceptance Criteria**:

```bash
# Agent runs:
cd /Users/geunee/Desktop/taro/taro-app

grep -q "DailyScreen" src/screens/index.ts
grep -q "SpreadsScreen" src/screens/index.ts
grep -q "JourneyScreen" src/screens/index.ts
# Assert: All exit code 0

npx tsc --noEmit src/screens/index.ts
# Assert: Exit code 0
```

**Evidence to Capture:**
- [ ] Grep results showing new exports
- [ ] TypeScript compilation success

**Commit**: YES (groups with Task 8)
- Message: `feat(screens): export new tab screens`
- Files: `src/screens/index.ts`
- Pre-commit: `npx tsc --noEmit`

---

### Task 10: Final Integration Verification

**What to do**:
- Start the Expo development server
- Verify all 4 tabs appear and are navigable
- Verify modal screens work correctly
- Verify i18n strings display correctly
- Capture evidence screenshots
- Run full TypeScript check

**Must NOT do**:
- Make code changes (verification only)
- Skip any verification steps

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
  - Reason: UI verification with screenshots
- **Skills**: [`playwright`, `dev-browser`]
  - `playwright`: Browser automation for verification
  - `dev-browser`: Expo web verification
- **Skills Evaluated but Omitted**:
  - `frontend-ui-ux`: Not building, only verifying

**Parallelization**:
- **Can Run In Parallel**: NO (final verification)
- **Parallel Group**: Wave 6 (solo, final)
- **Blocks**: None (final task)
- **Blocked By**: Tasks 8, 9

**References**:

**Pattern References**:
- All previous task acceptance criteria

**Acceptance Criteria**:

**TypeScript Verification:**
```bash
# Agent runs:
cd /Users/geunee/Desktop/taro/taro-app && npx tsc --noEmit
# Assert: Exit code 0, no errors
```

**App Launch Verification:**
```bash
# Agent runs (background):
cd /Users/geunee/Desktop/taro/taro-app && bun start --web &
# Wait for server ready
sleep 10
```

**Playwright Verification:**
```
1. Navigate to: http://localhost:8081

2. VERIFY TAB BAR:
   - Assert: 4 tabs visible at bottom
   - Assert: Tab labels match i18n (Daily/오늘의 카드, Spreads/스프레드, Journey/여정, Settings/설정)
   - Screenshot: .sisyphus/evidence/task-10-tab-bar.png

3. VERIFY DAILY TAB:
   - Click: Daily tab
   - Assert: Daily card section visible
   - Assert: No spreads or calendar visible
   - Screenshot: .sisyphus/evidence/task-10-daily-tab.png

4. VERIFY SPREADS TAB:
   - Click: Spreads tab
   - Assert: 3 topic buttons visible (Love, Money, Work)
   - Assert: No daily card or calendar visible
   - Screenshot: .sisyphus/evidence/task-10-spreads-tab.png

5. VERIFY JOURNEY TAB:
   - Click: Journey tab
   - Assert: Calendar visible
   - Assert: Deck/Collection section visible
   - Assert: No daily card or spread buttons
   - Screenshot: .sisyphus/evidence/task-10-journey-tab.png

6. VERIFY SETTINGS TAB:
   - Click: Settings tab
   - Assert: Settings screen visible
   - Screenshot: .sisyphus/evidence/task-10-settings-tab.png

7. VERIFY MODAL NAVIGATION:
   - Click: Daily tab
   - Click: "Draw Today's Card" button (if available)
   - Assert: Modal slides up
   - Assert: Tab bar NOT visible during modal
   - Screenshot: .sisyphus/evidence/task-10-modal-no-tabs.png
   - Click: Back/Close
   - Assert: Returns to Daily tab
   - Assert: Tab bar visible again

8. VERIFY I18N (optional - switch to Korean):
   - Navigate to Settings
   - Change language to Korean
   - Assert: Tab labels update to Korean
   - Screenshot: .sisyphus/evidence/task-10-korean-tabs.png
```

**Evidence to Capture:**
- [ ] TypeScript compilation success (`npx tsc --noEmit` exit code 0)
- [ ] Screenshot: Tab bar with 4 tabs
- [ ] Screenshot: Daily tab isolation
- [ ] Screenshot: Spreads tab isolation
- [ ] Screenshot: Journey tab with calendar + deck
- [ ] Screenshot: Settings tab
- [ ] Screenshot: Modal hiding tab bar
- [ ] Screenshot: Korean language tabs (optional)

**Commit**: YES (final)
- Message: `docs(evidence): add verification screenshots`
- Files: `.sisyphus/evidence/*.png`
- Pre-commit: None

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(nav): install @react-navigation/bottom-tabs` | package.json, bun.lockb | grep |
| 7 | `feat(nav): restructure to bottom tab navigation` | RootNavigator, TabNavigator, types, 3 screens | `npx tsc --noEmit` |
| 8+9 | `feat: add tab translations and exports` | i18n/*.json, screens/index.ts | `npx tsc --noEmit` |
| 10 | `docs(evidence): add verification screenshots` | .sisyphus/evidence/*.png | - |

---

## Success Criteria

### Verification Commands
```bash
# TypeScript compilation (no errors)
cd /Users/geunee/Desktop/taro/taro-app && npx tsc --noEmit
# Expected: Exit code 0

# Package installed
grep "@react-navigation/bottom-tabs" package.json
# Expected: version string found

# New files exist
ls src/screens/DailyScreen.tsx src/screens/SpreadsScreen.tsx src/screens/JourneyScreen.tsx
# Expected: All files found

# App starts
bun start --web
# Expected: Development server starts, no crash
```

### Final Checklist
- [ ] 4-tab bottom navigation appears (Daily, Spreads, Journey, Settings)
- [ ] Each tab shows ONLY its designated content (separation achieved)
- [ ] Modal screens hide tab bar during display
- [ ] Back navigation works from all screens
- [ ] i18n works in both English and Korean
- [ ] No TypeScript errors
- [ ] All haptic feedback preserved
- [ ] Theme colors used consistently (no hardcoded values)
- [ ] HomeScreen.tsx preserved but not used (for rollback safety)
