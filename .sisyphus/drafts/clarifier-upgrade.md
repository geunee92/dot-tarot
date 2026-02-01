# Draft: Clarifier Card Feature Upgrade

## Requirements (confirmed)
- **Pre-unlock messaging**: Replace vague "역방향 에너지가 있어요" with pattern-specific, value-focused messages
- **Post-unlock insight**: Add interpretation text connecting Clarifier to original reading
- **Duplicate prevention**: Clarifier must not be the same card as any in the spread

## Technical Context Gathered

### Current Implementation
- **SpreadResultScreen.tsx (lines 171-203)**: Clarifier UI with `suggestClarifier` conditional rendering
- **spreadStore.ts**: `addClarifier` calls `drawRandomCard()` without duplicate check
- **shouldSuggestClarifier**: Returns true if P3 reversed OR total reversed >= 2
- **i18n keys**: `clarifierHint`, `clarifierOptional`, `clarifier`, `unlockClarifier`, `watchAdFor`

### Card Data Structure
```typescript
TarotCard {
  id: number;
  key: string;
  keywordsUpright: string[];
  keywordsReversed: string[];
  meaningUpright: string;
  meaningReversed: string;
}
```

### Pattern Detection
- `calculatePattern()` in spreadStore.ts creates UUU, UUR, etc. strings
- All 8 patterns have interpretations in i18n

### spread-rules.md Clarifier Rules
- **Clarifier Upright**: Convert advice into "concrete 1-step action"
- **Clarifier Reversed**: Convert advice into "caution + alternative action"

## User's Desired Behavior

### 1. Pre-unlock Messages (Pattern-specific)
| Pattern | Message Type | Example |
|---------|--------------|---------|
| UUU | All upright, optional | "리딩이 순조로워요. 클래리파이어로 구체적인 첫 행동을 알아보세요." |
| Patterns with R | Reversed energy, recommended | "조언 방향이 복잡해요. 클래리파이어로 명확한 행동 지침을 받아보세요." |

### 2. Post-unlock Clarifier Insight
| Clarifier Orientation | Message | Description |
|----------------------|---------|-------------|
| Upright | "✨ 조언이 더 명확해졌어요" | "[강조: 카드 키워드]를 오늘의 첫 행동으로 삼아보세요" |
| Reversed | "⚠️ 조언에 주의점이 있어요" | "[주의: 키워드 반대]를 피하고, 다른 접근을 시도해 보세요" |

### 3. Duplicate Prevention
- Modify `addClarifier` to exclude cards already in spread (by card.id)
- Update `drawRandomCard` or create new function with exclusion list

## Open Questions
1. Should pre-unlock messages be MORE granular (per-pattern) or just UUU vs others?
2. How should we display the Clarifier insight UI - separate box, inline text, or styled section?
3. For the Clarifier insight, should we show specific card keywords dynamically?

## Scope Boundaries
- INCLUDE: i18n updates, SpreadResultScreen.tsx UI, spreadStore.ts logic
- EXCLUDE: Other screens, card drawing algorithms beyond exclusion, database changes

## Test Strategy Decision
- **Infrastructure exists**: Need to verify
- **User wants tests**: TBD
- **QA approach**: TBD
