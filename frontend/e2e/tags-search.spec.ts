import { expect, test } from "@playwright/test";
import { loginAsDemo, register, uniqueName } from "./helpers";

const tagRow = (page: import("@playwright/test").Page, name: string) =>
  page.getByRole("listitem").filter({ has: page.getByRole("heading", { level: 2, name, exact: true }) });

test("gestão de tags: criar, duplicar, renomear, usar e excluir", async ({ page }) => {
  await register(page);
  const tag = uniqueName("Tag").slice(0, 38);

  await page.goto("/tags");
  await page.getByLabel("Nova tag").fill(tag);
  await page.getByRole("button", { name: "Criar tag" }).click();
  await expect(page.getByText("Tag criada.")).toBeVisible();
  await expect(tagRow(page, tag)).toBeVisible();

  await page.getByLabel("Nova tag").fill(tag);
  await page.getByRole("button", { name: "Criar tag" }).click();
  await expect(page.getByText("O valor de nome já está em uso.")).toBeVisible();

  const renamed = `${tag}x`.slice(0, 40);
  await tagRow(page, tag).getByRole("button", { name: "Renomear" }).click();
  await page.getByLabel(`Novo nome da tag ${tag}`).fill(renamed);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(tagRow(page, renamed)).toBeVisible();

  await expect(tagRow(page, "Arquitetura")).toHaveCount(0);

  const styleName = uniqueName("Estilo Tag");
  await page.goto("/estilos/novo");
  await page.getByLabel("Nome").fill(styleName);
  await page.getByText(renamed, { exact: true }).click();
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { level: 1, name: styleName })).toBeVisible();

  await page.goto("/tags");
  const used = tagRow(page, renamed);
  await expect(used.getByText("1 conteúdo")).toBeVisible();
  await expect(used.getByRole("button", { name: "Excluir" })).toBeDisabled();
});

test("renomear tag pode ser cancelado e nome repetido é recusado", async ({ page }) => {
  await register(page);
  const first = uniqueName("Tag").slice(0, 36);
  const second = `${first}b`;
  await page.goto("/tags");
  for (const name of [first, second]) {
    await page.getByLabel("Nova tag").fill(name);
    await page.getByRole("button", { name: "Criar tag" }).click();
    await expect(tagRow(page, name)).toBeVisible();
  }

  await tagRow(page, second).getByRole("button", { name: "Renomear" }).click();
  await page.getByRole("button", { name: "Cancelar" }).click();
  await expect(tagRow(page, second)).toBeVisible();

  await tagRow(page, second).getByRole("button", { name: "Renomear" }).click();
  await page.getByLabel(`Novo nome da tag ${second}`).fill(first);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("O valor de nome já está em uso.")).toBeVisible();
  await expect(page.getByLabel(`Novo nome da tag ${second}`)).toHaveValue(first);
});

test("tag sem uso pode ser excluída", async ({ page }) => {
  await register(page);
  const tag = uniqueName("Tag").slice(0, 38);
  await page.goto("/tags");
  await page.getByLabel("Nova tag").fill(tag);
  await page.getByRole("button", { name: "Criar tag" }).click();
  await expect(page.getByText("Tag criada.")).toBeVisible();

  await tagRow(page, tag).getByRole("button", { name: "Excluir" }).click();
  const confirm = page.getByRole("dialog", { name: `Excluir a tag "${tag}"?` });
  await confirm.getByRole("button", { name: "Cancelar" }).click();
  await expect(tagRow(page, tag)).toBeVisible();
  await tagRow(page, tag).getByRole("button", { name: "Excluir" }).click();
  await confirm.getByRole("button", { name: "Excluir" }).click();
  await expect(tagRow(page, tag)).toHaveCount(0);
});

