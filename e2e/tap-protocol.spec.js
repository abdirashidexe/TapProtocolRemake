import { test, expect } from "@playwright/test";

test.describe("Tap Protocol", () => {
  test("page loads with monster name, HP, and gold at 0", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText(/Lv\./)).toBeVisible();
    await expect(page.getByText(/HP:/)).toBeVisible();
    await expect(page.getByText(/Gold: 0/)).toBeVisible();
  });

  test("clicking monster reduces HP", async ({ page }) => {
    await page.goto("/");

    const hpText = page.getByText(/HP: \d+ \/ \d+/);
    const before = await hpText.textContent();

    await page.getByRole("button", { name: /monster/i }).click();

    const after = await hpText.textContent();
    expect(after).not.toBe(before);
  });

  test("clicking monster enough times advances stage", async ({ page }) => {
    await page.goto("/");

    const stageText = page.getByText(/Stage \d+/);
    await expect(stageText).toHaveText("Stage 1");

    for (let i = 0; i < 10; i++) {
      await page.getByRole("button", { name: /monster/i }).click();
    }

    await expect(stageText).toHaveText("Stage 2");
  });

  test("stage 5 shows boss image", async ({ page }) => {
    await page.goto("/");

    while (true) {
      const stageText = await page.getByText(/Stage \d+/).textContent();
      const stage = Number(stageText.replace("Stage ", ""));

      if (stage === 5) {
        const img = page
          .getByRole("button", { name: /monster/i })
          .locator("img");
        const src = await img.getAttribute("src");
        const alt = await img.getAttribute("alt");
        expect(src?.includes("boss") || alt?.toLowerCase().includes("boss")).toBe(
          true,
        );
        break;
      }

      const hpMatch = await page.getByText(/HP: (\d+)/).textContent();
      const currentHp = Number(hpMatch.match(/HP: (\d+)/)[1]);
      const clicks = currentHp;

      for (let i = 0; i < clicks; i++) {
        await page.getByRole("button", { name: /monster/i }).click();
      }
    }
  });

  test("buy button disabled at start with 0 gold", async ({ page }) => {
    await page.goto("/");

    const buyButton = page.getByRole("button", {
      name: /Upgrade Tap/i,
    });
    await expect(buyButton).toBeDisabled();
  });

  test("buy button enabled after 15 clicks", async ({ page }) => {
    await page.goto("/");

    const buyButton = page.getByRole("button", {
      name: /Upgrade Tap/i,
    });

    for (let i = 0; i < 15; i++) {
      await page.getByRole("button", { name: /monster/i }).click();
    }

    await expect(buyButton).toBeEnabled();
  });

  test("after buying, fewer clicks needed to kill monster", async ({ page }) => {
    await page.goto("/");

    for (let i = 0; i < 15; i++) {
      await page.getByRole("button", { name: /monster/i }).click();
    }

    await page.getByRole("button", { name: /Upgrade Tap/i }).click();

    const hpMatch = await page.getByText(/HP: (\d+)/).textContent();
    const hp = Number(hpMatch.match(/HP: (\d+)/)[1]);
    const tapsToKill = Math.ceil(hp / 2);

    for (let i = 0; i < tapsToKill; i++) {
      await page.getByRole("button", { name: /monster/i }).click();
    }

    const stageAfter = await page.getByText(/Stage \d+/).textContent();
    expect(tapsToKill).toBeLessThan(hp);
    expect(stageAfter).toBe("Stage 3");
  });
});
