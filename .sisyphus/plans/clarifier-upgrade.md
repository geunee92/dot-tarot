# Clarifier Card Feature Upgrade

## TL;DR

> **Quick Summary**: Upgrade the Clarifier card feature to provide pattern-specific pre-unlock messaging, post-unlock interpretations that connect to the original reading, and prevent duplicate card selection.
> 
> **Deliverables**:
> - Updated i18n translations (ko.json, en.json) with pattern-aware messages and interpretation templates
> - Enhanced SpreadResultScreen.tsx with dynamic pre-unlock messaging and Clarifier insight section
> - Modified spreadStore.ts with duplicate prevention logic
> - New utility function in cards.ts for card drawing with exclusions
> 
> **Estimated Effort**: Medium (4-6 tasks, ~2-3 hours)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (i18n) → Task 3 (UI) → Task 4 (Integration verification)

---

## Context

### Original Request
Upgrade the Clarifier card feature to provide better value and clearer messaging:
1. Pre-unlock messaging is vague - doesn't explain what reversed energy means
2. Post-unlock has no insight - just shows card with basic meaning
3. Duplicate cards possible - Clarifier can be same as spread cards

### Interview Summary
**Key Discussions**:
- Pre-unlock: Two-category approach (UUU = optional enhancement, others = recommended)
- Post-unlock: Dynamic keyword-based insight (upright = action focus, reversed = caution focus)
- Duplicate: Filter out spread card IDs when drawing Clarifier

**Research Findings**:
- `shouldSuggestClarifier` returns true if P3 reversed OR total reversed >= 2 (lines 264-274 of spreadStore.ts)
- Card data has `keywordsUpright[]` and `keywordsReversed[]` arrays
- PixelCard already uses COLORS.upright (#4ade80) and COLORS.reversed (#f97316)
- spread-rules.md defines: Upright = "concrete 1-step action", Reversed = "caution + alternative"

### Gap Analysis (Self-Review)
**Identified Gaps** (addressed in plan):
- Edge case: Empty keywords array → Default to generic message
- i18n interpolation → Use `{{keyword}}` syntax consistent with existing patterns
- Visual distinction → Use existing COLORS.upright/reversed for insight box styling
- English translations → Provide parallel EN messages

---

## Work Objectives

### Core Objective
Enhance Clarifier card UX by providing context-aware messaging before and after unlock, while preventing duplicate card selection.

### Concrete Deliverables
- `src/i18n/translations/ko.json`: New clarifier keys with Korean text
- `src/i18n/translations/en.json`: Parallel English text
- `src/screens/SpreadResultScreen.tsx`: Pattern-aware messaging + insight section
- `src/stores/spreadStore.ts`: Duplicate prevention in addClarifier
- `src/utils/cards.ts`: New `drawRandomCardExcluding` function

### Definition of Done
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] Pre-unlock shows pattern-specific message (UUU vs others)
- [ ] Post-unlock shows orientation-specific insight with dynamic keyword
- [ ] Clarifier card is never the same as any spread card

### Must Have
- Korean and English translations
- Visual distinction for upright vs reversed Clarifier insight
- TypeScript type safety maintained

### Must NOT Have (Guardrails)
- DO NOT change card drawing logic for the main 3-card spread
- DO NOT modify PixelCard component
- DO NOT add new dependencies
- DO NOT change existing i18n key names (only add new ones)
- DO NOT touch pattern interpretation texts (already exist)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (no test files found)
- **User wants tests**: Manual verification
- **Framework**: N/A
- **QA approach**: TypeScript check + manual Expo verification

### Automated Verification (All Tasks)

