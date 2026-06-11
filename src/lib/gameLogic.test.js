import { describe, it, expect } from "vitest";
import {
  stageHp,
  stageName,
  monsterEmoji,
  isBossStage,
  nextTapCost,
  tapDamageGain,
  goldMultiplierValue,
  critChancePercent,
  stageGoldBonus,
  goldPerTap,
  stageClearGoldBonus,
  isCriticalHit,
  createInitialState,
  applyTap,
  applyBuyTap,
  applyBuyGoldMult,
  applyBuyCrit,
} from "./gameLogic";

describe("stageHp", () => {
  it("returns 10 for stage 1", () => {
    expect(stageHp(1)).toBe(10);
  });

  it("returns 12 for stage 2", () => {
    expect(stageHp(2)).toBe(12);
  });

  it("returns 16 for stage 3", () => {
    expect(stageHp(3)).toBe(16);
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

  it("does not return boss emoji on stages 4 or 6", () => {
    expect(monsterEmoji(4)).not.toBe("🐉");
    expect(monsterEmoji(6)).not.toBe("🐉");
  });
});

describe("nextTapCost", () => {
  it("scales cost by 1.48 rounded up", () => {
    expect(nextTapCost(15)).toBe(23);
    expect(nextTapCost(25)).toBe(37);
  });
});

describe("tapDamageGain", () => {
  it("starts at +1 and scales every 5 tap levels", () => {
    expect(tapDamageGain(1)).toBe(1);
    expect(tapDamageGain(5)).toBe(2);
    expect(tapDamageGain(10)).toBe(3);
  });
});

describe("goldMultiplierValue", () => {
  it("adds 15% per level", () => {
    expect(goldMultiplierValue(0)).toBe(1);
    expect(goldMultiplierValue(1)).toBe(1.15);
    expect(goldMultiplierValue(5)).toBe(1.75);
  });
});

describe("critChancePercent", () => {
  it("adds 5% per level", () => {
    expect(critChancePercent(0)).toBe(0);
    expect(critChancePercent(1)).toBe(5);
    expect(critChancePercent(3)).toBe(15);
  });
});

describe("stageGoldBonus", () => {
  it("adds 25% every 3 stages", () => {
    expect(stageGoldBonus(1)).toBe(1);
    expect(stageGoldBonus(4)).toBe(1.25);
    expect(stageGoldBonus(7)).toBe(1.5);
  });
});

describe("goldPerTap", () => {
  it("rounds multiplied gold with a minimum of 1", () => {
    expect(goldPerTap(0)).toBe(1);
    expect(goldPerTap(5)).toBe(2);
    expect(goldPerTap(5, 4)).toBe(2);
    expect(goldPerTap(5, 7)).toBe(3);
  });
});

describe("stageClearGoldBonus", () => {
  it("awards at least 2 gold scaling with stage", () => {
    expect(stageClearGoldBonus(1)).toBe(2);
    expect(stageClearGoldBonus(5)).toBe(10);
    expect(stageClearGoldBonus(10)).toBe(20);
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
  it("reduces hp by tap amount and increases gold", () => {
    const state = createInitialState();
    const next = applyTap(state);

    expect(next.hp).toBe(9);
    expect(next.gold).toBe(1);
    expect(next.stage).toBe(1);
    expect(next.maxHp).toBe(10);
    expect(next.lastDamage).toBe(1);
    expect(next.lastCrit).toBe(false);
  });

  it("deals double damage on a crit", () => {
    const state = { ...createInitialState(), critLevel: 1, totalTaps: 9, tap: 3 };
    const next = applyTap(state);

    expect(next.lastCrit).toBe(true);
    expect(next.lastDamage).toBe(6);
    expect(next.hp).toBe(4);
  });

  it("awards more gold with a higher gold multiplier level", () => {
    const state = { ...createInitialState(), goldMultLevel: 5 };
    const next = applyTap(state);

    expect(next.gold).toBe(2);
    expect(next.lastGold).toBe(2);
  });

  it("advances stage when overkill damage would drop hp below zero", () => {
    const state = { ...createInitialState(), hp: 1, tap: 5 };
    const next = applyTap(state);

    expect(next.stage).toBe(2);
    expect(next.hp).toBe(12);
    expect(next.maxHp).toBe(12);
    expect(next.gold).toBe(3);
  });

  it("advances stage on killing blow and resets hp to new stage values", () => {
    const state = { ...createInitialState(), hp: 1 };
    const next = applyTap(state);

    expect(next.stage).toBe(2);
    expect(next.hp).toBe(12);
    expect(next.maxHp).toBe(12);
    expect(next.gold).toBe(3);
    expect(next.tap).toBe(1);
    expect(next.costTap).toBe(15);
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

  it("returns unchanged state when gold is insufficient", () => {
    const state = createInitialState();
    const next = applyBuyTap(state);

    expect(next.gold).toBe(0);
    expect(next.tap).toBe(1);
    expect(next.costTap).toBe(15);
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

  it("returns unchanged state when gold is insufficient", () => {
    const state = createInitialState();
    const next = applyBuyGoldMult(state);

    expect(next.goldMultLevel).toBe(0);
    expect(next.gold).toBe(0);
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

  it("returns unchanged state when gold is insufficient", () => {
    const state = createInitialState();
    const next = applyBuyCrit(state);

    expect(next.critLevel).toBe(0);
    expect(next.gold).toBe(0);
  });
});

describe("createInitialState", () => {
  it("matches the spec initial values", () => {
    const state = createInitialState();

    expect(state).toEqual({
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
