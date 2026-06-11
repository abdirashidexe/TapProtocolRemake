"use client";

import { useState } from "react";
import {
  createInitialState,
  applyTap,
  applyBuyTap,
  stageName,
  monsterEmoji,
  isBossStage,
} from "@/lib/gameLogic";
import MonsterCanvas from "@/components/MonsterCanvas";
import styles from "./page.module.css";

export default function Home() {
  const [state, setState] = useState(createInitialState);

  const emoji = monsterEmoji(state.stage);
  const isBoss = isBossStage(state.stage);
  const canBuy = state.gold >= state.costTap;
  const hpPercent = Math.max(0, (state.hp / state.maxHp) * 100);

  return (
    <main className={styles.main}>
      <header className={styles.topBar}>
        <h1 className={styles.title}>Tap Protocol</h1>

        <div className={styles.currencies}>
          <div className={styles.currency}>
            <span className={styles.coinIcon} aria-hidden="true" />
            <span className={styles.gold}>Gold: {state.gold}</span>
          </div>
          <div className={styles.currency}>
            <span className={styles.swordIcon} aria-hidden="true" />
            <span className={styles.tap}>Tap damage: {state.tap}</span>
          </div>
        </div>
      </header>

      <div className={styles.stagePill}>Stage {state.stage}</div>

      <div className={styles.gameBoard}>
        <section className={styles.arenaCard}>
          {isBoss && <div className={styles.bossRibbon}>BOSS STAGE!</div>}

          <p className={styles.monsterName}>{stageName(state.stage)}</p>

          <button
            type="button"
            className={styles.monsterButton}
            onClick={() => setState((s) => applyTap(s))}
            aria-label={isBoss ? "Tap boss monster" : "Tap monster"}
          >
            <span className={styles.monsterGlow} aria-hidden="true" />
            <MonsterCanvas
              emoji={emoji}
              isBoss={isBoss}
              className={styles.monsterCanvas}
            />
          </button>

          <div className={styles.hpBlock}>
            <p className={styles.hp}>HP: {state.hp} / {state.maxHp}</p>
            <div className={styles.hpBarTrack}>
              <div
                className={styles.hpBarFill}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        </section>

        <aside className={styles.shopCard}>
          <div className={styles.shopHeader}>Shop</div>
          <p className={styles.shopDesc}>
            Spend gold to hit harder and clear stages faster.
          </p>
          <button
            type="button"
            className={styles.buyButton}
            onClick={() => setState((s) => applyBuyTap(s))}
            disabled={!canBuy}
          >
            Upgrade Tap (+1 dmg) — {state.costTap}g
          </button>
        </aside>
      </div>
    </main>
  );
}
