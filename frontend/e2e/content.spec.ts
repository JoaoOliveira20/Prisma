import { expect, test } from "@playwright/test";
import { chooseMenuAction, createApiSession, register, uniqueName } from "./helpers";

test("criar estilo, favoritar, agrupar, editar e excluir", async ({ page }) => {
  await register(page);
  const name = uniqueName("Estilo E2E");

  await page.goto("/estilos/novo");
  await page.getByLabel("Nome").fill(name);
  await page.getByLabel("Descrição curta").fill("Resumo de teste");
  await page.getByText("Design", { exact: true }).first().click();
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();

  await page.getByRole("button", { name: "Adicionar aos favoritos" }).first().click();
  await expect(page.getByRole("button", { name: "Remover dos favoritos" }).first()).toBeVisible();

  await chooseMenuAction(page, "Salvar em grupo");
  const groupModal = page.getByRole("dialog", { name: "Salvar em grupo" });
  await expect(groupModal.getByRole("checkbox", { name: "Favoritos" })).toBeChecked();
  await groupModal.getByRole("button", { name: "Fechar" }).click();
  await expect(groupModal).toBeHidden();

  await page.goto("/favoritos");
  await expect(page.getByRole("heading", { level: 1, name: "Favoritos" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name })).toBeVisible();

  await page.goto(`/estilos?q=${encodeURIComponent(name)}`);
  await page.getByRole("link", { name: new RegExp(name) }).first().click();
  await chooseMenuAction(page, "Editar");
  await page.getByLabel("Descrição curta").fill("Resumo alterado");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Resumo alterado")).toBeVisible();

  await chooseMenuAction(page, "Excluir");
  const confirm = page.getByRole("dialog", { name: `Excluir "${name}"?` });
  await confirm.getByRole("button", { name: "Cancelar" }).click();
  await expect(confirm).toBeHidden();
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();

  await chooseMenuAction(page, "Excluir");
  await page.getByRole("dialog", { name: `Excluir "${name}"?` }).getByRole("button", { name: "Excluir" }).click();
  await expect(page).toHaveURL(/\/estilos$/);
  await expect(page.getByText(name)).toHaveCount(0);
});

test("criar nome vazio é recusado e conteúdo alheio não mostra Editar", async ({ page }) => {
  await register(page);
  await page.goto("/estilos/bauhaus");
  await expect(page.getByRole("heading", { level: 1, name: "Bauhaus" })).toBeVisible();
  await page.getByRole("button", { name: "Mais ações" }).click();
  await expect(page.getByRole("menuitem", { name: "Salvar em grupo" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Editar" })).toHaveCount(0);
  await expect(page.getByRole("menuitem", { name: "Excluir" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  await page.goto("/estilos/bauhaus/editar");
  await expect(page).toHaveURL(/\/estilos\/bauhaus$/);
});

test("pessoa e estratégia vinculadas a estilo próprio aparecem nas abas do estilo", async ({ page }) => {
  await register(page);
  const style = uniqueName("Estilo Vinc");
  await page.goto("/estilos/novo");
  await page.getByLabel("Nome").fill(style);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { level: 1, name: style })).toBeVisible();

  const person = uniqueName("Pessoa Vinc");
  await page.goto("/pessoas/novo");
  await page.getByLabel("Nome").fill(person);
  await page.getByText(style, { exact: true }).click();
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { level: 1, name: person })).toBeVisible();

  const strategy = uniqueName("Estrategia Vinc");
  await page.goto("/estrategias/novo");
  await page.getByLabel("Nome").fill(strategy);
  await page.getByText(style, { exact: true }).click();
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { level: 1, name: strategy })).toBeVisible();

  await page.goto(`/estilos?q=${encodeURIComponent(style)}`);
  await page.getByRole("link", { name: new RegExp(style) }).first().click();
  await expect(page.getByRole("heading", { level: 2, name: /^Pessoas\s*1$/ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: person })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /^Estratégias\s*1$/ })).toBeVisible();
  await expect(page.getByRole("link", { name: new RegExp(strategy) })).toBeVisible();
});

