import { test, expect } from "@playwright/test";

const ASSERT_TIMEOUT = 5000;
const STAGE_1_HP = 10;
const STAGE_2_HP = 12;
const FIRST_TAP_UPGRADE_COST = 15;

function monsterButton(page) {
  return page.getByRole("button", { name: /monster/i });
}

function tapDamageButton(page) {
  return page.getByRole("button", { name: /Tap damage/i });
}

function goldMultButton(page) {
  return page.getByRole("button", { name: /Gold multiplier/i });
}

function critButton(page) {
  return page.getByRole("button", { name: /Crit chance/i });
}

function hpText(page) {
  return page.getByText(/HP: \d+ \/ \d+/);
}

function stageText(page) {
  return page.getByText(/Stage \d+/);
}

function currentHp(page) {
  return page.getByText(/HP: (\d+)/).textContent().then((text) => {
    return Number(text.match(/HP: (\d+)/)[1]);
  });
}

async function tapMonster(page, times = 1) {
  const button = monsterButton(page);
  for (let i = 0; i < times; i++) {
    await button.click({ force: true });
  }
}

async function advanceToStage(page, targetStage) {
  while (true) {
    const stage = await stageText(page).textContent();
    const stageNumber = Number(stage.replace("Stage ", ""));

    if (stageNumber >= targetStage) {
      return;
    }

    const hp = await currentHp(page);
    await tapMonster(page, hp);
  }
}

async function killCurrentMonster(page) {
  const stageBefore = await stageText(page).textContent();
  let clicks = 0;

  while ((await stageText(page).textContent()) === stageBefore) {
    await monsterButton(page).click({ force: true });
    clicks++;
  }

  return clicks;
}

test.describe("Tap Protocol", () => {
  test("page loads with monster name, HP, and gold at 0", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText(/Lv\./)).toBeVisible({ timeout: ASSERT_TIMEOUT });
    await expect(hpText(page)).toHaveText(`HP: ${STAGE_1_HP} / ${STAGE_1_HP}`, {
      timeout: ASSERT_TIMEOUT,
    });
    await expect(page.getByText(/Gold: 0/)).toBeVisible({ timeout: ASSERT_TIMEOUT });
  });

  test("clicking monster reduces HP and awards gold", async ({ page }) => {
    await page.goto("/");

    await expect(hpText(page)).toHaveText(`HP: ${STAGE_1_HP} / ${STAGE_1_HP}`, {
      timeout: ASSERT_TIMEOUT,
    });

    await monsterButton(page).click({ force: true });

    await expect(hpText(page)).toHaveText(`HP: ${STAGE_1_HP - 1} / ${STAGE_1_HP}`, {
      timeout: ASSERT_TIMEOUT,
    });
    await expect(page.getByText(/Gold: 1/)).toBeVisible({ timeout: ASSERT_TIMEOUT });
  });

  test("clearing stage 1 advances to stage 2 with scaled HP", async ({ page }) => {
    await page.goto("/");

    await tapMonster(page, STAGE_1_HP);

    await expect(stageText(page)).toHaveText("Stage 2", { timeout: ASSERT_TIMEOUT });
    await expect(hpText(page)).toHaveText(`HP: ${STAGE_2_HP} / ${STAGE_2_HP}`, {
      timeout: ASSERT_TIMEOUT,
    });
  });

  test("stage 5 shows boss monster", async ({ page }) => {
    await page.goto("/");

    await advanceToStage(page, 5);

    await expect(stageText(page)).toHaveText("Stage 5", { timeout: ASSERT_TIMEOUT });
    await expect(monsterButton(page)).toHaveAttribute("aria-label", /boss/i, {
      timeout: ASSERT_TIMEOUT,
    });
    await expect(monsterButton(page).locator("canvas")).toHaveAttribute(
      "data-boss",
      "true",
      { timeout: ASSERT_TIMEOUT },
    );
  });

  test("shop upgrades are locked until the player can afford them", async ({ page }) => {
    await page.goto("/");

    await expect(tapDamageButton(page)).toBeDisabled({ timeout: ASSERT_TIMEOUT });
    await expect(goldMultButton(page)).toBeDisabled({ timeout: ASSERT_TIMEOUT });
    await expect(critButton(page)).toBeDisabled({ timeout: ASSERT_TIMEOUT });
  });

  test("tap damage upgrade unlocks after earning enough gold", async ({ page }) => {
    await page.goto("/");

    await tapMonster(page, FIRST_TAP_UPGRADE_COST);

    const goldText = await page.getByText(/Gold: \d+/).textContent();
    const gold = Number(goldText.match(/Gold: (\d+)/)[1]);
    expect(gold).toBeGreaterThanOrEqual(FIRST_TAP_UPGRADE_COST);
    await expect(tapDamageButton(page)).toBeEnabled({ timeout: ASSERT_TIMEOUT });
  });

  test("buying tap damage reduces clicks needed to kill the current monster", async ({ page }) => {
    await page.goto("/");

    await tapMonster(page, FIRST_TAP_UPGRADE_COST);
    await expect(tapDamageButton(page)).toBeEnabled({ timeout: ASSERT_TIMEOUT });

    const hpBeforeUpgrade = await currentHp(page);
    await expect(page.getByText(/Tap damage: 1/)).toBeVisible({
      timeout: ASSERT_TIMEOUT,
    });

    await tapDamageButton(page).click({ force: true });

    await expect(page.getByText(/Tap damage: 2/)).toBeVisible({
      timeout: ASSERT_TIMEOUT,
    });

    const clicksToKill = await killCurrentMonster(page);

    expect(clicksToKill).toBeLessThan(hpBeforeUpgrade);
  });
});
