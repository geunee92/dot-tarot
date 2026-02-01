# Draft: Daily Card Save Timing + Text Clipping Fixes

## Requirements (confirmed)

### Issue 1: Daily Card Saved Before Reveal
- **Problem**: Card is persisted to AsyncStorage when user navigates to DailyResultScreen, BEFORE they reveal (flip) the card
- **User expectation**: Card should only be saved after user reveals it
- **Impact**: If user presses back without revealing, the card is already "used" for the day

### Issue 2: Text Clipping in TarotCardFlip
- **Problem**: In 3-card spread (SpreadResultScreen), card info text (talisman line, keywords) is clipped
- **Root cause**: Fixed `CARD_INFO_HEIGHTS` (small:80, medium:100, large:120) combined with `overflow: 'hidden'`
- **Content height**: ~112px needed for medium size, but only 100px allocated

## Technical Decisions

### Issue 1 Approach: Option B - `prepareDraw` + `confirmDraw` pattern
- **Rationale**: Clean separation of concerns, minimal changes to existing code
- Add `prepareDraw(dateKey)` - generates card data without persisting
- Add `confirmDraw(dateKey)` - persists the prepared draw
- Add `pendingDraw` state to hold uncommitted draw
- Add `clearPendingDraw()` for cleanup

**Flow change**:
```
OLD: DailyScreen → createDraw() [SAVES] → navigate → reveal → (already saved)
NEW: DailyScreen → prepareDraw() [NO SAVE] → navigate → reveal → confirmDraw() [SAVES]
```

### Issue 2 Approach: Increase CARD_INFO_HEIGHTS
- **Rationale**: Simplest fix, maintains predictable card dimensions for FlipCard animation
- Increase values: small: 95, medium: 130, large: 150
- These values provide buffer for content + padding + gaps

## Research Findings

### drawStore.ts Analysis
- `createDraw()` at line 104-140 handles everything: check cache, check storage, generate, persist
- Uses `setItem(storageKey, newDraw)` at line 132 for immediate persistence
- No existing draft/pending functionality

### TarotCardFlip.tsx Analysis
- `CARD_INFO_HEIGHTS` at lines 31-35 are hardcoded
- `cardFront` style at line 167-172 has `overflow: 'hidden'`
- cardInfo contains: cardName, orientationBadge, keywordsContainer (3 items), talismanLine
- Spacing: padding (SPACING.md=12), gaps (SPACING.sm=8)

### Navigation Types
- DailyResult params: `{ dateKey: string; isNewDraw?: boolean; }`
- Can extend to pass generated card data via params (alternative approach)

## Scope Boundaries

### INCLUDE
- drawStore.ts: Add prepareDraw, confirmDraw, pendingDraw, clearPendingDraw
- DailyScreen.tsx: Change to use prepareDraw instead of createDraw
- DailyResultScreen.tsx: Call confirmDraw on flip complete, handle back navigation cleanup
- TarotCardFlip.tsx: Increase CARD_INFO_HEIGHTS values
- Navigation types: May need to extend if passing card data via params

### EXCLUDE
- SpreadResultScreen.tsx: Different flow, not affected by Issue 1
- spreadStore.ts: Different store, separate concern
- Other screens/components

## Open Questions
- None - requirements are clear

## Test Strategy Decision
- **Infrastructure exists**: Need to verify (check for jest/vitest config)
- **Manual verification**: Use Expo Go app to test the flow