test("busca na listagem e filtro por tag", async ({ page }) => {
  await register(page);
  await page.goto("/explorar");
  await page.getByRole("searchbox", { name: "Buscar" }).fill("1919");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page).toHaveURL(/q=1919/);
  await expect(page.getByRole("heading", { name: "Bauhaus" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Minimalismo" })).toHaveCount(0);

  await page.goto("/explorar");
  await page.getByRole("navigation", { name: "Filtrar por tag" }).getByRole("link", { name: "Urbano" }).click();
  await expect(page.getByRole("heading", { name: "Brutalismo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bauhaus" })).toHaveCount(0);

  await page.goto("/explorar?q=nada-existe-aqui");
  await expect(page.getByText("Nada encontrado com esses filtros.")).toBeVisible();
});

test("erro de validação do servidor preserva o que foi digitado", async ({ page }) => {
  await register(page);
  await page.goto("/estilos/novo");
  await page.getByLabel("Nome").fill("Estilo com erro");
  await page.getByLabel("Descrição curta").fill("texto digitado");
  await page.getByLabel("Período").fill("x".repeat(100));
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("O campo período não pode ter mais de 80 caracteres.")).toBeVisible();
  await expect(page.getByLabel("Nome")).toHaveValue("Estilo com erro");
  await expect(page.getByLabel("Descrição curta")).toHaveValue("texto digitado");
  await expect(page.getByLabel("Período")).toHaveValue("x".repeat(100));
});

test("coração de itens relacionados e do lightbox reflete o estado salvo", async ({ page }) => {
  await register(page);
  await page.goto("/pessoas");
  const card = page.getByRole("figure").filter({ has: page.getByRole("heading", { name: "Dieter Rams" }) });
  await card.getByRole("button", { name: "Adicionar aos favoritos" }).click();
  await expect(card.getByRole("button", { name: "Remover dos favoritos" })).toBeVisible();

  await page.goto("/estilos/minimalismo");
  const related = page.getByRole("figure").filter({ has: page.getByRole("heading", { name: "Dieter Rams" }) });
  await expect(related.getByRole("button", { name: "Remover dos favoritos" })).toBeVisible();

  await page.getByRole("button", { name: /Ampliar/ }).first().click();
  const dialog = page.getByRole("dialog", { name: /Composição/ });
  await dialog.getByRole("button", { name: "Adicionar aos favoritos" }).click();
  await expect(dialog.getByRole("button", { name: "Remover dos favoritos" })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /Ampliar/ }).first().click();
  const reopened = page.getByRole("dialog", { name: /Composição/ });
  await expect(reopened.getByRole("button", { name: "Remover dos favoritos" })).toBeVisible();
  await expect(reopened.getByRole("link", { name: "Minimalismo" })).toBeVisible();
});

test("paginação: página 2, vazia além da última e navegação", async ({ page, context, request }) => {
  const api = await createApiSession(request);
  const prefix = uniqueName("Paginado");
  for (let index = 0; index < 25; index++) {
    await api.post("/styles", { name: `${prefix} ${String(index).padStart(2, "0")}` });
  }
  await context.addCookies([{ name: "prisma_token", value: api.token, url: "http://localhost:3000" }]);

  await page.goto(`/estilos?q=${encodeURIComponent(prefix)}`);
  await expect(page.getByText("Página 1 de 2")).toBeVisible();
  await expect(page.getByRole("heading", { name: `${prefix} 00` })).toBeVisible();
  await expect(page.getByRole("heading", { name: `${prefix} 24` })).toHaveCount(0);

  await page.getByRole("link", { name: "Próxima →" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByText("Página 2 de 2")).toBeVisible();
  await expect(page.getByRole("heading", { name: `${prefix} 24` })).toBeVisible();

  await page.goto(`/estilos?q=${encodeURIComponent(prefix)}&page=99`);
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByText("Página 2 de 2")).toBeVisible();
});

test("início apresenta o destaque e a porta de entrada para cada dimensão", async ({ page }) => {
  await register(page);
  await expect(page.getByRole("heading", { level: 1, name: "Uma coisa → várias dimensões." })).toBeVisible();
  const main = page.getByRole("main");
  for (const dimension of ["Estilos", "Pessoas", "Estratégias", "Referências"]) {
    await expect(main.getByRole("link", { name: new RegExp(`^${dimension}\\s*\\d+`) })).toBeVisible();
  }
  await expect(main.getByText("Em destaque")).toBeVisible();
  await main.getByRole("link", { name: /^Pessoas\s*\d+/ }).click();
  await expect(page).toHaveURL(/\/pessoas$/);
});

