import { expect, test } from "@playwright/test";
import { loginAsDemo } from "./helpers";

test.use({ viewport: { width: 390, height: 844 } });

test("menu mobile abre, navega e fecha com Esc", async ({ page }) => {
  await loginAsDemo(page);
  const menu = page.getByRole("button", { name: "Abrir menu" });
  await menu.click();
  await expect(page.getByRole("link", { name: "Pessoas" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("link", { name: "Pessoas" })).toBeHidden();
  await menu.click();
  await page.getByRole("link", { name: "Pessoas" }).click();
  await expect(page).toHaveURL(/\/pessoas$/);
  await expect(page.getByRole("link", { name: "Pessoas" })).toBeHidden();
});

test("sem rolagem horizontal nas telas principais", async ({ page }) => {
  await loginAsDemo(page);
  for (const path of ["/", "/explorar", "/pessoas", "/referencias", "/grupos", "/tags", "/estilos/bauhaus"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `rolagem horizontal em ${path}`).toBeLessThanOrEqual(1);
  }
});
