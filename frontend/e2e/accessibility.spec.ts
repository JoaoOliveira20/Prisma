import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { loginAsDemo } from "./helpers";

const routes = [
  "/",
  "/explorar",
  "/estilos",
  "/estilos/bauhaus",
  "/pessoas",
  "/pessoas/walter-gropius",
  "/estrategias",
  "/estrategias/sistemas-de-grade",
  "/referencias",
  "/grupos",
  "/favoritos",
  "/tags",
  "/estilos/novo",
  "/estilos/bauhaus/editar",
];

async function violationsOf(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return violations.map((violation) => `${violation.id} (${violation.impact}): ${violation.nodes.slice(0, 3).map((node) => node.target.join(" ")).join(" | ")}`);
}

test("telas autenticadas não têm violações de acessibilidade WCAG AA detectáveis", async ({ page }) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await loginAsDemo(page);
  for (const route of routes) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    expect(await violationsOf(page), `violações em ${route}`).toEqual([]);
  }
});

test("tela de login não tem violações de acessibilidade WCAG AA detectáveis", async ({ page }) => {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);
  expect(await violationsOf(page), "violações em /login").toEqual([]);
});

test("camadas abertas (paleta, menu, modal e lightbox) também passam na verificação", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await loginAsDemo(page);
  await page.goto("/referencias?q=Composição: Bauhaus");
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: /^Filtros/ }).click();
  await expect(page.getByLabel("Estilo", { exact: true })).toBeVisible();
  expect(await violationsOf(page), "filtros").toEqual([]);
  await page.getByRole("button", { name: /^Filtros/ }).click();

  await page.keyboard.press("Control+k");
  const palette = page.getByRole("dialog", { name: "Pesquisa global" });
  await palette.getByRole("combobox").fill("bau");
  await expect(palette.getByRole("option").first()).toBeVisible();
  expect(await violationsOf(page), "paleta").toEqual([]);
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Nova referência" }).click();
  await expect(page.getByRole("dialog", { name: "Adicionar referência" })).toBeVisible();
  expect(await violationsOf(page), "modal").toEqual([]);
  await page.getByRole("dialog", { name: "Adicionar referência" }).getByRole("combobox").click();
  await expect(page.getByRole("listbox", { name: "Resultados" })).toBeVisible();
  expect(await violationsOf(page), "seletor de vínculo").toEqual([]);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Selecionar imagens" }).click();
  expect(await violationsOf(page), "seleção em lote").toEqual([]);
  await page.getByRole("button", { name: "Cancelar" }).click();

  await page.getByRole("button", { name: "Ampliar Composição: Bauhaus" }).click();
  await expect(page.getByRole("dialog", { name: "Composição: Bauhaus" })).toBeVisible();
  expect(await violationsOf(page), "lightbox").toEqual([]);

  await page.keyboard.press("Escape");
  await page.getByRole("article").getByRole("link", { name: "Composição: Bauhaus" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Composição: Bauhaus" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600);
  expect(await violationsOf(page), "página da referência").toEqual([]);
});