test("barra lateral organiza o arquivo em grupos e marca a página atual", async ({ page }) => {
  await register(page);
  await page.goto("/estilos");
  const nav = page.getByRole("navigation", { name: "Principal" });
  for (const group of ["Arquivo", "Dimensões", "Coleções", "Vocabulário"]) {
    await expect(nav.getByText(group, { exact: true })).toBeVisible();
  }
  await expect(nav.getByRole("link", { name: "Estilos" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Pessoas" })).not.toHaveAttribute("aria-current", "page");

  await nav.getByRole("link", { name: "Favoritos" }).click();
  await expect(page).toHaveURL(/\/favoritos$/);
  await expect(page.getByRole("heading", { level: 1, name: "Favoritos" })).toBeVisible();
});

test("detalhe do estilo é uma página contínua com índice de dimensões e estilos relacionados", async ({ page }) => {
  await register(page);
  await page.goto("/estilos/bauhaus");
  for (const title of ["História", "Características", "Influências", "Pessoas", "Estratégias", "Referências", "Estilos relacionados"]) {
    await expect(page.getByRole("heading", { level: 2, name: new RegExp(`^${title}`) })).toBeVisible();
  }
  await expect(page.getByRole("figure").filter({ has: page.getByRole("heading", { name: "Minimalismo" }) })).toBeVisible();

  const index = page.getByRole("navigation", { name: "Dimensões deste conteúdo" });
  await index.getByRole("link", { name: /^Estratégias/ }).click();
  await expect(page).toHaveURL(/#estrategias$/);
  await expect(page.getByRole("heading", { level: 2, name: /^Estratégias/ })).toBeInViewport();
  await expect(index.getByRole("link", { name: /^Estratégias/ })).toHaveAttribute("aria-current", "location");
});

test("ciclo de vida de uma coleção: criar, renomear e excluir", async ({ page }) => {
  await register(page);
  const name = uniqueName("Coleção");
  const renamed = `${name} renomeada`;

  await page.goto("/grupos");
  await page.getByRole("button", { name: "Nova coleção" }).click();
  const create = page.getByRole("dialog", { name: "Nova coleção" });
  await create.getByLabel("Nome da coleção").fill(name);
  await create.getByRole("button", { name: "Criar coleção" }).click();
  await expect(create).toBeHidden();
  await page.getByRole("main").getByRole("link", { name: new RegExp(name) }).click();
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();

  await chooseMenuAction(page, "Renomear");
  const rename = page.getByRole("dialog", { name: "Renomear coleção" });
  await rename.getByLabel("Nome da coleção").fill(renamed);
  await rename.getByRole("button", { name: "Renomear" }).click();
  await expect(rename).toBeHidden();
  await expect(page.getByRole("heading", { level: 1, name: renamed })).toBeVisible();

  await chooseMenuAction(page, "Excluir");
  await page.getByRole("dialog", { name: `Excluir "${renamed}"?` }).getByRole("button", { name: "Excluir" }).click();
  await expect(page).toHaveURL(/\/grupos$/);
  await expect(page.getByText(renamed)).toHaveCount(0);
});

test("coleção mostra mosaico com as imagens guardadas", async ({ page }) => {
  await register(page);
  await page.goto("/estilos/bauhaus");
  await page.getByRole("button", { name: "Adicionar aos favoritos" }).first().click();
  await expect(page.getByRole("button", { name: "Remover dos favoritos" }).first()).toBeVisible();

  await page.goto("/grupos");
  const cover = page.getByRole("main").getByRole("link", { name: /Favoritos/ });
  await expect(cover.getByText("1 item")).toBeVisible();
  await expect(cover.locator("img")).toHaveCount(1);
});

test("formulário mostra pré-visualização da imagem escolhida", async ({ page }) => {
  await register(page);
  await page.goto("/estilos/novo");
  await expect(page.getByText("Sem imagem")).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({
    name: "capa.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"),
  });
  await expect(page.locator('img[alt="Pré-visualização da imagem"]')).toHaveAttribute("src", /^blob:/);
});
