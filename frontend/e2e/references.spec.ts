import { expect, test } from "@playwright/test";
import path from "node:path";
import { chooseMenuAction, createApiSession, register, uniqueName } from "./helpers";

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
  await modal.getByRole("combobox", { name: /Buscar vincular a/i }).fill(style);
  await modal.getByRole("option", { name: new RegExp(style) }).click();
  await expect(modal.getByRole("list", { name: "Selecionados" }).getByText(style)).toBeVisible();
  await modal.getByRole("button", { name: "Adicionar", exact: true }).click();
  await expect(modal).toBeHidden();

  await page.goto(`/referencias?q=${encodeURIComponent(title)}`);
  await page.getByRole("button", { name: `Ampliar ${title}` }).click();
  const lightbox = page.getByRole("dialog", { name: title });
  await expect(lightbox.getByText("Uma pequena descrição")).toBeVisible();
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
  await page.goto("/referencias?q=Vaporwave");
  await expect(page.getByRole("button", { name: "Ampliar Composição: Vaporwave" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ampliar Vaporwave" })).toBeVisible();

  await page.getByRole("navigation", { name: "Origem da imagem" }).getByRole("button", { name: "Estilos", exact: true }).click();
  await expect(page).toHaveURL(/kind=style/);
  await expect(page.getByRole("button", { name: "Ampliar Vaporwave" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ampliar Composição: Vaporwave" })).toHaveCount(0);
  await expect(page.getByText("Estilo", { exact: true }).first()).toBeVisible();

  await page.goto("/referencias");
  await page.getByRole("button", { name: /^Filtros/ }).click();
  await page.getByLabel("Estilo", { exact: true }).selectOption("bauhaus");
  await expect(page).toHaveURL(/style=bauhaus/);
  await expect(page.getByRole("list", { name: "Filtros ativos" }).getByRole("button", { name: /Remover filtro Estilo: Bauhaus/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ampliar Composição: Bauhaus" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ampliar Composição: Y2K" })).toHaveCount(0);

  await page.goto("/referencias?mine=1");
  await expect(page.getByRole("heading", { name: "Nenhuma imagem com esses filtros." })).toBeVisible();
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

test("cartão mostra o contexto da imagem e a página da referência mostra tags e conexões", async ({ page }) => {
  await register(page);
  await page.goto("/referencias?q=Composição: Bauhaus");
  const card = page.getByRole("article").filter({ has: page.getByRole("button", { name: "Ampliar Composição: Bauhaus" }) });
  await expect(card.getByText("Bauhaus", { exact: true }).first()).toBeVisible();
  await card.getByRole("link", { name: "Composição: Bauhaus" }).click();
  await expect(page).toHaveURL(/\/referencias\/\d+$/);
  await expect(page.getByRole("heading", { level: 1, name: "Composição: Bauhaus" })).toBeVisible();
  const tags = page.getByRole("list", { name: "Tags principais" }).getByRole("listitem");
  expect(await tags.count()).toBeGreaterThan(0);
  await page.getByRole("link", { name: /Bauhaus/ }).filter({ has: page.getByText("Estilo", { exact: true }) }).click();
  await expect(page).toHaveURL(/\/estilos\/bauhaus$/);
});

test("tags próprias da imagem: escolher ao criar, filtrar a biblioteca e editar", async ({ page }) => {
  const api = await createApiSession(page.request);
  const tagName = uniqueName("Cartaz");
  const otherName = uniqueName("Cor");
  const { slug } = (await (await api.post("/tags", { name: tagName })).json()).data;
  await api.post("/tags", { name: otherName });

  await register(page);
  const title = uniqueName("Ref com tag");
  await page.goto("/referencias?nova=1");
  const modal = page.getByRole("dialog", { name: "Adicionar referência" });
  await modal.getByLabel("Título").fill(title);
  await modal.locator('input[type="file"]').setInputFiles(image);
  await modal.getByText(tagName, { exact: true }).click();
  await modal.getByRole("button", { name: "Adicionar", exact: true }).click();
  await expect(modal).toBeHidden();

  await page.goto(`/referencias?tag=${slug}&q=${encodeURIComponent(title)}`);
  await expect(page.getByRole("button", { name: `Ampliar ${title}` })).toBeVisible();
  await expect(page.getByRole("list", { name: "Filtros ativos" }).getByRole("button", { name: new RegExp(tagName) })).toBeVisible();

  await page.goto(`/referencias?tag=${slug}-inexistente`);
  await expect(page.getByRole("heading", { name: "Nenhuma imagem com esses filtros." })).toBeVisible();

  await page.goto(`/referencias?q=${encodeURIComponent(title)}`);
  await page.getByRole("button", { name: `Ampliar ${title}` }).click();
  const lightbox = page.getByRole("dialog", { name: title });
  await chooseMenuAction(page, "Editar", lightbox);
  const edit = page.getByRole("dialog", { name: "Editar referência" });
  await edit.getByText(tagName, { exact: true }).click();
  await edit.getByText(otherName, { exact: true }).click();
  await edit.getByRole("button", { name: "Salvar" }).click();
  await expect(edit).toBeHidden();
  await expect(lightbox.getByRole("link", { name: otherName })).toBeVisible();
  await expect(lightbox.getByRole("link", { name: tagName })).toHaveCount(0);
});

test("seleção em lote vincula várias imagens suas a um estilo", async ({ page }) => {
  await register(page);
  const style = uniqueName("Estilo Lote");
  await createStyle(page, style);
  const prefix = uniqueName("Lote");
  const titles = [`${prefix} A`, `${prefix} B`];

  for (const title of titles) {
    await page.goto("/referencias?nova=1");
    const modal = page.getByRole("dialog", { name: "Adicionar referência" });
    await modal.getByLabel("Título").fill(title);
    await modal.locator('input[type="file"]').setInputFiles(image);
    await modal.getByRole("button", { name: "Adicionar", exact: true }).click();
    await expect(modal).toBeHidden();
  }

  await page.goto(`/referencias?q=${encodeURIComponent(prefix)}`);
  await page.getByRole("button", { name: "Selecionar imagens" }).click();
  await expect(page.getByRole("button", { name: "Vincular a…" })).toBeDisabled();
  for (const title of titles) {
    await page.getByRole("button", { name: `Selecionar ${title}` }).click();
  }
  await expect(page.getByText("2 selecionadas")).toBeVisible();
  await page.getByRole("button", { name: "Vincular a…" }).click();
  const dialog = page.getByRole("dialog", { name: "Vincular a um conteúdo" });
  await dialog.getByRole("combobox").fill(style);
  await dialog.getByRole("option", { name: new RegExp(style) }).click();
  await dialog.getByRole("button", { name: "Vincular", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Selecionar imagens" })).toBeVisible();

  await page.goto(`/estilos?q=${encodeURIComponent(style)}`);
  await page.getByRole("link", { name: new RegExp(style) }).first().click();
  await page.getByRole("link", { name: /Ver todas as 2 referências/ }).click();
  for (const title of titles) {
    await expect(page.getByRole("button", { name: `Ampliar ${title}` })).toBeVisible();
  }
});

test("vincular uma imagem a outro conteúdo pelo lightbox", async ({ page }) => {
  await register(page);
  const style = uniqueName("Estilo Lightbox");
  await createStyle(page, style);
  const title = uniqueName("Ref lightbox");
  await page.goto("/referencias?nova=1");
  const modal = page.getByRole("dialog", { name: "Adicionar referência" });
  await modal.getByLabel("Título").fill(title);
  await modal.locator('input[type="file"]').setInputFiles(image);
  await modal.getByRole("button", { name: "Adicionar", exact: true }).click();
  await expect(modal).toBeHidden();

  await page.goto(`/referencias?q=${encodeURIComponent(title)}`);
  await page.getByRole("button", { name: `Ampliar ${title}` }).click();
  const lightbox = page.getByRole("dialog", { name: title });
  await chooseMenuAction(page, "Vincular a…", lightbox);
  const dialog = page.getByRole("dialog", { name: "Vincular a um conteúdo" });
  await dialog.getByRole("combobox").fill(style);
  await dialog.getByRole("option", { name: new RegExp(style) }).click();
  await dialog.getByRole("button", { name: "Vincular", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(lightbox.getByRole("link", { name: style })).toBeVisible();
});

async function uploadReference(page: import("@playwright/test").Page, title: string) {
  await page.goto("/referencias?nova=1");
  const modal = page.getByRole("dialog", { name: "Adicionar referência" });
  await modal.getByLabel("Título").fill(title);
  await modal.locator('input[type="file"]').setInputFiles(image);
  await modal.getByRole("button", { name: "Adicionar", exact: true }).click();
  await expect(modal).toBeHidden();
}

test("busca da biblioteca é ao vivo, ordena e explica quando não encontra", async ({ page }) => {
  await register(page);
  const prefix = uniqueName("Viva");
  await uploadReference(page, `${prefix} primeira`);
  await uploadReference(page, `${prefix} segunda`);

  await page.goto("/referencias");
  await page.getByRole("searchbox", { name: "Buscar na biblioteca" }).fill(prefix);
  await expect(page).toHaveURL(new RegExp(`q=${encodeURIComponent(prefix).replace(/%20/g, "(%20|\\+)")}`));
  await expect(page.getByRole("button", { name: /^Ampliar/ })).toHaveCount(2);

  await page.getByLabel("Ordem").selectOption("oldest");
  await expect(page).toHaveURL(/sort=oldest/);
  await expect(page.getByRole("article").first()).toContainText("primeira");

  await page.getByRole("searchbox", { name: "Buscar na biblioteca" }).fill("zzz-nada-assim");
  await expect(page.getByRole("heading", { name: /Nada encontrado para/ })).toBeVisible();
  await page.getByRole("link", { name: "Ver a biblioteca inteira" }).click();
  await expect(page).toHaveURL(/\/referencias$/);
  await expect(page.getByRole("searchbox", { name: "Buscar na biblioteca" })).toHaveValue("");
});

test("favoritar e salvar em grupo direto do cartão, e filtrar pela coleção", async ({ page }) => {
  await register(page);
  const title = uniqueName("Salva");
  await uploadReference(page, title);

  await page.goto(`/referencias?q=${encodeURIComponent(title)}`);
  const card = page.getByRole("article").filter({ has: page.getByRole("button", { name: `Ampliar ${title}` }) });
  await card.hover();
  await card.getByRole("button", { name: "Adicionar aos favoritos" }).click();
  await expect(card.getByRole("button", { name: "Remover dos favoritos" })).toBeVisible();
  await page.waitForLoadState("networkidle");

  await card.hover();
  await card.getByRole("button", { name: `Salvar ${title} em grupo` }).click();
  const dialog = page.getByRole("dialog", { name: "Salvar em grupo" });
  await expect(dialog.getByRole("checkbox", { name: "Favoritos" })).toBeChecked();
  await dialog.getByRole("button", { name: "Fechar" }).click();

  await page.goto("/referencias");
  await page.getByRole("button", { name: /^Filtros/ }).click();
  await page.getByLabel("Coleção").selectOption({ label: "Favoritos" });
  await expect(page).toHaveURL(/group=\d+/);
  await expect(page.getByRole("button", { name: `Ampliar ${title}` })).toBeVisible();
});

test("a última adição aparece em destaque na biblioteca sem filtros", async ({ page }) => {
  await register(page);
  const title = uniqueName("Destaque");
  await uploadReference(page, title);
  await page.goto("/referencias");
  const featured = page.getByRole("region", { name: "Última adição" });
  await expect(featured.getByRole("heading", { name: title })).toBeVisible();
  await page.goto(`/referencias?q=${encodeURIComponent(title)}`);
  await expect(page.getByRole("region", { name: "Última adição" })).toHaveCount(0);
});

test("página da referência mostra de onde ela faz parte e sugere outras do mesmo contexto", async ({ page }) => {
  const api = await createApiSession(page.request);
  const styleName = uniqueName("Estilo Descoberta");
  const { slug } = (await (await api.post("/styles", { name: styleName })).json()).data;
  const titles = [uniqueName("Descoberta A"), uniqueName("Descoberta B")];
  for (const title of titles) {
    await api.post("/references", { title, image_url: "https://picsum.photos/seed/prisma/400/300", links: [{ type: "style", slug }] });
  }

  await register(page);
  await page.goto(`/referencias?q=${encodeURIComponent(titles[0])}`);
  await page.getByRole("article").getByRole("link", { name: titles[0] }).click();
  await expect(page.getByRole("heading", { level: 1, name: titles[0] })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /^Faz parte de/ })).toBeVisible();
  await expect(page.getByRole("link", { name: new RegExp(styleName) })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /^Mais como esta/ })).toBeVisible();
  await expect(page.getByRole("button", { name: `Ampliar ${titles[1]}` })).toBeVisible();
});
