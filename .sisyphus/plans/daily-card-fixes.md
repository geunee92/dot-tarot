# Daily Card Save Timing + Text Clipping Fixes

## TL;DR

> **Quick Summary**: Fix two bugs: (1) Daily card saves before user reveals it - should only save after flip, (2) Card text clips in 3-card spread view due to insufficient height allocation.
> 
> **Deliverables**:
> - Modified drawStore with `prepareDraw`/`confirmDraw` pattern and persisted `pendingDraw`
> - Updated DailyScreen to use `prepareDraw` instead of `createDraw`
> - Updated DailyResultScreen to call `confirmDraw` on flip complete
> - Increased CARD_INFO_HEIGHTS in TarotCardFlip to prevent text clipping
> 
> **Estimated Effort**: Medium (3-4 hours)
> **Parallel Execution**: YES - 2 waves (Issue 2 is independent of Issue 1)
> **Critical Path**: Task 1 -> Task 2 -> Task 3 -> Task 5

---

## Context

### Original Request
Fix two issues in React Native Expo 54 Tarot App:
1. Daily card is saved to AsyncStorage BEFORE user reveals (flips) it - should only persist after reveal
2. Card text (talisman line, keywords) clips in TarotCardFlip component in 3-card spread view

### Interview Summary
**Key Discussions**:
- Issue 1 requires separating card generation from persistence
- Approach B chosen: `prepareDraw` (generate, no save) + `confirmDraw` (persist) pattern
- Issue 2 caused by fixed `CARD_INFO_HEIGHTS` being too small for content

**Research Findings**:
- `drawStore.ts:132` - immediate `setItem()` call causes premature persistence
- `TarotCardFlip.tsx:31-35` - CARD_INFO_HEIGHTS = {small:80, medium:100, large:120}
- Content calculation: ~112px needed for medium, but only 100px allocated
- No test infrastructure exists - manual verification via Expo Go

### Metis Review
**Identified Gaps** (addressed):
- **Destiny vs Randomness**: If app crashes between prepare/confirm, user should get SAME card (Destiny). Solution: Persist `pendingDraw` separately.
- **Midnight Problem**: Card should save to the date when `prepareDraw` was called, not when `confirmDraw` executes. Solution: Store `dateKey` with pendingDraw.
- **Back Navigation**: Must clear `pendingDraw` when user navigates back without revealing. Solution: Add cleanup in navigation listener.
- **Magic Number Fragility**: Fixed heights may still clip on localized text. Solution: Accept increased heights as reasonable tradeoff, document limitation.

---

## Work Objectives

### Core Objective
Ensure daily card is only persisted after user reveals it, and fix text clipping in card info section.

### Concrete Deliverables
- `drawStore.ts`: New `prepareDraw`, `confirmDraw`, `clearPendingDraw` actions + `pendingDraw` state
- `DailyScreen.tsx`: Use `prepareDraw` instead of `createDraw`
- `DailyResultScreen.tsx`: Call `confirmDraw` on flip, cleanup on back navigation
- `TarotCardFlip.tsx`: Increased `CARD_INFO_HEIGHTS` values

### Definition of Done
- [ ] User can press "Draw Card", see card back, press back button -> card NOT saved for today
- [ ] User can press "Draw Card", flip card to reveal -> card IS saved for today
- [ ] App crash after draw but before reveal -> same card shown on relaunch (Destiny preserved)
- [ ] 3-card spread shows full talisman line without clipping on medium-sized cards
- [ ] All changes tested on iOS simulator via Expo Go

### Must Have
- `pendingDraw` must be persisted separately (not in `draws` record) to survive app crashes
- `dateKey` must be captured at prepare time, not confirm time (Midnight Problem)
- Back navigation must clear `pendingDraw` to allow fresh draw

### Must NOT Have (Guardrails)
- Do NOT persist `pendingDraw` in the main `draws` record (pollutes history)
- Do NOT add "re-roll" or "redraw" functionality (scope creep)
- Do NOT refactor the flip animation (out of scope)
- Do NOT use percentage-based or ScrollView layout for cardInfo (keep predictable heights for FlipCard animation)
- Do NOT touch SpreadResultScreen or spreadStore (different flow, separate concern)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: Manual-only (TDD not requested)
- **Framework**: none

