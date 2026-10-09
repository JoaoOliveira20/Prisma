import { expect, test } from "@playwright/test";
import { chooseMenuAction, createApiSession, loginAsDemo, register, resetDemoFavorites, signInAs, uniqueName } from "./helpers";

test("criar estilo, favoritar, agrupar, editar e excluir", async ({ page }) => {
  await register(page);
  const name = uniqueName("Estilo E2E");

  await page.goto("/tags");
  await page.getByLabel("Nova tag").fill("Design");
  await page.getByRole("button", { name: "Criar tag" }).click();
  await expect(page.getByText("Tag criada.")).toBeVisible();

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

test("criar nome vazio é recusado", async ({ page }) => {
  await register(page);
  await page.goto("/estilos/novo");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL(/\/estilos\/novo$/);
  await expect(page.getByRole("alert").first()).toBeVisible();
});

test("conta nova começa vazia e não enxerga os dados de outra conta", async ({ page }) => {
  await register(page);
  await page.goto("/estilos");
  await expect(page.getByText("Ainda não há estilos cadastrados.")).toBeVisible();
  await page.goto("/pessoas");
  await expect(page.getByText("Ainda não há pessoas cadastradas.")).toBeVisible();
  await page.goto("/estrategias");
  await expect(page.getByText("Ainda não há estratégias cadastradas.")).toBeVisible();
  await page.goto("/referencias");
  await expect(page.getByRole("heading", { name: "O repertório começa com uma imagem." })).toBeVisible();
  await page.goto("/tags");
  await expect(page.getByText("Você ainda não criou nenhuma tag.")).toBeVisible();
  await page.goto("/explorar");
  await expect(page.getByText("Nada encontrado ainda.")).toBeVisible();

  await page.goto("/estilos/bauhaus");
  await expect(page.getByRole("heading", { name: "Isto não está no arquivo." })).toBeVisible();
  await page.goto("/estilos/bauhaus/referencias");
  await expect(page.getByRole("heading", { name: "Isto não está no arquivo." })).toBeVisible();

  await page.goto("/explorar?q=Bauhaus");
  await expect(page.getByText("Nada encontrado com esses filtros.")).toBeVisible();
});

test("duas contas podem ter estilos e tags com o mesmo nome sem se enxergar", async ({ page }) => {
  const first = await createApiSession(page.request);
  await first.post("/tags", { name: "Arte" });
  const firstStyle = (await (await first.post("/styles", { name: "Isolado", tags: ["arte"] })).json()).data;

  const second = await createApiSession(page.request);
  await second.post("/tags", { name: "Arte" });
  const secondStyle = (await (await second.post("/styles", { name: "Isolado", tags: ["arte"] })).json()).data;
  expect(firstStyle.slug).toBe("isolado");
  expect(secondStyle.slug).toBe("isolado");

  await signInAs(page, first);
  await page.goto("/estilos?q=Isolado");
  await expect(page.getByRole("heading", { name: "Isolado" })).toHaveCount(1);
  await page.goto("/tags");
  await expect(page.getByRole("heading", { name: "Arte", exact: true })).toHaveCount(1);
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
  await loginAsDemo(page);
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
  await resetDemoFavorites(page.request);
  await loginAsDemo(page);
  await page.goto("/pessoas?q=Dieter");
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
  await page.waitForLoadState("networkidle");
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
  await loginAsDemo(page);
  await expect(page.getByRole("heading", { level: 1, name: "Uma coisa → várias dimensões." })).toBeVisible();
  const main = page.getByRole("main");
  for (const dimension of ["Estilos", "Pessoas", "Estratégias", "Referências"]) {
    await expect(main.getByRole("link", { name: new RegExp(`^${dimension}\\s*\\d+`) })).toBeVisible();
  }
  await expect(main.getByText("Em destaque")).toBeVisible();
  await main.getByRole("link", { name: /^Pessoas\s*\d+/ }).click();
  await expect(page).toHaveURL(/\/pessoas$/);
});

test("barra lateral organiza o mapa em três blocos e marca a página atual e a seção de origem", async ({ page }) => {
  await loginAsDemo(page);
  await page.goto("/estilos");
  const nav = page.getByRole("navigation", { name: "Principal" });
  for (const group of ["Dimensões", "Minha coleção"]) {
    await expect(nav.getByText(group, { exact: true })).toBeVisible();
  }
  await expect(nav.getByText("Vocabulário", { exact: true })).toHaveCount(0);
  for (const link of ["Início", "Explorar", "Estilos", "Pessoas", "Estratégias", "Referências", "Tags", "Favoritos", "Grupos"]) {
    await expect(nav.getByRole("link", { name: link, exact: true })).toBeVisible();
  }
  await expect(nav.getByRole("link", { name: "Estilos" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Pessoas" })).not.toHaveAttribute("aria-current", "page");

  await page.goto("/estilos/bauhaus/referencias");
  await expect(nav.getByRole("link", { name: "Estilos" })).toHaveAttribute("aria-current", "true");

  await nav.getByRole("link", { name: "Favoritos" }).click();
  await expect(page).toHaveURL(/\/favoritos$/);
  await expect(page.getByRole("heading", { level: 1, name: "Favoritos" })).toBeVisible();
});

test("barra lateral minimizada lembra a escolha, mostra dica ao focar e expande de novo", async ({ page }) => {
  await register(page);
  await page.goto("/estilos");
  const aside = page.locator("aside#sidebar");
  const widthOf = async () => (await aside.boundingBox())!.width;
  expect(await widthOf()).toBeGreaterThan(240);

  await page.getByRole("button", { name: "Minimizar menu" }).click();
  await expect.poll(widthOf).toBeLessThan(80);
  await page.reload();
  expect(await widthOf()).toBeLessThan(80);

  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Pessoas" }).hover();
  await expect(page.getByText("Pessoas", { exact: true }).and(page.locator("[aria-hidden='true']"))).toBeVisible();
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Pessoas" }).click();
  await expect(page).toHaveURL(/\/pessoas$/);
  expect(await widthOf()).toBeLessThan(80);

  await page.getByRole("button", { name: "Expandir menu" }).click();
  await expect.poll(widthOf).toBeGreaterThan(240);
  await page.reload();
  expect(await widthOf()).toBeGreaterThan(240);
});

test("detalhe do estilo reúne o conteúdo editorial em Sobre e abre as demais dimensões como portais", async ({ page }) => {
  await loginAsDemo(page);
  await page.goto("/estilos/bauhaus");
  for (const title of ["Sobre o estilo", "Pessoas", "Estratégias", "Referências", "Estilos relacionados"]) {
    await expect(page.getByRole("heading", { level: 2, name: new RegExp(`^${title}`) })).toBeVisible();
  }
  for (const title of ["História", "Características", "Influências"]) {
    await expect(page.getByRole("heading", { level: 3, name: title })).toBeVisible();
  }
  await expect(page.getByRole("figure").filter({ has: page.getByRole("heading", { name: "Minimalismo" }) })).toBeVisible();

  const index = page.getByRole("navigation", { name: "Dimensões deste conteúdo" });
  await expect(index.getByRole("link", { name: /^História/ })).toHaveCount(0);
  await index.getByRole("link", { name: /^Estratégias/ }).click();
  await expect(page).toHaveURL(/#estrategias$/);
  await expect(page.getByRole("heading", { level: 2, name: /^Estratégias/ })).toBeInViewport();
  await expect(index.getByRole("link", { name: /^Estratégias/ })).toHaveAttribute("aria-current", "location");
});

test("o estilo mostra prévias e leva a listas filtradas quando há mais conteúdo", async ({ page }) => {
  const api = await createApiSession(page.request);
  const name = uniqueName("Estilo grande");
  const created = await api.post("/styles", { name, summary: "Estilo com muito conteúdo." });
  const { slug } = (await created.json()).data;
  for (let index = 1; index <= 9; index++) {
    await api.post("/references", { title: `Referência ${index}`, image_url: "https://picsum.photos/seed/prisma/400/300", links: [{ type: "style", slug }] });
  }
  for (let index = 1; index <= 7; index++) {
    await api.post("/people", { name: `Pessoa ${index} ${name}`, styles: [slug] });
  }

  await signInAs(page, api);
  await page.goto(`/estilos/${slug}`);
  const gallery = page.getByRole("list").filter({ has: page.getByRole("button", { name: /^Ampliar/ }) });
  await expect(gallery.getByRole("listitem")).toHaveCount(8);

  await page.getByRole("link", { name: "Ver todas as 9 referências" }).click();
  await expect(page).toHaveURL(new RegExp(`/estilos/${slug}/referencias$`));
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  await expect(page.getByText("9 referências", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sobre o estilo" })).toHaveCount(0);
  await page.getByRole("navigation", { name: "Trilha" }).getByRole("link", { name }).click();
  await expect(page).toHaveURL(new RegExp(`/estilos/${slug}$`));
  await page.getByRole("navigation", { name: "Dimensões deste conteúdo" }).getByRole("link", { name: /^Referências/ }).click();
  await expect(page).toHaveURL(new RegExp(`/estilos/${slug}/referencias$`));

  await page.goto(`/estilos/${slug}`);
  await page.getByRole("link", { name: "Ver as 7 pessoas" }).click();
  await expect(page).toHaveURL(new RegExp(`/pessoas\\?style=${slug}`));
  await expect(page.getByText("Filtrando por estilo")).toBeVisible();
  await expect(page.getByText("7 registros")).toBeVisible();
  await page.getByRole("link", { name: "Abrir estilo" }).click();
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
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
  const name = uniqueName("Estilo Mosaico");
  await page.goto("/estilos/novo");
  await page.getByLabel("Nome").fill(name);
  await page.locator('input[type="file"]').setInputFiles({ name: "pixel.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64") });
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  await page.getByRole("button", { name: "Adicionar aos favoritos" }).first().click();
  await expect(page.getByRole("button", { name: "Remover dos favoritos" }).first()).toBeVisible();
  await page.waitForLoadState("networkidle");

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
