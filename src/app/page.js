"use client";

import { useState } from "react";
import {
  createInitialState,
  applyTap,
  applyBuyTap,
  stageName,
  monsterImage,
} from "@/lib/gameLogic";
import styles from "./page.module.css";

export default function Home() {
  const [state, setState] = useState(createInitialState);

  const imageSrc = monsterImage(state.stage);
  const isBoss = state.stage % 5 === 0;
  const canBuy = state.gold >= state.costTap;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Tap Protocol</h1>
        <p className={styles.stage}>Stage {state.stage}</p>
      </header>

      <section className={styles.arena}>
        <p className={styles.monsterName}>{stageName(state.stage)}</p>

        <button
          type="button"
          className={styles.monsterButton}
          onClick={() => setState((s) => applyTap(s))}
          aria-label="Tap monster"
        >
          <img
            src={imageSrc}
            alt={isBoss ? "Boss monster" : "Monster"}
            className={styles.monsterImage}
          />
        </button>

        <p className={styles.hp}>
          HP: {state.hp} / {state.maxHp}
        </p>
      </section>

      <section className={styles.stats}>
        <p className={styles.gold}>Gold: {state.gold}</p>
        <p className={styles.tap}>Tap damage: {state.tap}</p>
      </section>

      <section className={styles.shop}>
        <button
          type="button"
          className={styles.buyButton}
          onClick={() => setState((s) => applyBuyTap(s))}
          disabled={!canBuy}
        >
          Upgrade Tap (+1 dmg) — {state.costTap}g
        </button>
      </section>
    </main>
  );
}