### Automated Verification (Manual via Expo Go)

Each TODO includes manual verification steps the executor can perform via the Expo Go app on iOS Simulator.

**Evidence Requirements:**
- Screenshots saved to .sisyphus/evidence/ showing expected behavior
- Console logs captured for state verification
- Specific user flows documented with expected outcomes

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: drawStore - Add prepareDraw/confirmDraw pattern
└── Task 4: TarotCardFlip - Increase CARD_INFO_HEIGHTS (INDEPENDENT)

Wave 2 (After Task 1):
├── Task 2: DailyScreen - Use prepareDraw
└── Task 3: DailyResultScreen - Confirm on flip, cleanup on back

Wave 3 (After Tasks 2, 3, 4):
└── Task 5: Integration testing and verification

Critical Path: Task 1 -> Task 2 -> Task 3 -> Task 5
Parallel Speedup: ~30% faster (Task 4 runs parallel to Wave 1-2)
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3 | 4 |
| 2 | 1 | 5 | 3, 4 |
| 3 | 1 | 5 | 2, 4 |
| 4 | None | 5 | 1, 2, 3 |
| 5 | 2, 3, 4 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Approach |
|------|-------|---------------------|
| 1 | 1, 4 | Parallel execution - both are independent |
| 2 | 2, 3 | Parallel after Task 1 completes |
| 3 | 5 | Sequential - final verification |

---

## TODOs

- [ ] 1. Add prepareDraw/confirmDraw Pattern to drawStore

  **What to do**:
  - Add `pendingDraw: DailyDraw | null` to DrawState interface
  - Add `PENDING_DRAW_KEY = 'taro-pending-draw'` storage key
  - Implement `prepareDraw(dateKey?: string)`:
    - Check if draw already exists for date (return existing if so)
    - Generate new card with `drawRandomCard()`
    - Create DailyDraw object with `dateKey` captured NOW
    - Save to `PENDING_DRAW_KEY` in AsyncStorage (separate from main draws)
    - Update `pendingDraw` state
    - Return the DailyDraw
  - Implement `confirmDraw()`:
    - Take `pendingDraw` from state
    - If null, do nothing (idempotent)
    - Save to main storage with `setItem(getDrawKey(pendingDraw.dateKey), pendingDraw)`
    - Update `draws` state
    - Clear `pendingDraw` state and AsyncStorage key
    - Return the confirmed DailyDraw
  - Implement `clearPendingDraw()`:
    - Remove from AsyncStorage
    - Set `pendingDraw` to null
  - Update `onRehydrateStorage` to load `pendingDraw` from storage on app start
  - Update `hasDrawnToday()` to return true if there's a matching `pendingDraw` OR confirmed draw

  **Must NOT do**:
  - Do NOT store pendingDraw in the `draws` record
  - Do NOT add re-roll functionality
  - Do NOT change the existing `createDraw` function (keep for backward compatibility with SpreadScreen)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Focused state management change with clear boundaries
  - **Skills**: None required
    - No browser, git, or UI skills needed for store logic

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 4)
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `src/stores/drawStore.ts:104-140` - Existing `createDraw` function pattern (check cache, check storage, generate, persist)
  - `src/stores/drawStore.ts:178-187` - Zustand persist middleware configuration pattern

  **API/Type References** (contracts to implement against):
  - `src/types/index.ts:DailyDraw` - The DailyDraw type structure to use
  - `src/utils/storage.ts:getDrawKey,setItem,getItem` - Storage utility functions

  **Why Each Reference Matters**:
  - `createDraw` shows the existing pattern for generating and persisting - new functions should follow similar structure but split the concerns
  - Persist middleware config shows how rehydration works - need to extend for pendingDraw

  **Acceptance Criteria**:

  **Automated Verification (via Expo Go on iOS Simulator)**:
  ```
  # Scenario A: prepareDraw stores pendingDraw
  1. Open app in Expo Go
  2. On DailyScreen, add console.log before createDraw call
  3. Tap "Draw Card" button
  4. Check console: pendingDraw should be set
  5. Force close app (cmd+shift+H twice, swipe up)
  6. Reopen app
  7. Check console on hydration: pendingDraw should be restored
  
  # Scenario B: confirmDraw moves to draws
  1. After prepareDraw, call confirmDraw from console
  2. Check: draws[dateKey] should now contain the card
  3. Check: pendingDraw should be null
  4. Check: AsyncStorage PENDING_DRAW_KEY should be removed
  
  # Scenario C: clearPendingDraw cleans up
  1. Call prepareDraw, verify pendingDraw exists
  2. Call clearPendingDraw
  3. Check: pendingDraw is null
  4. Force close and reopen: pendingDraw should NOT restore
  ```

  **Evidence to Capture:**
  - [ ] Console log showing pendingDraw state after prepareDraw
  - [ ] Console log showing draws state after confirmDraw
  - [ ] Console log showing state after app restart with pending draw

  **Commit**: YES
  - Message: `fix(store): add prepareDraw/confirmDraw pattern for deferred persistence`
  - Files: `src/stores/drawStore.ts`
  - Pre-commit: Manual verification via console logs

