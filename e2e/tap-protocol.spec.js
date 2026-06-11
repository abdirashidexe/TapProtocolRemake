import { test, expect } from "@playwright/test";

const ASSERT_TIMEOUT = 5000;
const STAGE_1_HP = 10;

function monsterButton(page) {
  return page.getByRole("button", { name: /monster/i });
}

function buyButton(page) {
  return page.getByRole("button", { name: /Upgrade Tap/i });
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
    await button.click();
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
    await monsterButton(page).click();
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

    await monsterButton(page).click();

    await expect(hpText(page)).toHaveText(`HP: ${STAGE_1_HP - 1} / ${STAGE_1_HP}`, {
      timeout: ASSERT_TIMEOUT,
    });
    await expect(page.getByText(/Gold: 1/)).toBeVisible({ timeout: ASSERT_TIMEOUT });
  });

  test("clicking monster enough times advances stage", async ({ page }) => {
    await page.goto("/");

    const stage = stageText(page);
    await expect(stage).toHaveText("Stage 1", { timeout: ASSERT_TIMEOUT });

    await tapMonster(page, STAGE_1_HP);

    await expect(stage).toHaveText("Stage 2", { timeout: ASSERT_TIMEOUT });
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

  test("buy button disabled at start with 0 gold", async ({ page }) => {
    await page.goto("/");

    await expect(buyButton(page)).toBeDisabled({ timeout: ASSERT_TIMEOUT });
    await expect(page.getByText(/Gold: 0/)).toBeVisible({ timeout: ASSERT_TIMEOUT });
  });

  test("buy button enabled after 15 clicks", async ({ page }) => {
    await page.goto("/");

    await tapMonster(page, 15);

    await expect(page.getByText(/Gold: 15/)).toBeVisible({ timeout: ASSERT_TIMEOUT });
    await expect(buyButton(page)).toBeEnabled({ timeout: ASSERT_TIMEOUT });
  });

  test("after buying, fewer clicks needed to kill monster", async ({ page }) => {
    await page.goto("/");

    await tapMonster(page, 15);
    await expect(buyButton(page)).toBeEnabled({ timeout: ASSERT_TIMEOUT });

    const hpBeforeUpgrade = await currentHp(page);
    await expect(page.getByText(/Tap damage: 1/)).toBeVisible({
      timeout: ASSERT_TIMEOUT,
    });

    await buyButton(page).click();

    await expect(page.getByText(/Tap damage: 2/)).toBeVisible({
      timeout: ASSERT_TIMEOUT,
    });

    const clicksToKill = await killCurrentMonster(page);

    expect(clicksToKill).toBeLessThan(hpBeforeUpgrade);
  });
});
