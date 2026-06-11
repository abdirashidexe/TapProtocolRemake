const STAGE_NAMES = ["Goblin", "Slime", "Skeleton", "Orc", "Wraith"];

const MONSTER_EMOJIS = ["👺", "🟢", "💀", "👹"];

const BOSS_EMOJI = "🐉";

export function stageHp(stage) {
  return Math.floor(10 * Math.pow(1.35, stage - 1));
}

export function stageName(stage) {
  const name = STAGE_NAMES[(stage - 1) % STAGE_NAMES.length];
  return `${name} Lv. ${stage}`;
}

export function isBossStage(stage) {
  return stage % 5 === 0;
}

export function monsterEmoji(stage) {
  if (isBossStage(stage)) {
    return BOSS_EMOJI;
  }

  return MONSTER_EMOJIS[(stage - 1) % MONSTER_EMOJIS.length];
}

export function nextTapCost(cost) {
  return Math.ceil(cost * 1.6);
}

export function createInitialState() {
  const hp = stageHp(1);
  return {
    stage: 1,
    gold: 0,
    tap: 1,
    hp,
    maxHp: hp,
    costTap: 15,
  };
}

export function applyTap(state) {
  const gold = state.gold + 1;
  const hp = Math.max(0, state.hp - state.tap);

  if (hp <= 0) {
    const stage = state.stage + 1;
    const newHp = stageHp(stage);

    return {
      ...state,
      stage,
      gold,
      hp: newHp,
      maxHp: newHp,
    };
  }

  return {
    ...state,
    gold,
    hp,
  };
}

export function applyBuyTap(state) {
  if (state.gold < state.costTap) {
    return state;
  }

  return {
    ...state,
    gold: state.gold - state.costTap,
    tap: state.tap + 1,
    costTap: nextTapCost(state.costTap),
  };
}