---

- [ ] 2. Update DailyScreen to Use prepareDraw

  **What to do**:
  - Import `prepareDraw` from drawStore (add to existing imports)
  - In `handleDrawCard`:
    - Replace `await createDraw(dateKey)` with `await prepareDraw(dateKey)`
    - Keep navigation to DailyResult with same params
  - Update `hasDrawnToday` selector usage to also check for existing pendingDraw (if store updated correctly, this should work automatically)

  **Must NOT do**:
  - Do NOT change navigation params structure
  - Do NOT add any new UI elements
  - Do NOT modify the loading state logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple function swap, minimal code change
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 3)
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/screens/DailyScreen.tsx:52-64` - Current `handleDrawCard` implementation to modify
  - `src/screens/DailyScreen.tsx:38` - Current `createDraw` import to change to `prepareDraw`

  **Why Each Reference Matters**:
  - Line 59 is the exact location of `await createDraw(dateKey)` that needs to change to `await prepareDraw(dateKey)`

  **Acceptance Criteria**:

  **Automated Verification (via Expo Go)**:
  ```
  # Scenario: Draw button calls prepareDraw, not createDraw
  1. Open app, navigate to Daily tab
  2. Tap "Draw Card" button
  3. Verify navigation to DailyResultScreen occurs
  4. Check console: prepareDraw was called (not createDraw)
  5. Check: draws[today] should NOT exist yet
  6. Check: pendingDraw should contain the card
  ```

  **Evidence to Capture:**
  - [ ] Console log showing prepareDraw called instead of createDraw
  - [ ] Screenshot of DailyResultScreen showing card back (unflipped)

  **Commit**: NO (groups with Task 3)

---

- [ ] 3. Update DailyResultScreen to Confirm on Flip and Cleanup on Back

  **What to do**:
  - Import `confirmDraw` and `clearPendingDraw` from drawStore
  - Modify `handleFlipComplete`:
    - After `setHasFlipped(true)`, call `await confirmDraw()`
    - This persists the card only after user reveals it
  - Add navigation listener for back navigation:
    - Use `navigation.addListener('beforeRemove', ...)` in useEffect
    - If `isNewDraw && !hasFlipped`, call `clearPendingDraw()` before allowing navigation
    - This ensures uncommitted draws are cleaned up
  - Handle the case where user re-enters screen after app restart with pendingDraw:
    - If `isNewDraw` and `pendingDraw` exists but no draw in `draws`, use `pendingDraw` data

  **Must NOT do**:
  - Do NOT block navigation (don't prevent back button)
  - Do NOT show confirmation dialog
  - Do NOT modify the flip animation

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Event handler updates with clear logic
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 2)
  - **Parallel Group**: Wave 2 (with Task 2)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/screens/DailyResultScreen.tsx:61-68` - Current `handleFlipComplete` to extend
  - `src/screens/DailyResultScreen.tsx:83-85` - Current `handleGoBack` pattern
  - `src/screens/SpreadResultScreen.tsx:69-75` - Example of callback pattern after card flip

  **API/Type References**:
  - React Navigation `beforeRemove` event: https://reactnavigation.org/docs/preventing-going-back/

  **Why Each Reference Matters**:
  - `handleFlipComplete` is where `confirmDraw()` must be called
  - `beforeRemove` listener pattern ensures cleanup happens BEFORE navigation completes

  **Acceptance Criteria**:

  **Automated Verification (via Expo Go)**:
  ```
  # Scenario A: Card saved on flip
  1. Tap "Draw Card" on DailyScreen
  2. See card back on DailyResultScreen
  3. Tap "Reveal" button (or tap card to flip)
  4. After flip animation completes:
     - Check: draws[today] should now exist
     - Check: pendingDraw should be null
  5. Press back button
  6. On DailyScreen: should show "already drawn today" state
  
  # Scenario B: Card NOT saved if back before flip
  1. Tap "Draw Card" on DailyScreen
  2. See card back on DailyResultScreen
  3. Press back button WITHOUT flipping
  4. Check: draws[today] should NOT exist
  5. Check: pendingDraw should be null (cleared)
  6. On DailyScreen: should show "Draw Card" button again
  7. Tap "Draw Card" again: should get a NEW random card
  
  # Scenario C: App crash recovery (Destiny)
  1. Tap "Draw Card" on DailyScreen
  2. See card back on DailyResultScreen
  3. Force close app (don't flip)
  4. Reopen app, tap "Draw Card"
  5. Should see SAME card (pendingDraw restored)
  6. Flip the card
  7. Card should now be saved
  ```

  **Evidence to Capture:**
  - [ ] Screenshot: Card back visible before flip
  - [ ] Console log: confirmDraw called after flip
  - [ ] Console log: clearPendingDraw called on back navigation
  - [ ] Screenshot: DailyScreen shows "Draw Card" after back without flip

  **Commit**: YES (groups Task 2 + Task 3)
  - Message: `fix(daily): only persist card after user reveals it`
  - Files: `src/screens/DailyScreen.tsx`, `src/screens/DailyResultScreen.tsx`
  - Pre-commit: Manual verification scenarios A, B, C

