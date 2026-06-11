# 👾 Tap Protocol

A browser-based monster-tapping idle game built as a Next.js remake of **Tap Protocol**. Tap emoji monsters, earn gold, clear stages, and power up through the shop. Every 5th stage is a boss fight.

🎮 **[Play it live](https://abdirashidexe.github.io/TapProtocolRemake)**

## ✨ Features

- 👆 Tap monsters to deal damage and earn gold
- 📈 Stages scale in difficulty with a softer HP curve for mid-game pacing
- 🐉 Boss stages every 5 levels (stage 5, 10, 15…)
- 🛒 Three shop upgrades: tap damage, gold multiplier, and crit chance
- ⚡ Scaling tap upgrades, stage gold bonuses, and clear rewards keep progression fast
- 🔒 Locked shop buttons with clear affordance when you can't buy yet
- 🎨 Desktop-friendly UI with VFX, animations, and Font Awesome 6 icons
- 🧪 Behavioral unit tests and end-to-end UI flows

## 🛠️ Tech Stack

- **Next.js** (App Router) + **React**
- **CSS Modules** for styling
- **Font Awesome 6** (free solid icons)
- Pure game logic in `src/lib/gameLogic.js` (unit tested with **Vitest**)
- **Playwright** for end-to-end tests
- **GitHub Pages** for hosting

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm

### Install & run locally

```bash
git clone https://github.com/abdirashidexe/TapProtocolRemake.git
cd TapProtocolRemake
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a static production build in `out/` |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |
| `npm run deploy` | Build and publish to GitHub Pages |

## 🧪 Testing

```bash
# Unit tests — game logic behavior (not mirrored implementation details)
npm test

# End-to-end tests — full UI flows in the browser
npm run test:e2e
```

Unit tests assert literal outcomes (HP values, gold totals, stage transitions). E2E tests cover loading, tapping, stage progression, boss stages, shop lock/unlock, and upgrade impact.

## 🌐 Deployment

The site is configured for GitHub Pages with a production `basePath` of `/TapProtocolRemake`.

**Important:** GitHub Pages runs Jekyll by default, which **ignores the `_next/` folder** where Next.js puts CSS and JS. The deploy script passes `--nojekyll` to disable Jekyll, and the build writes a `.nojekyll` marker into `out/`.

```bash
npm run deploy
```

Then in your repo: **Settings → Pages → Deploy from branch `gh-pages`**.

After deploying, verify assets load at:
`https://abdirashidexe.github.io/TapProtocolRemake/_next/static/css/` (should not 404).

## 📁 Project Structure

```
public/          # Static files copied to out/ (includes .nojekyll)
scripts/         # Build helpers
src/
  app/           # Next.js pages and UI
  components/    # MonsterCanvas, VfxLayer, BackgroundParticles
  lib/
    gameLogic.js       # Pure game functions
    gameLogic.test.js  # Unit tests
e2e/             # Playwright specs
```

## 🎮 How to Play

1. **Tap the monster** to deal damage and earn gold.
2. **Spend gold on upgrades** — tap damage, gold multiplier (+15%), or crit chance (+5%).
3. **Clear stages** and beat bosses every 5 stages. Kills award bonus gold, and higher stages pay more per tap.

---

Made for a course project — feedback and issues welcome! 🙌
