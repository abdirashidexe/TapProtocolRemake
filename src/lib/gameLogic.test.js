import { describe, it, expect } from "vitest";
import {
  stageHp,
  stageName,
  monsterEmoji,
  isBossStage,
  nextTapCost,
  goldPerTap,
  isCriticalHit,
  createInitialState,
  applyTap,
  applyBuyTap,
  applyBuyGoldMult,
  applyBuyCrit,
} from "./gameLogic";

describe("stageHp", () => {
  it("grows stage HP with the rebalanced 1.28 curve", () => {
    expect(stageHp(1)).toBe(10);
    expect(stageHp(2)).toBe(12);
    expect(stageHp(10)).toBe(92);
  });
});

describe("stageName", () => {
  it("cycles through names with stage level", () => {
    expect(stageName(1)).toBe("Goblin Lv. 1");
    expect(stageName(2)).toBe("Slime Lv. 2");
    expect(stageName(6)).toBe("Goblin Lv. 6");
  });
});

describe("isBossStage", () => {
  it("is true only on multiples of 5", () => {
    expect(isBossStage(5)).toBe(true);
    expect(isBossStage(10)).toBe(true);
    expect(isBossStage(4)).toBe(false);
    expect(isBossStage(6)).toBe(false);
  });
});

describe("monsterEmoji", () => {
  it("returns boss emoji on every 5th stage", () => {
    expect(monsterEmoji(5)).toBe("🐉");
    expect(monsterEmoji(10)).toBe("🐉");
  });

  it("cycles through regular emojis for non-boss stages", () => {
    expect(monsterEmoji(1)).toBe("👺");
    expect(monsterEmoji(2)).toBe("🟢");
    expect(monsterEmoji(3)).toBe("💀");
    expect(monsterEmoji(4)).toBe("👹");
    expect(monsterEmoji(6)).toBe("🟢");
  });
});

describe("nextTapCost", () => {
  it("scales cost by 1.48 rounded up", () => {
    expect(nextTapCost(15)).toBe(23);
    expect(nextTapCost(25)).toBe(37);
  });
});

describe("goldPerTap", () => {
  it("combines multiplier level and stage progression", () => {
    expect(goldPerTap(0, 1)).toBe(1);
    expect(goldPerTap(5, 1)).toBe(2);
    expect(goldPerTap(5, 7)).toBe(3);
  });
});

describe("isCriticalHit", () => {
  it("never crits at 0% chance", () => {
    expect(isCriticalHit(99, 0)).toBe(false);
  });

  it("crits on deterministic tap rolls under the chance threshold", () => {
    expect(isCriticalHit(10, 1)).toBe(true);
    expect(isCriticalHit(11, 1)).toBe(false);
  });
});

describe("applyTap", () => {
  it("reduces hp by tap amount and increases gold on a non-lethal tap", () => {
    const state = createInitialState();
    const next = applyTap(state);

    expect(next.hp).toBe(9);
    expect(next.gold).toBe(1);
    expect(next.stage).toBe(1);
    expect(next.lastDamage).toBe(1);
    expect(next.lastCrit).toBe(false);
    expect(next.lastGold).toBe(1);
  });

  it("deals double damage on a crit", () => {
    const state = { ...createInitialState(), critLevel: 1, totalTaps: 9, tap: 3 };
    const next = applyTap(state);

    expect(next.lastCrit).toBe(true);
    expect(next.lastDamage).toBe(6);
    expect(next.hp).toBe(4);
  });

  it("clears stage on kill, resets HP, and bundles clear bonus into lastGold", () => {
    const state = { ...createInitialState(), hp: 1, gold: 5 };
    const next = applyTap(state);

    expect(next.stage).toBe(2);
    expect(next.hp).toBe(12);
    expect(next.maxHp).toBe(12);
    expect(next.gold).toBe(8);
    expect(next.lastGold).toBe(3);
  });

  it("clears stage even when damage exceeds remaining HP", () => {
    const state = { ...createInitialState(), hp: 1, tap: 5 };
    const next = applyTap(state);

    expect(next.stage).toBe(2);
    expect(next.lastDamage).toBe(5);
    expect(next.hp).toBe(12);
  });

  it("preserves upgrades across stage transitions", () => {
    const state = {
      ...createInitialState(),
      hp: 1,
      tap: 3,
      costTap: 23,
      goldMultLevel: 2,
      critLevel: 1,
      gold: 99,
    };
    const next = applyTap(state);

    expect(next.stage).toBe(2);
    expect(next.tap).toBe(3);
    expect(next.goldMultLevel).toBe(2);
    expect(next.critLevel).toBe(1);
    expect(next.costTap).toBe(23);
    expect(next.gold).toBe(102);
  });
});

describe("applyBuyTap", () => {
  it("increases tap, decreases gold, and scales cost when affordable", () => {
    const state = { ...createInitialState(), gold: 15 };
    const next = applyBuyTap(state);

    expect(next.tap).toBe(2);
    expect(next.gold).toBe(0);
    expect(next.costTap).toBe(23);
    expect(next.hp).toBe(10);
    expect(next.stage).toBe(1);
  });

  it("adds more damage at higher tap levels", () => {
    const state = { ...createInitialState(), gold: 100, tap: 5, costTap: 15 };
    const next = applyBuyTap(state);

    expect(next.tap).toBe(7);
  });

  it("returns the same state when gold is insufficient", () => {
    const state = createInitialState();
    expect(applyBuyTap(state)).toEqual(state);
  });
});

describe("applyBuyGoldMult", () => {
  it("increases gold multiplier level when affordable", () => {
    const state = { ...createInitialState(), gold: 25 };
    const next = applyBuyGoldMult(state);

    expect(next.goldMultLevel).toBe(1);
    expect(next.gold).toBe(0);
    expect(next.costGoldMult).toBe(37);
  });

  it("returns the same state when gold is insufficient", () => {
    const state = createInitialState();
    expect(applyBuyGoldMult(state)).toEqual(state);
  });
});

describe("applyBuyCrit", () => {
  it("increases crit level when affordable", () => {
    const state = { ...createInitialState(), gold: 30 };
    const next = applyBuyCrit(state);

    expect(next.critLevel).toBe(1);
    expect(next.gold).toBe(0);
    expect(next.costCrit).toBe(45);
  });

  it("returns the same state when gold is insufficient", () => {
    const state = createInitialState();
    expect(applyBuyCrit(state)).toEqual(state);
  });
});

describe("createInitialState", () => {
  it("starts at stage 1 with full HP and no upgrades", () => {
    expect(createInitialState()).toEqual({
      stage: 1,
      gold: 0,
      tap: 1,
      hp: 10,
      maxHp: 10,
      costTap: 15,
      costGoldMult: 25,
      costCrit: 30,
      goldMultLevel: 0,
      critLevel: 0,
      totalTaps: 0,
    });
  });
});