---

- [ ] 4. Increase CARD_INFO_HEIGHTS in TarotCardFlip

  **What to do**:
  - Update `CARD_INFO_HEIGHTS` constant:
    - `small: 80` -> `small: 95` (+15px)
    - `medium: 100` -> `medium: 130` (+30px)
    - `large: 120` -> `large: 150` (+30px)
  - These values provide sufficient space for:
    - cardName (16px + line height)
    - orientationBadge (~18px)
    - keywordsContainer (3 keywords, ~16px)
    - talismanLine (~18px + margin)
    - padding (12px top + 12px bottom)
    - gaps (8px x 3 = 24px)

  **Must NOT do**:
  - Do NOT change the layout structure (keep fixed heights)
  - Do NOT add ScrollView to cardInfo
  - Do NOT change font sizes
  - Do NOT modify the FlipCard component

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single constant change, trivial edit
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 5
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/components/TarotCardFlip.tsx:31-35` - CARD_INFO_HEIGHTS constant to modify
  - `src/components/theme.ts:109-116` - SPACING values used in cardInfo calculations

  **Why Each Reference Matters**:
  - Lines 31-35 contain the exact constant to change
  - theme.ts explains that SPACING.md=12 and SPACING.sm=8, used for padding/gaps

  **Acceptance Criteria**:

  **Automated Verification (via Expo Go)**:
  ```
  # Scenario: Text no longer clips in 3-card spread
  1. Navigate to Spreads tab
  2. Start a 3-card spread (any topic)
  3. Reveal all 3 cards
  4. For each card, verify:
     - Card name is fully visible
     - Orientation badge (UPRIGHT/REVERSED) is visible
     - All 3 keywords are visible
     - Talisman line (in quotes) is fully visible, not cut off
  5. Screenshot each card as evidence
  
  # Scenario: Large card in DailyResult still looks correct
  1. Navigate to Daily tab
  2. Draw and reveal a card
  3. Verify the large card:
     - Talisman line fully visible
     - No excessive white space at bottom
  ```

  **Evidence to Capture:**
  - [ ] Screenshot: 3-card spread with all text visible (medium size)
  - [ ] Screenshot: Daily result with large card showing full talisman

  **Commit**: YES
  - Message: `fix(ui): increase card info height to prevent text clipping`
  - Files: `src/components/TarotCardFlip.tsx`
  - Pre-commit: Visual verification on simulator

---

- [ ] 5. Integration Testing and Final Verification

  **What to do**:
  - Run complete flow tests on iOS Simulator via Expo Go:
    1. Fresh app state test (clear AsyncStorage first)
    2. Draw card -> back without flip -> verify card not saved
    3. Draw card -> flip -> verify card saved
    4. App crash recovery test
    5. 3-card spread text visibility test
    6. Existing draw viewing (next day simulation)
  - Verify no regressions in:
    - SpreadResultScreen (should still work with createDraw/existing flow)
    - History/Journey tab (should show confirmed draws correctly)
    - Memo saving functionality

  **Must NOT do**:
  - Do NOT modify any code in this task
  - Do NOT add new features

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification task, no code changes
  - **Skills**: [`playwright`] or manual testing
    - playwright: If browser automation available for Expo web
    - Otherwise: Manual testing via Expo Go

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (final)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 2, 3, 4

  **References**:

  **Pattern References**:
  - All files modified in Tasks 1-4

  **Acceptance Criteria**:

  **Automated Verification (via Expo Go)**:
  ```
  # Complete Flow Test Checklist
  
  ## Issue 1: Save-on-Reveal
  [ ] 1.1 Draw card, back without flip -> "Draw Card" button visible again
  [ ] 1.2 Draw card, flip, back -> "View Today's Card" visible
  [ ] 1.3 Draw card, flip, view memo section -> memo saves correctly
  [ ] 1.4 Draw card, force close, reopen -> same card shown (Destiny)
  [ ] 1.5 Draw card at 11:59 PM, flip at 12:01 AM -> saves to original date
  
  ## Issue 2: Text Clipping
  [ ] 2.1 3-card spread, medium cards -> all text visible
  [ ] 2.2 Daily result, large card -> talisman line not clipped
  [ ] 2.3 Cards with longest talisman lines -> still fit
  
  ## Regression Checks
  [ ] 3.1 SpreadScreen draw flow -> works unchanged
  [ ] 3.2 History tab -> shows only confirmed draws
  [ ] 3.3 Calendar view -> marks only confirmed draw dates
  ```

  **Evidence to Capture:**
  - [ ] Full test checklist with pass/fail status
  - [ ] Screenshots for any failed tests
  - [ ] Final "all tests passing" confirmation

  **Commit**: NO (verification only, no code changes)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `fix(store): add prepareDraw/confirmDraw pattern for deferred persistence` | src/stores/drawStore.ts | Console log verification |
| 3 (includes 2) | `fix(daily): only persist card after user reveals it` | src/screens/DailyScreen.tsx, src/screens/DailyResultScreen.tsx | Manual flow test |
| 4 | `fix(ui): increase card info height to prevent text clipping` | src/components/TarotCardFlip.tsx | Visual verification |
| 5 | No commit (verification only) | - | Full checklist |

---

## Success Criteria

### Verification Commands
```bash
# Start Expo development server
cd /Users/geunee/Desktop/taro/taro-app
npx expo start --ios

# Clear AsyncStorage for fresh testing (run in Expo Go console)
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.clear();
```

### Final Checklist
- [ ] User can draw card, go back without flip, and card is NOT saved
- [ ] User can draw card, flip to reveal, and card IS saved
- [ ] App crash between draw and flip preserves the same card (Destiny)
- [ ] 3-card spread shows full text without clipping
- [ ] No regressions in spread flow, history, or memo functionality
- [ ] All "Must NOT Have" guardrails respected
