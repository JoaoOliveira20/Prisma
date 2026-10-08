import { expect, test } from "@playwright/test";
import path from "node:path";
import { chooseMenuAction, register, uniqueName } from "./helpers";

const image = path.join(__dirname, "fixtures", "pixel.png");

async function createStyle(page: import("@playwright/test").Page, name: string) {
  await page.goto("/estilos/novo");
  await page.getByLabel("Nome").fill(name);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
}

test("biblioteca: criar por modal com upload e vínculo, editar, agrupar e remover", async ({ page }) => {
  await register(page);
  const style = uniqueName("Estilo Ref");
  await createStyle(page, style);

  const title = uniqueName("Ref");
  await page.goto("/referencias");
  await page.getByRole("button", { name: "Nova referência" }).click();
  const modal = page.getByRole("dialog", { name: "Adicionar referência" });
  await modal.getByLabel("Título").fill(title);
  await modal.getByLabel("Descrição (opcional)").fill("Uma pequena descrição");
  await modal.locator('input[type="file"]').setInputFiles(image);
  await modal.getByText(style, { exact: true }).click();
  await modal.getByRole("button", { name: "Adicionar", exact: true }).click();
  await expect(modal).toBeHidden();

  await page.goto(`/referencias?q=${encodeURIComponent(title)}`);
  await expect(page.getByText("Uma pequena descrição").first()).toBeVisible();
  await page.getByRole("button", { name: `Ampliar ${title}` }).click();
  const lightbox = page.getByRole("dialog", { name: title });
  await expect(lightbox.getByRole("link", { name: style })).toBeVisible();
  await lightbox.getByRole("button", { name: "Adicionar aos favoritos" }).click();
  await expect(lightbox.getByRole("button", { name: "Remover dos favoritos" })).toBeVisible();

  await chooseMenuAction(page, "Editar", lightbox);
  const edit = page.getByRole("dialog", { name: "Editar referência" });
  await edit.getByLabel("Crédito (opcional)").fill("Crédito editado");
  await edit.getByRole("button", { name: "Salvar" }).click();
  await expect(edit).toBeHidden();
  await expect(lightbox.getByText("Crédito: Crédito editado")).toBeVisible();

  await chooseMenuAction(page, "Salvar em grupo", lightbox);
  await expect(page.getByRole("dialog", { name: "Salvar em grupo" }).getByRole("checkbox", { name: "Favoritos" })).toBeChecked();
  await page.getByRole("dialog", { name: "Salvar em grupo" }).getByRole("button", { name: "Fechar" }).click();

  await page.goto("/favoritos");
  await expect(page.getByRole("button", { name: `Ampliar ${title}` })).toBeVisible();

  await page.goto(`/referencias?q=${encodeURIComponent(title)}`);
  await page.getByRole("button", { name: `Ampliar ${title}` }).click();
  await chooseMenuAction(page, "Remover", page.getByRole("dialog", { name: title }));
  await page.getByRole("dialog", { name: `Remover "${title}"?` }).getByRole("button", { name: "Remover" }).click();
  await expect(page.getByRole("button", { name: `Ampliar ${title}` })).toHaveCount(0);
});

test("modal recusa imagem ausente e arquivo inválido, e mantém o digitado", async ({ page }) => {
  await register(page);
  await page.goto("/referencias");
  await page.getByRole("button", { name: "Nova referência" }).click();
  const modal = page.getByRole("dialog", { name: "Adicionar referência" });
  const title = uniqueName("Sem imagem");
  await modal.getByLabel("Título").fill(title);
  await modal.getByRole("button", { name: "Adicionar", exact: true }).click();
  await expect(modal.getByText("Informe imagem ou URL da imagem.").first()).toBeVisible();
  await expect(modal.getByLabel("Título")).toHaveValue(title);

  await modal.locator('input[type="file"]').setInputFiles({ name: "x.txt", mimeType: "text/plain", buffer: Buffer.from("nao sou imagem") });
  await modal.getByRole("button", { name: "Adicionar", exact: true }).click();
  await expect(modal.getByText("O campo imagem deve ser uma imagem válida.")).toBeVisible();
});

