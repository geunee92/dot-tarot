# Draft: Tarot App UI/UX Restructure

## Requirements (confirmed)
- **Problem**: HomeScreen has too much information (Daily Card + 3-Card Spread + Calendar)
- **Solution**: Introduce bottom tab navigation to separate concerns
- **Target Structure**: 4-tab navigation (Daily, Spreads, Journey, Settings)

## Technical Context (discovered)

### Current Architecture
- **Navigation**: React Navigation v7, native-stack only
- **Stack**: Expo 54, React 19.1.0, React Native 0.81.5
- **Current package.json**: Has `@react-navigation/native-stack` but NOT `@react-navigation/bottom-tabs`

### Current Screens
| Screen | Purpose |
|--------|---------|
| HomeScreen | Contains ALL: Daily Card, 3-Card Spread, Calendar |
| DailyResultScreen | Shows drawn card with memo |
| SpreadResultScreen | Shows 3-card reading results |
| DeckScreen | Card back collection/selection |
| HistoryDetailScreen | Past reading details (modal) |
| SettingsScreen | Language settings |

### HomeScreen Sections to Split
1. **Header** (title + deck + settings buttons) → goes to each tab or root
2. **Daily Card Section** (lines 207-235) → NEW DailyScreen tab
3. **3-Card Spread Section** (lines 237-280) → NEW SpreadsScreen tab
4. **Calendar Section** (lines 282-295) → NEW JourneyScreen tab

### Reusable Components Identified
- `CalendarGrid` - standalone component for calendar
- `PixelCard`, `PixelButton`, `PixelText` - design system
- `LoadingSpinner`, `AdBadge` - utility components
- `GradientBackground` - visual component

### Theme/Colors
- Background: `#0c0a1d` (cosmic dark)
- Surface: `#1a1633` (deep plum surface)
- Accent: `#FFD700` (mystical gold)
- Aurora: `#00d4ff` (cyan accent)

## Research Findings

### From User-Provided Context
1. Successful tarot apps use 4-5 tab bottom navigation
2. Daily habit (quick) vs intentional exploration (deeper) should be SEPARATED
3. "Today" tab for daily ritual, separate tabs for different intents

### Proposed Tab Structure
```
Tab 1: Daily    → Today's card only (hero element, simplified)
Tab 2: Spreads  → All spread readings by topic (Love/Money/Work)
Tab 3: Journey  → Calendar + History + Collection (Deck)
Tab 4: Settings → App settings
```

## Technical Decisions
- **Package needed**: `@react-navigation/bottom-tabs`
- **Architecture**: Root Stack → Bottom Tabs → Per-tab Stacks
- **Modal screens**: DailyResult, SpreadResult should use modal presentation from root stack
- **Tab bar**: Custom styling to match pixel art theme

## Decisions Made (with defaults)
- [x] **Deck Location**: Inside Journey tab (Calendar + History + Collection unified)
- [x] **Tab Icons**: Emoji (✨ 🔮 📅 ⚙️) - matches existing pixel art theme
- [x] **i18n keys**: Will add `tabs.daily`, `tabs.spreads`, `tabs.journey`, `tabs.settings`
- [x] **Ritual immersion**: Modal presentation for DailyResult/SpreadResult (hide tabs)
- [x] **Animations**: Fade/scale for tabs, slide_from_bottom for modals
- [x] **Testing**: Manual QA with Playwright browser automation (no test infra exists)

## Scope Boundaries
- INCLUDE: Navigation restructure, new tab screens, move existing sections
- INCLUDE: Install @react-navigation/bottom-tabs
- INCLUDE: New type definitions for nested navigation
- EXCLUDE: New features (no new functionality)
- EXCLUDE: Changing existing DailyResult, SpreadResult screens
- EXCLUDE: Modifying stores or business logic
