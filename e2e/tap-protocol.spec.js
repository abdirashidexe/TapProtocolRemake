import { test, expect } from "@playwright/test";

const ASSERT_TIMEOUT = 5000;

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

test.describe("Tap Protocol", () => {
  test("page loads with monster name, HP, and gold at 0", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText(/Lv\./)).toBeVisible({ timeout: ASSERT_TIMEOUT });
    await expect(page.getByText(/HP:/)).toBeVisible({ timeout: ASSERT_TIMEOUT });
    await expect(page.getByText(/Gold: 0/)).toBeVisible({ timeout: ASSERT_TIMEOUT });
  });

  test("clicking monster reduces HP", async ({ page }) => {
    await page.goto("/");

    const hp = hpText(page);
    const before = await hp.textContent();

    await monsterButton(page).click();

    await expect(hp).not.toHaveText(before ?? "", { timeout: ASSERT_TIMEOUT });
  });

  test("clicking monster enough times advances stage", async ({ page }) => {
    await page.goto("/");

    const stage = stageText(page);
    await expect(stage).toHaveText("Stage 1", { timeout: ASSERT_TIMEOUT });

    await tapMonster(page, 10);

    await expect(stage).toHaveText("Stage 2", { timeout: ASSERT_TIMEOUT });
  });

  test("stage 5 shows boss image", async ({ page }) => {
    await page.goto("/");

    await advanceToStage(page, 5);

    await expect(stageText(page)).toHaveText("Stage 5", { timeout: ASSERT_TIMEOUT });

    const img = monsterButton(page).locator("img");
    const src = await img.getAttribute("src");
    const alt = await img.getAttribute("alt");

    expect(
      src?.includes("boss") || alt?.toLowerCase().includes("boss"),
    ).toBe(true);
  });

  test("buy button disabled at start with 0 gold", async ({ page }) => {
    await page.goto("/");

    await expect(buyButton(page)).toBeDisabled({ timeout: ASSERT_TIMEOUT });
  });

  test("buy button enabled after 15 clicks", async ({ page }) => {
    await page.goto("/");

    await tapMonster(page, 15);

    await expect(buyButton(page)).toBeEnabled({ timeout: ASSERT_TIMEOUT });
  });

  test("after buying, fewer clicks needed to kill monster", async ({ page }) => {
    await page.goto("/");

    await tapMonster(page, 15);
    await expect(buyButton(page)).toBeEnabled({ timeout: ASSERT_TIMEOUT });

    const hp = await currentHp(page);
    const clicksAtTap1 = hp;

    await buyButton(page).click();

    const clicksAtTap2 = Math.ceil(hp / 2);
    expect(clicksAtTap2).toBeLessThan(clicksAtTap1);

    await tapMonster(page, clicksAtTap2);

    await expect(stageText(page)).toHaveText("Stage 3", { timeout: ASSERT_TIMEOUT });
  });
});
