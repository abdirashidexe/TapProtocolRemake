const STAGE_NAMES = ["Goblin", "Slime", "Skeleton", "Orc", "Wraith"];

const MONSTER_EMOJIS = ["👺", "🟢", "💀", "👹"];

const BOSS_EMOJI = "🐉";

const CRIT_DAMAGE_MULTIPLIER = 2;
const CRIT_CHANCE_PER_LEVEL = 5;
const GOLD_MULT_PER_LEVEL = 0.15;
const HP_GROWTH = 1.28;
const COST_GROWTH = 1.48;

export function stageHp(stage) {
  return Math.floor(10 * Math.pow(HP_GROWTH, stage - 1));
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
  return Math.ceil(cost * COST_GROWTH);
}

export function tapDamageGain(currentTap) {
  return 1 + Math.floor(currentTap / 5);
}

export function goldMultiplierValue(goldMultLevel) {
  return 1 + goldMultLevel * GOLD_MULT_PER_LEVEL;
}

export function critChancePercent(critLevel) {
  return critLevel * CRIT_CHANCE_PER_LEVEL;
}

export function stageGoldBonus(stage) {
  return 1 + Math.floor((stage - 1) / 3) * 0.25;
}

export function goldPerTap(goldMultLevel, stage = 1) {
  return Math.max(
    1,
    Math.round(goldMultiplierValue(goldMultLevel) * stageGoldBonus(stage)),
  );
}

export function stageClearGoldBonus(stage) {
  return Math.max(2, Math.floor(stage * 2));
}

export function isCriticalHit(totalTaps, critLevel) {
  const chance = critChancePercent(critLevel);
  if (chance <= 0) {
    return false;
  }

  return (totalTaps * 17 + 31) % 100 < chance;
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
    costGoldMult: 25,
    costCrit: 30,
    goldMultLevel: 0,
    critLevel: 0,
    totalTaps: 0,
  };
}

export function applyTap(state) {
  const totalTaps = state.totalTaps + 1;
  const isCrit = isCriticalHit(totalTaps, state.critLevel);
  const damage = state.tap * (isCrit ? CRIT_DAMAGE_MULTIPLIER : 1);
  const tapGold = goldPerTap(state.goldMultLevel, state.stage);
  const hp = Math.max(0, state.hp - damage);

  if (hp <= 0) {
    const clearBonus = stageClearGoldBonus(state.stage);
    const goldEarned = tapGold + clearBonus;
    const stage = state.stage + 1;
    const newHp = stageHp(stage);

    return {
      ...state,
      stage,
      totalTaps,
      gold: state.gold + goldEarned,
      hp: newHp,
      maxHp: newHp,
      lastCrit: isCrit,
      lastDamage: damage,
      lastGold: goldEarned,
    };
  }

  return {
    ...state,
    totalTaps,
    gold: state.gold + tapGold,
    hp,
    lastCrit: isCrit,
    lastDamage: damage,
    lastGold: tapGold,
  };
}

export function applyBuyTap(state) {
  if (state.gold < state.costTap) {
    return state;
  }

  return {
    ...state,
    gold: state.gold - state.costTap,
    tap: state.tap + tapDamageGain(state.tap),
    costTap: nextTapCost(state.costTap),
  };
}

export function applyBuyGoldMult(state) {
  if (state.gold < state.costGoldMult) {
    return state;
  }

  return {
    ...state,
    gold: state.gold - state.costGoldMult,
    goldMultLevel: state.goldMultLevel + 1,
    costGoldMult: nextTapCost(state.costGoldMult),
  };
}

export function applyBuyCrit(state) {
  if (state.gold < state.costCrit) {
    return state;
  }

  return {
    ...state,
    gold: state.gold - state.costCrit,
    critLevel: state.critLevel + 1,
    costCrit: nextTapCost(state.costCrit),
  };
}