**For ALL tasks:**
```bash
# Agent runs TypeScript check
cd /Users/geunee/Desktop/taro/taro-app && npx tsc --noEmit
# Assert: Exit code 0, no type errors
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Add i18n translation keys (ko.json + en.json)
└── Task 2: Add drawRandomCardExcluding utility function

Wave 2 (After Wave 1):
├── Task 3: Update spreadStore.ts with duplicate prevention
└── Task 4: Update SpreadResultScreen.tsx with new UI

Wave 3 (After Wave 2):
└── Task 5: Integration verification and type check

Critical Path: Task 1 → Task 4 (UI depends on i18n keys)
Parallel Speedup: ~30% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 4 | 2 |
| 2 | None | 3 | 1 |
| 3 | 2 | 4 | None |
| 4 | 1, 3 | 5 | None |
| 5 | 4 | None | None (final) |

---

## TODOs

- [ ] 1. Add i18n Translation Keys for Clarifier Upgrade

  **What to do**:
  - Add new keys under `spreadResult` in ko.json:
    - `clarifierHintUUU`: "리딩이 순조로워요. 클래리파이어로 구체적인 첫 행동을 알아보세요."
    - `clarifierHintReversed`: "조언 방향이 복잡해요. 클래리파이어로 명확한 행동 지침을 받아보세요."
    - `clarifierInsightUprightTitle`: "✨ 조언이 더 명확해졌어요"
    - `clarifierInsightUprightBody`: "{{keyword}}을/를 오늘의 첫 행동으로 삼아보세요."
    - `clarifierInsightReversedTitle`: "⚠️ 조언에 주의점이 있어요"
    - `clarifierInsightReversedBody`: "{{keyword}}을/를 피하고, 다른 접근을 시도해 보세요."
  - Add parallel English keys in en.json:
    - `clarifierHintUUU`: "Your reading is flowing smoothly. Get a concrete first action with the Clarifier."
    - `clarifierHintReversed`: "Your advice has some complexity. Get clear action guidance with the Clarifier."
    - `clarifierInsightUprightTitle`: "✨ Your advice is now clearer"
    - `clarifierInsightUprightBody`: "Make {{keyword}} your first action today."
    - `clarifierInsightReversedTitle`: "⚠️ There's a caution in your advice"
    - `clarifierInsightReversedBody`: "Avoid {{keyword}} and try a different approach."

  **Must NOT do**:
  - DO NOT modify existing keys (clarifierHint, clarifierOptional remain for backwards compatibility)
  - DO NOT add keys outside spreadResult section

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple JSON file edits, no complex logic
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not committing in this task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/i18n/translations/ko.json:116-125` - Existing clarifier keys structure
  - `src/i18n/translations/en.json:116-125` - Parallel English structure

  **WHY Each Reference Matters**:
  - Shows existing key naming convention (camelCase under spreadResult)
  - Shows interpolation syntax if any exists (use `{{variable}}` format)

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  cd /Users/geunee/Desktop/taro/taro-app && cat src/i18n/translations/ko.json | grep -c "clarifierHintUUU\|clarifierInsightUpright"
  # Assert: Output is at least 2 (keys exist)
  
  cd /Users/geunee/Desktop/taro/taro-app && npx tsc --noEmit
  # Assert: Exit code 0
  ```

  **Evidence to Capture:**
  - [ ] Terminal output showing grep matches
  - [ ] TypeScript check passes

  **Commit**: YES
  - Message: `feat(i18n): add pattern-aware clarifier messages and insight templates`
  - Files: `src/i18n/translations/ko.json`, `src/i18n/translations/en.json`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 2. Add drawRandomCardExcluding Utility Function

  **What to do**:
  - Add new function `drawRandomCardExcluding` in `src/utils/cards.ts`:
    ```typescript
    /**
     * Draw a random card excluding specific card IDs
     * Used for Clarifier to avoid duplicating spread cards
     */
    export function drawRandomCardExcluding(excludeIds: number[]): DrawnCard {
      const availableCards = TAROT_CARDS.filter(card => !excludeIds.includes(card.id));
      if (availableCards.length === 0) {
        // Fallback: if somehow all cards excluded, use any card
        return drawRandomCard();
      }
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      return {
        card: availableCards[randomIndex],
        orientation: getRandomOrientation(),
      };
    }
    ```
  - Export the function in the file

  **Must NOT do**:
  - DO NOT modify existing `drawRandomCard` function
  - DO NOT modify `drawRandomCards` function
  - DO NOT change TAROT_CARDS data

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single function addition, straightforward logic
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `refactor`: Not refactoring, adding new function

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/utils/cards.ts:127-132` - Existing `drawRandomCard()` pattern to follow
  - `src/utils/cards.ts:92-110` - `getRandomCards()` shows Fisher-Yates shuffle for reference
  - `src/utils/cards.ts:116-118` - `getRandomOrientation()` to reuse

  **API/Type References**:
  - `src/types/card.ts:16-19` - `DrawnCard` interface to return
  - `src/data/index.ts:14` - `TAROT_CARDS` array to filter

  **WHY Each Reference Matters**:
  - `drawRandomCard` shows exact return type and structure to follow
  - `TAROT_CARDS` is the source array to filter from

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  cd /Users/geunee/Desktop/taro/taro-app && grep -n "drawRandomCardExcluding" src/utils/cards.ts
  # Assert: Function exists with export
  
  cd /Users/geunee/Desktop/taro/taro-app && npx tsc --noEmit
  # Assert: Exit code 0
  ```

  **Evidence to Capture:**
  - [ ] Terminal output showing function definition line
  - [ ] TypeScript check passes

  **Commit**: YES
  - Message: `feat(cards): add drawRandomCardExcluding utility for duplicate prevention`
  - Files: `src/utils/cards.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 3. Update spreadStore.ts with Duplicate Prevention

  **What to do**:
  - Import `drawRandomCardExcluding` from `../utils/cards`
  - Modify `addClarifier` function (lines 150-189) to:
    1. Extract card IDs from existing spread: `const existingCardIds = spread.cards.map(c => c.drawnCard.card.id)`
    2. Replace `drawRandomCard()` with `drawRandomCardExcluding(existingCardIds)`

  **Must NOT do**:
  - DO NOT change the function signature of `addClarifier`
  - DO NOT modify `shouldSuggestClarifier` logic
  - DO NOT touch `createSpread` function

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small modification to existing function
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 4
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `src/stores/spreadStore.ts:150-189` - Current `addClarifier` function to modify
  - `src/stores/spreadStore.ts:164` - Line where `drawRandomCard()` is called

  **API/Type References**:
  - `src/types/spread.ts:11-14` - `SpreadCard` interface showing `drawnCard.card.id` path
  - `src/utils/cards.ts` - New `drawRandomCardExcluding` to import

  **WHY Each Reference Matters**:
  - Line 164 is exact modification point
  - SpreadCard shows how to access card IDs from spread.cards

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  cd /Users/geunee/Desktop/taro/taro-app && grep -n "drawRandomCardExcluding" src/stores/spreadStore.ts
  # Assert: Shows import line and usage line
  
  cd /Users/geunee/Desktop/taro/taro-app && grep -n "existingCardIds\|excludeIds" src/stores/spreadStore.ts
  # Assert: Shows extraction of existing card IDs
  
  cd /Users/geunee/Desktop/taro/taro-app && npx tsc --noEmit
  # Assert: Exit code 0
  ```

  **Evidence to Capture:**
  - [ ] Terminal output showing import and usage
  - [ ] TypeScript check passes

  **Commit**: YES
  - Message: `fix(spread): prevent duplicate cards in Clarifier selection`
  - Files: `src/stores/spreadStore.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 4. Update SpreadResultScreen.tsx with Enhanced Clarifier UI

  **What to do**:
  - **Import additions**: Import `getKeywords` from `../utils/cards`
  - **Pre-unlock messaging** (modify lines 171-186):
    - Determine if pattern is 'UUU' (all upright) vs others
    - Use `t('spreadResult.clarifierHintUUU')` for UUU pattern
    - Use `t('spreadResult.clarifierHintReversed')` for patterns with any reversed cards
  - **Post-unlock insight section** (after line 203):
    - Add new View for Clarifier insight between card display and section end
    - Determine Clarifier orientation
    - Get first keyword: `getKeywords(spread.clarifier.drawnCard.card, spread.clarifier.drawnCard.orientation)[0]`
    - For upright: Show `clarifierInsightUprightTitle` and `clarifierInsightUprightBody` with keyword interpolation
    - For reversed: Show `clarifierInsightReversedTitle` and `clarifierInsightReversedBody` with keyword interpolation
    - Style insight box with `COLORS.upright` border for upright, `COLORS.reversed` for reversed
  - **Add styles**:
    - `clarifierInsightBox`: Similar to `interpretationBox` but with dynamic border color
    - `clarifierInsightTitle`: Bold text with emoji
    - `clarifierInsightBody`: Regular body text

  **Must NOT do**:
  - DO NOT modify PixelCard component usage (keep `showDetails={true}`)
  - DO NOT change existing card flip animations
  - DO NOT modify the RewardedAdButton component
  - DO NOT touch pattern interpretations section

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI changes with styling and conditional rendering
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: For proper React Native styling patterns
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not browser testing, it's React Native

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (after Tasks 1, 3)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1, Task 3

  **References**:

  **Pattern References**:
  - `src/screens/SpreadResultScreen.tsx:171-186` - Current pre-unlock section to modify
  - `src/screens/SpreadResultScreen.tsx:188-203` - Current post-unlock section pattern
  - `src/screens/SpreadResultScreen.tsx:164-169` - `interpretationBox` style pattern to follow

  **API/Type References**:
  - `src/utils/cards.ts:162-165` - `getKeywords` function signature
  - `src/types/spread.ts:16-19` - `ClarifierCard` interface with `drawnCard`
  - `src/components/theme.ts` - `COLORS.upright`, `COLORS.reversed` for styling

  **Test References**:
  - None (manual verification)

  **WHY Each Reference Matters**:
  - Lines 171-186 are the exact pre-unlock section to enhance
  - Lines 188-203 show existing Clarifier card display structure
  - interpretationBox style shows design pattern for content boxes

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  cd /Users/geunee/Desktop/taro/taro-app && grep -n "clarifierHintUUU\|clarifierInsightUpright" src/screens/SpreadResultScreen.tsx
  # Assert: Shows usage of new i18n keys
  
  cd /Users/geunee/Desktop/taro/taro-app && grep -n "getKeywords" src/screens/SpreadResultScreen.tsx
  # Assert: Shows import and usage
  
  cd /Users/geunee/Desktop/taro/taro-app && grep -n "clarifierInsightBox\|COLORS.upright\|COLORS.reversed" src/screens/SpreadResultScreen.tsx
  # Assert: Shows new styles with orientation-based colors
  
  cd /Users/geunee/Desktop/taro/taro-app && npx tsc --noEmit
  # Assert: Exit code 0
  ```

  **Evidence to Capture:**
  - [ ] Terminal output showing new i18n key usage
  - [ ] Terminal output showing getKeywords usage
  - [ ] TypeScript check passes

  **Commit**: YES
  - Message: `feat(ui): add pattern-aware pre-unlock messaging and Clarifier insight section`
  - Files: `src/screens/SpreadResultScreen.tsx`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 5. Integration Verification

  **What to do**:
  - Run full TypeScript check across project
  - Verify all imports resolve correctly
  - Confirm no circular dependencies introduced

  **Must NOT do**:
  - DO NOT make code changes in this task
  - DO NOT start the dev server (that's manual user task)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification only, no code changes
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (final)
  - **Blocks**: None
  - **Blocked By**: Task 4

  **References**:

  - All modified files from Tasks 1-4

  **WHY Each Reference Matters**:
  - Need to verify all changes work together

  **Acceptance Criteria**:

  ```bash
  # Agent runs full project type check:
  cd /Users/geunee/Desktop/taro/taro-app && npx tsc --noEmit
  # Assert: Exit code 0, no errors
  
  # Verify all modified files exist:
  cd /Users/geunee/Desktop/taro/taro-app && ls -la src/i18n/translations/ko.json src/i18n/translations/en.json src/utils/cards.ts src/stores/spreadStore.ts src/screens/SpreadResultScreen.tsx
  # Assert: All 5 files listed
  ```

  **Evidence to Capture:**
  - [ ] TypeScript check output (should show 0 errors)
  - [ ] File listing output

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(i18n): add pattern-aware clarifier messages and insight templates` | ko.json, en.json | npx tsc --noEmit |
| 2 | `feat(cards): add drawRandomCardExcluding utility for duplicate prevention` | cards.ts | npx tsc --noEmit |
| 3 | `fix(spread): prevent duplicate cards in Clarifier selection` | spreadStore.ts | npx tsc --noEmit |
| 4 | `feat(ui): add pattern-aware pre-unlock messaging and Clarifier insight section` | SpreadResultScreen.tsx | npx tsc --noEmit |
| 5 | N/A | N/A | Final verification |