test("vincular a mesma imagem a mais de um estilo", async ({ page }) => {
  await register(page);
  const first = uniqueName("Estilo A");
  const second = uniqueName("Estilo B");
  await createStyle(page, first);
  await createStyle(page, second);

  await page.goto(`/estilos?q=${encodeURIComponent(first)}`);
  await page.getByRole("link", { name: new RegExp(first) }).first().click();
  await page.getByRole("button", { name: "Adicionar referência" }).click();
  const modal = page.getByRole("dialog", { name: "Adicionar referência" });
  const title = uniqueName("Arte compartilhada");
  await modal.getByLabel("Título").fill(title);
  await modal.locator('input[type="file"]').setInputFiles(image);
  await modal.getByRole("button", { name: "Adicionar", exact: true }).click();
  await expect(modal).toBeHidden();
  await page.reload();
  await expect(page.getByRole("heading", { level: 2, name: /^Referências\s*1$/ })).toBeVisible();
  await expect(page.getByRole("button", { name: `Ampliar ${title}` })).toBeVisible();

  await page.goto(`/estilos?q=${encodeURIComponent(second)}`);
  await page.getByRole("link", { name: new RegExp(second) }).first().click();
  await page.getByRole("button", { name: "Adicionar referência" }).click();
  await modal.getByRole("tab", { name: "Vincular imagem existente" }).click();
  await modal.getByLabel(`Vincular ${title}`).check();
  await modal.getByRole("button", { name: /Vincular 1/ }).click();
  await expect(modal).toBeHidden();
  await page.reload();
  await page.getByRole("button", { name: `Ampliar ${title}` }).click();
  const lightbox = page.getByRole("dialog", { name: title });
  await expect(lightbox.getByRole("link", { name: first })).toBeVisible();
  await expect(lightbox.getByRole("link", { name: second })).toBeVisible();
});

test("filtros da biblioteca: origem, estilo e só o que criei", async ({ page }) => {
  await register(page);
  await page.goto("/referencias");
  await expect(page.getByRole("button", { name: "Ampliar Composição: Vaporwave" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ampliar Vaporwave" })).toBeVisible();

  await page.getByRole("navigation", { name: "Origem da imagem" }).getByRole("link", { name: "Estilos", exact: true }).click();
  await expect(page).toHaveURL(/kind=style/);
  await expect(page.getByRole("button", { name: "Ampliar Vaporwave" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ampliar Composição: Vaporwave" })).toHaveCount(0);
  await expect(page.getByText("Estilo", { exact: true }).first()).toBeVisible();

  await page.goto("/referencias");
  await page.getByLabel("Estilo", { exact: true }).selectOption("bauhaus");
  await page.getByRole("button", { name: "Filtrar" }).click();
  await expect(page.getByRole("button", { name: "Ampliar Composição: Bauhaus" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ampliar Composição: Y2K" })).toHaveCount(0);

  await page.goto("/referencias?mine=1");
  await expect(page.getByText("Nenhuma imagem encontrada com esses filtros.")).toBeVisible();
  await page.goto("/referencias?q=Brutalismo");
  await expect(page.getByRole("button", { name: /Ampliar/ })).toHaveCount(2);
});

test("lightbox de capa de estilo leva à página do estilo", async ({ page }) => {
  await register(page);
  await page.goto("/referencias?kind=style&q=Bauhaus");
  await page.getByRole("button", { name: "Ampliar Bauhaus" }).click();
  await page.getByRole("dialog", { name: "Bauhaus" }).getByRole("link", { name: "Abrir estilo" }).click();
  await expect(page).toHaveURL(/\/estilos\/bauhaus$/);
});

test("upload de capa em estilo próprio e remoção", async ({ page }) => {
  await register(page);
  const name = uniqueName("Estilo Capa");
  await page.goto("/estilos/novo");
  await page.getByLabel("Nome").fill(name);
  await page.locator('input[type="file"]').setInputFiles(image);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  await expect(page.locator(`img[alt="${name}"]`).first()).toHaveAttribute("src", /\/storage\/images\//);

  await chooseMenuAction(page, "Editar");
  await page.getByLabel("Remover a imagem enviada").check();
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  await expect(page.locator(`img[alt="${name}"]`)).toHaveCount(0);
});

test("lightbox navega entre as imagens com botões e com as setas do teclado", async ({ page }) => {
  await register(page);
  await page.goto("/referencias?kind=style");
  await page.waitForLoadState("networkidle");
  const buttons = page.getByRole("button", { name: /^Ampliar / });
  const total = await buttons.count();
  expect(total).toBeGreaterThanOrEqual(3);
  const firstTitle = (await buttons.first().getAttribute("aria-label"))!.replace("Ampliar ", "");

  await buttons.first().click();
  const lightbox = page.getByRole("dialog");
  await expect(lightbox.getByText(`1 de ${total}`)).toBeVisible();
  await expect(lightbox.getByRole("heading", { level: 3, name: firstTitle })).toBeVisible();

  await page.keyboard.press("ArrowRight");
  await expect(lightbox.getByText(`2 de ${total}`)).toBeVisible();
  await lightbox.getByRole("button", { name: "Próxima imagem" }).click();
  await expect(lightbox.getByText(`3 de ${total}`)).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await lightbox.getByRole("button", { name: "Imagem anterior" }).click();
  await expect(lightbox.getByText(`1 de ${total}`)).toBeVisible();

  await page.keyboard.press("ArrowLeft");
  await expect(lightbox.getByText(`${total} de ${total}`)).toBeVisible();
});