test("pesquisa global agrupa por tipo e navega com teclado", async ({ page }) => {
  await loginAsDemo(page);
  await page.goto("/explorar");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Pesquisa global" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("combobox").fill("moderno");
  await expect(dialog.getByText("Tags", { exact: true })).toBeVisible();
  await dialog.getByRole("combobox").fill("bau");
  await expect(dialog.getByText("Estilos", { exact: true })).toBeVisible();
  await expect(dialog.getByRole("option", { name: /Bauhaus/ }).first()).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/estilos\/bauhaus$/);

  await page.keyboard.press("Control+k");
  await dialog.getByRole("combobox").fill("zzzzzz");
  await expect(dialog.getByText("Nenhum resultado")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("pesquisa trata % literalmente", async ({ page }) => {
  await register(page);
  await page.goto("/explorar");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Control+k");
  await page.getByRole("dialog").getByRole("combobox").fill("%");
  await expect(page.getByText("Nenhum resultado")).toBeVisible();
});

test("paleta sem busca mostra comandos de navegação e de criação com dicas de teclado", async ({ page }) => {
  await register(page);
  await page.goto("/explorar");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Pesquisa global" });
  await expect(dialog.getByRole("group", { name: "Ir para" })).toBeVisible();
  await expect(dialog.getByRole("group", { name: "Criar" })).toBeVisible();
  await expect(dialog.getByRole("option", { name: "Grupos" })).toBeVisible();
  await expect(dialog.getByRole("option", { name: "Novo estilo" })).toBeVisible();
  await expect(dialog.getByText("navegar")).toBeVisible();
  await expect(dialog.getByText("abrir")).toBeVisible();
  await expect(dialog.getByText("fechar")).toBeVisible();
  await expect(dialog.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
});

test("paleta filtra comandos, navega com setas em ciclo e abre com Enter", async ({ page }) => {
  await register(page);
  await page.goto("/explorar");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Pesquisa global" });
  const input = dialog.getByRole("combobox");

  await input.fill("nov");
  await expect(dialog.getByRole("option", { name: "Novo estilo" })).toBeVisible();
  await expect(dialog.getByRole("option", { name: "Nova pessoa" })).toBeVisible();
  await expect(dialog.getByRole("option", { name: "Grupos" })).toHaveCount(0);

  const options = dialog.getByRole("option");
  await expect(options.first()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowUp");
  await expect(options.last()).toHaveAttribute("aria-selected", "true");
  const activeId = await input.getAttribute("aria-activedescendant");
  expect(activeId).toBe(await options.last().getAttribute("id"));
  await page.keyboard.press("ArrowDown");
  await expect(options.first()).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/estilos\/novo$/);
  await expect(dialog).toBeHidden();
});

test("paleta: limpar, fechar com Esc e reabrir reinicia a busca; acentos são ignorados", async ({ page }) => {
  await register(page);
  await page.goto("/explorar");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Pesquisa global" });
  const input = dialog.getByRole("combobox");

  await input.fill("estrategia");
  await expect(dialog.getByRole("option", { name: "Estratégias" }).first()).toBeVisible();

  await dialog.getByRole("button", { name: "Limpar busca" }).click();
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();

  await input.fill("abc");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await page.keyboard.press("Control+k");
  await expect(input).toHaveValue("");
});

test("paleta fecha ao clicar fora e comando Nova referência abre o modal", async ({ page }) => {
  await register(page);
  await page.goto("/explorar");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Pesquisa global" });
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeHidden();

  await page.keyboard.press("Control+k");
  await dialog.getByRole("option", { name: "Nova referência" }).click();
  await expect(page).toHaveURL(/\/referencias\?nova=1/);
  await expect(page.getByRole("dialog", { name: "Adicionar referência" })).toBeVisible();
});

test("destaque da paleta acompanha a opção selecionada", async ({ page }) => {
  await register(page);
  await page.goto("/explorar");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Pesquisa global" });
  const highlight = dialog.locator("[data-palette-highlight]");
  await expect(highlight).toBeVisible();

  for (const presses of [0, 1, 3, 7, 9]) {
    await dialog.getByRole("combobox").fill("");
    for (let index = 0; index < presses; index++) await page.keyboard.press("ArrowDown");
    const selected = dialog.getByRole("option", { selected: true });
    await expect(selected).toHaveCount(1);
    await page.waitForTimeout(350);
    const [box, optionBox] = [await highlight.boundingBox(), await selected.boundingBox()];
    expect(Math.abs(box!.y - optionBox!.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(box!.height - optionBox!.height)).toBeLessThanOrEqual(2);
  }
});
