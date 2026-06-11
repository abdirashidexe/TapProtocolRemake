import { describe, it, expect } from "vitest";
import {
  stageHp,
  stageName,
  monsterImage,
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

describe("monsterImage", () => {
  it("returns boss image on every 5th stage", () => {
    expect(monsterImage(5)).toBe("/images/boss.png");
    expect(monsterImage(10)).toBe("/images/boss.png");
  });

  it("cycles through regular images for non-boss stages", () => {
    expect(monsterImage(1)).toBe("/images/goblin.png");
    expect(monsterImage(2)).toBe("/images/slime.png");
    expect(monsterImage(3)).toBe("/images/skeleton.png");
    expect(monsterImage(4)).toBe("/images/orc.png");
    expect(monsterImage(6)).toBe("/images/slime.png");
  });

  it("does not return boss image on stages 4 or 6", () => {
    expect(monsterImage(4)).not.toBe("/images/boss.png");
    expect(monsterImage(6)).not.toBe("/images/boss.png");
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
