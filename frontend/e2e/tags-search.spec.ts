import { expect, test } from "@playwright/test";
import { register, uniqueName } from "./helpers";

test("gestão de tags: criar, duplicar, renomear, usar e excluir", async ({ page }) => {
  await register(page);
  const tag = uniqueName("Tag").slice(0, 38);

  await page.goto("/tags");
  await page.getByLabel("Nova tag").fill(tag);
  await page.getByRole("button", { name: "Criar tag" }).click();
  await expect(page.getByText("Tag criada.")).toBeVisible();
  await expect(page.getByRole("heading", { name: tag }).or(page.getByText(tag, { exact: true })).first()).toBeVisible();

  await page.getByLabel("Nova tag").fill(tag);
  await page.getByRole("button", { name: "Criar tag" }).click();
  await expect(page.getByText("O valor de nome já está em uso.")).toBeVisible();

  const renamed = `${tag}x`.slice(0, 40);
  const row = page.getByRole("listitem").filter({ has: page.getByLabel(`Novo nome da tag ${tag}`) });
  await row.getByLabel(`Novo nome da tag ${tag}`).fill(renamed);
  await row.getByRole("button", { name: "Renomear" }).click();
  await expect(page.getByText("Tag renomeada.")).toBeVisible();

  const system = page.getByRole("listitem").filter({ hasText: "Arquitetura" });
  await expect(system.getByText("somente leitura")).toBeVisible();
  await expect(system.getByRole("button", { name: "Renomear" })).toHaveCount(0);

  const styleName = uniqueName("Estilo Tag");
  await page.goto("/estilos/novo");
  await page.getByLabel("Nome").fill(styleName);
  await page.getByText(renamed, { exact: true }).click();
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { level: 1, name: styleName })).toBeVisible();

  await page.goto("/tags");
  const used = page.getByRole("listitem").filter({ has: page.getByLabel(`Novo nome da tag ${renamed}`) });
  await expect(used.getByText("1 conteúdo")).toBeVisible();
  await expect(used.getByRole("button", { name: "Excluir" })).toBeDisabled();
});

test("tag sem uso pode ser excluída", async ({ page }) => {
  await register(page);
  const tag = uniqueName("Tag").slice(0, 38);
  await page.goto("/tags");
  await page.getByLabel("Nova tag").fill(tag);
  await page.getByRole("button", { name: "Criar tag" }).click();
  await expect(page.getByText("Tag criada.")).toBeVisible();

  const row = page.getByRole("listitem").filter({ has: page.getByLabel(`Novo nome da tag ${tag}`) });
  await row.getByRole("button", { name: "Excluir" }).click();
  const confirm = page.getByRole("dialog", { name: `Excluir a tag "${tag}"?` });
  await confirm.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByLabel(`Novo nome da tag ${tag}`)).toBeVisible();
  await row.getByRole("button", { name: "Excluir" }).click();
  await confirm.getByRole("button", { name: "Excluir" }).click();
  await expect(page.getByLabel(`Novo nome da tag ${tag}`)).toHaveCount(0);
});

test("pesquisa global agrupa por tipo e navega com teclado", async ({ page }) => {
  await register(page);
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
