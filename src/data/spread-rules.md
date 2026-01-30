# 3-Card + Clarifier Spread Rules (Upright/Reversed)

This file defines how to interpret upright/reversed combinations for a 3-card spread plus an optional 4th clarifier card (unlocked by rewarded ads).

## Positions (fixed across topics)
- P1: FLOW (Situation / current momentum)
- P2: INFLUENCE (Risk / hidden variable / what shapes the flow)
- P3: ADVICE (Action / how to move today)

Topics (LOVE / MONEY / WORK) only change the wording templates; the engine stays identical.

## Global Reversal Modifiers (apply in addition to each card's reversed text)
When a card is reversed, apply ONE of these modifiers to shape the final reading:
- INTERNALIZED: more about inner state than external events
- BLOCKED/DELAYED: timing friction, slower results
- SHADOW/EXCESS: the upright strength is overdone and causes a side-effect

Suggested defaults:
- LOVE: INTERNALIZED
- MONEY: BLOCKED/DELAYED
- WORK: SHADOW/EXCESS

## The 8 combination patterns (2^3)
Notation uses U=Upright, R=Reversed in order P1/P2/P3.

### UUU (0 reversed) — Clear / Direct
- Tone: straightforward, external momentum is visible
- Output: assertive action line

### UUR (Advice reversed) — Knows what to do, but execution slips
- Output: include 1 "DON'T do this" line + 1 micro-action line
- Best upsell: Clarifier card

### URU (Influence reversed) — Hidden variable / Misread risk
- Output: add 1 verification question (ask/check/confirm)

### RUU (Flow reversed) — Unstable start / Mood-driven
- Output: add 1 "reset/organize" action before main advice

### URR (Influence + Advice reversed) — Defensive day
- Output: end with "avoid 1 thing" + "do 1 minimal thing"

### RUR (Flow + Advice reversed) — Inner friction + wrong approach
- Output: advice must be a 10-minute micro-action

### RRU (Flow + Influence reversed) — Foggy but the advice works
- Output: highlight advice as the headline; keep P1/P2 cautious

### RRR (3 reversed) — Inner reset
- Output: avoid strong certainty language; use suggestion tone ("try…")

## Clarifier (4th card) rules
Clarifier is an "ADVICE amplifier" or "ADVICE correction".

### When to show the Ad CTA
Show "Unlock Clarifier (Ad)" if:
- P3 is reversed, OR
- total reversed cards >= 2, OR
- user explicitly taps "More insight"

### Clarifier interpretation
- Clarifier Upright: convert advice into a concrete 1-step action
- Clarifier Reversed: convert advice into "caution + alternative action"

### UI output
Add a short section: "EXTRA INSIGHT"
Keep it 1–2 sentences + 1 action line.

## Topic templates (minimal)
LOVE
- Flow: emotion/connection trend
- Influence: distance/communication/timing
- Advice: one sentence to say or one action to do today

MONEY
- Flow: cashflow/spending mood
- Influence: risk (impulse, fixed costs, unexpected)
- Advice: one rule for today + one small control action

WORK
- Flow: workload pace
- Influence: relationship/politics/dependency
- Advice: one clarity move (write/confirm/ship) + one communication move
