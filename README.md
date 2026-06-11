# 👾 Tap Protocol

A browser-based monster-tapping idle game built as a Next.js remake of **Tap Protocol**. Tap emojis to deal damage, earn gold, clear stages, and buy tap upgrades. Every 5th stage is a boss fight.

🎮 **[Play it live](https://abdirashidexe.github.io/TapProtocolRemake)**

## ✨ Features

- 👆 Click monsters to deal damage and earn gold
- 📈 Stages scale in difficulty — HP grows each level
- 🐉 Boss stages every 5 levels (stage 5, 10, 15…)
- 🛒 Shop upgrades that increase tap damage
- 🎨 Desktop-friendly UI with tap effects and animations
- 🧪 Fully tested game logic and end-to-end flows

## 🛠️ Tech Stack

- **Next.js** (App Router) + **React**
- **CSS Modules** for styling
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
# Unit tests — game logic pure functions
npm test

# End-to-end tests — full UI flows in the browser
npm run test:e2e
```

## 🌐 Deployment

The site is configured for GitHub Pages with a production `basePath` of `/TapProtocolRemake`.

```bash
npm run deploy
```

Then in your repo: **Settings → Pages → Deploy from branch `gh-pages`**.

## 📁 Project Structure

```
src/
  app/           # Next.js pages and UI
  components/    # MonsterCanvas, VfxLayer
  lib/
    gameLogic.js       # Pure game functions
    gameLogic.test.js  # Unit tests
e2e/             # Playwright specs
```

## 🎮 How to Play

1. Tap the monster to reduce its HP and earn **+1 gold** per tap
2. When HP hits 0, the next stage begins with a tougher monster
3. Save **15 gold** to buy your first tap upgrade
4. Survive boss stages and push as far as you can!

---

Made for a course project — feedback and issues welcome! 🙌
