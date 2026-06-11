import { describe, it, expect } from "vitest";
import {
  stageHp,
  stageName,
  monsterEmoji,
  isBossStage,
  nextTapCost,
  createInitialState,
  applyTap,
  applyBuyTap,
} from "./gameLogic";

describe("stageHp", () => {
  it("returns 10 for stage 1", () => {
    expect(stageHp(1)).toBe(10);
  });

  it("returns 13 for stage 2", () => {
    expect(stageHp(2)).toBe(13);
  });

  it("returns 18 for stage 3", () => {
    expect(stageHp(3)).toBe(18);
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
  it("scales cost by 1.6 rounded up", () => {
    expect(nextTapCost(15)).toBe(24);
    expect(nextTapCost(24)).toBe(39);
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
  });

  it("advances stage when overkill damage would drop hp below zero", () => {
    const state = { ...createInitialState(), hp: 1, tap: 5 };
    const next = applyTap(state);

    expect(next.stage).toBe(2);
    expect(next.hp).toBe(13);
    expect(next.maxHp).toBe(13);
    expect(next.gold).toBe(1);
  });

  it("advances stage on killing blow and resets hp to new stage values", () => {
    const state = { ...createInitialState(), hp: 1 };
    const next = applyTap(state);

    expect(next.stage).toBe(2);
    expect(next.hp).toBe(13);
    expect(next.maxHp).toBe(13);
    expect(next.gold).toBe(1);
    expect(next.tap).toBe(1);
    expect(next.costTap).toBe(15);
  });

  it("preserves tap and costTap across stage transitions", () => {
    const state = {
      ...createInitialState(),
      hp: 1,
      tap: 3,
      costTap: 24,
      gold: 99,
    };
    const next = applyTap(state);

    expect(next.stage).toBe(2);
    expect(next.tap).toBe(3);
    expect(next.costTap).toBe(24);
    expect(next.gold).toBe(100);
  });
});

describe("applyBuyTap", () => {
  it("increases tap, decreases gold, and scales cost when affordable", () => {
    const state = { ...createInitialState(), gold: 15 };
    const next = applyBuyTap(state);

    expect(next.tap).toBe(2);
    expect(next.gold).toBe(0);
    expect(next.costTap).toBe(24);
    expect(next.hp).toBe(10);
    expect(next.stage).toBe(1);
  });

  it("leaves all fields unchanged when gold is insufficient", () => {
    const state = createInitialState();
    const next = applyBuyTap(state);

    expect(next.gold).toBe(0);
    expect(next.tap).toBe(1);
    expect(next.costTap).toBe(15);
    expect(next.hp).toBe(10);
    expect(next.stage).toBe(1);
    expect(next.maxHp).toBe(10);
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
    });
  });
});