---

## Success Criteria

### Verification Commands
```bash
# TypeScript check (all tasks)
cd /Users/geunee/Desktop/taro/taro-app && npx tsc --noEmit
# Expected: Exit code 0, no type errors

# Verify new i18n keys exist
grep -c "clarifierHintUUU" src/i18n/translations/ko.json
# Expected: 1

grep -c "clarifierInsightUpright" src/i18n/translations/ko.json  
# Expected: 2 (title + body)

# Verify duplicate prevention
grep -c "drawRandomCardExcluding" src/stores/spreadStore.ts
# Expected: 2 (import + usage)
```

### Final Checklist
- [ ] All "Must Have" present:
  - [ ] Korean translations added
  - [ ] English translations added
  - [ ] Pattern-aware pre-unlock messaging
  - [ ] Orientation-aware post-unlock insight
  - [ ] Duplicate prevention implemented
- [ ] All "Must NOT Have" absent:
  - [ ] Existing i18n keys unchanged
  - [ ] PixelCard component unchanged
  - [ ] No new dependencies
- [ ] All TypeScript checks pass
- [ ] 4 atomic commits created

### Manual Verification (User Post-Execution)
After running `/start-work`, manually verify in Expo:
1. Create a UUU spread → See "리딩이 순조로워요" message
2. Create a spread with reversed cards → See "조언 방향이 복잡해요" message
3. Unlock Clarifier (upright) → See "✨ 조언이 더 명확해졌어요" with keyword
4. Unlock Clarifier (reversed) → See "⚠️ 조언에 주의점이 있어요" with keyword
5. Verify Clarifier is never the same card as any in spread (may need multiple tests)
