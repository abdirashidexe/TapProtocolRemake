# Tap Protocol

A browser-based monster-tapping idle game (Next.js remake).

**[Play live](https://abdirashidexe.github.io/TapProtocolRemake)**



## Spec 🪓

---

**Spec: Tap Protocol (Next.js Remake)**

### What it is

A browser-based monster-tapping idle game. The player clicks a monster to deal damage and earn gold. When a monster dies, the next stage begins with a harder monster. Gold is spent in a shop to increase tap damage. Every 5th stage is a boss.

### Stack

- Next.js (App Router, src/app structure)
- Plain CSS Modules for styling
- All game logic in a single `gameLogic.js` utility file (pure functions, no side effects — this is what makes it testable)
- React state (`useState`) for UI layer only
- Vitest for unit tests
- Playwright for end-to-end tests

### Game logic (pure functions in `gameLogic.js`)


| Function              | Behavior                                                 |
| --------------------- | -------------------------------------------------------- |
| `stageHp(stage)`      | `Math.floor(10 * 1.35^(stage-1))`                        |
| `stageName(stage)`    | cycles through 5 names + `" Lv. {stage}"`                |
| `monsterImage(stage)` | cycles through 4 images; boss image on `stage % 5 === 0` |
| `nextTapCost(cost)`   | `Math.ceil(cost * 1.6)`                                  |


**Initial state:**

```js
{ stage: 1, gold: 0, tap: 1, hp: stageHp(1), maxHp: stageHp(1), costTap: 15 }
```

### State transitions (also pure functions)

- `applyTap(state)` → subtract tap from hp; if hp ≤ 0, advance stage (increment stage, reset hp/maxHp, keep gold/tap/costTap)
- `applyBuyTap(state)` → if gold < costTap return unchanged; else subtract costTap, tap+1, costTap = nextTapCost

### UI (single page at `/`)

- Monster name and stage number
- Monster image (clickable button)
- HP display: `HP: X / Y`
- Gold display
- Shop button: `"Upgrade Tap (+1 dmg)"` with cost shown; disabled when gold < costTap

### Flows to implement

- Player taps monster → gold +1, hp decreases by tap damage
- When hp hits 0 → stage increments, new monster spawns with scaled HP
- Stage 5, 10, 15... → boss image shown
- Player buys tap upgrade → gold decreases, tap damage +1, cost scales up
- Buy button disabled when broke

### Test cases (you dictate these to Cursor)

#### Unit tests (Vitest) — `gameLogic.test.js`

- `stageHp(1)` returns 10
- `stageHp(2)` returns 13 (`Math.floor(10 * 1.35)`)
- `applyTap` reduces hp by tap amount
- `applyTap` when killing blow: stage increments, hp resets to new stageHp, gold still increases
- `applyBuyTap` with enough gold: tap+1, gold decreases, costTap scales
- `applyBuyTap` without enough gold: state unchanged
- `monsterImage(5)` returns boss image
- `monsterImage(1)`, `(2)`, `(3)`, `(4)`, `(6)` return the correct cycle

#### E2E tests (Playwright) — `tap-protocol.spec.js`

- Page loads, monster name visible, HP shown, gold shows 0
- Clicking monster reduces HP (check HP text changes)
- Clicking monster enough times advances stage (stage number increments)
- Stage 5 shows boss (check alt text or image src contains "boss")
- Buy button disabled at start (0 gold)
- After 15 clicks, buy button becomes enabled
- After buying, tap damage increases (kill monster faster — fewer clicks needed after upgrade)

### Edge cases to watch

- Boss stage triggers exactly on multiples of 5, not 4 or 6
- HP never displays negative
- Cost scaling: after one purchase at 15g, next cost is 24g (`Math.ceil(15 * 1.6)`)
- Buy button re-disables after purchase if gold drops below new cost



---



## Quick start

```bash
git clone https://github.com/abdirashidexe/TapProtocolRemake.git
cd TapProtocolRemake
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).



---



## Scripts


| Command            | Description                       |
| ------------------ | --------------------------------- |
| `npm run dev`      | Dev server                        |
| `npm test`         | Unit tests (Vitest)               |
| `npm run test:e2e` | E2E tests (Playwright)            |
| `npm run deploy`   | Build and publish to GitHub Pages |


