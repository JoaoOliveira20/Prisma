import { expect, test } from "@playwright/test";
import { createApiSession, loginAsDemo } from "./helpers";

test.use({ viewport: { width: 390, height: 844 } });

test("menu mobile abre, navega e fecha com Esc", async ({ page }) => {
  await loginAsDemo(page);
  const menu = page.getByRole("button", { name: "Abrir menu" });
  const nav = page.getByRole("navigation", { name: "Principal" });
  await menu.click();
  await expect(nav.getByRole("link", { name: "Pessoas" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(nav.getByRole("link", { name: "Pessoas" })).toBeHidden();
  await menu.click();
  await nav.getByRole("link", { name: "Pessoas" }).click();
  await expect(page).toHaveURL(/\/pessoas$/);
  await expect(nav.getByRole("link", { name: "Pessoas" })).toBeHidden();
});

test("menu mobile prende o foco no menu, bloqueia o conteúdo e devolve o foco ao fechar", async ({ page }) => {
  await loginAsDemo(page);
  await page.getByRole("button", { name: "Abrir menu" }).click();
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav.getByRole("link", { name: "Início" })).toBeFocused();
  await expect(page.locator("#conteudo")).toHaveAttribute("inert", "");
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
  const box = await nav.getByRole("link", { name: "Pessoas" }).boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);

  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Abrir menu" })).toBeFocused();
  await expect(page.locator("#conteudo")).not.toHaveAttribute("inert", "");
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
});

test("sem rolagem horizontal nas telas principais", async ({ page }) => {
  await loginAsDemo(page);
  for (const path of ["/", "/explorar", "/estilos", "/pessoas", "/estrategias", "/referencias", "/grupos", "/favoritos", "/tags", "/estilos/bauhaus", "/pessoas/walter-gropius", "/estrategias/sistemas-de-grade", "/estilos/novo", "/estilos/bauhaus/editar"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `rolagem horizontal em ${path}`).toBeLessThanOrEqual(1);
  }
});

for (const [name, width, height] of [["mobile", 390, 844], ["tablet", 768, 1024]] as const) {
  test(`login (${name}): sem rolagem horizontal e botão principal acessível`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const submit = page.getByRole("button", { name: "Entrar", exact: true });
    await expect(submit).toBeVisible();
    const box = await submit.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await context.close();
  });
}

test("busca do menu mobile abre a paleta", async ({ page }) => {
  await loginAsDemo(page);
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Buscar em tudo" }).click();
  await expect(page.getByRole("dialog", { name: "Pesquisa global" })).toBeVisible();
});

test("nomes longos sem espaços quebram linha e não geram rolagem horizontal", async ({ page }) => {
  const api = await createApiSession(page.request);
  const longName = `Pessoa${"X".repeat(70)}`;
  await api.post("/people", { name: longName, summary: `Resumo ${"y".repeat(80)}` });
  await page.context().addCookies([{ name: "prisma_token", value: api.token, url: "http://localhost:3000" }]);

  for (const path of ["/pessoas", "/explorar", `/pessoas/${longName.toLowerCase()}`]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `rolagem horizontal em ${path}`).toBeLessThanOrEqual(1);
  }
});

test("no tablet a navegação usa a barra superior e o conteúdo ocupa a largura toda", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 820, height: 1100 } });
  const page = await context.newPage();
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("demo@prisma.test");
  await page.getByLabel("Senha").fill("password");
  await page.getByRole("button", { name: "Entrar", exact: true }).last().click();
  await expect(page).toHaveURL("/");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("button", { name: "Abrir menu" })).toBeVisible();
  const mainBox = await page.getByRole("main").boundingBox();
  expect(mainBox!.x).toBeLessThanOrEqual(1);
  expect(mainBox!.width).toBeGreaterThanOrEqual(800);
  await context.close();
});
