import { expect, test } from "@playwright/test";
import { loginAsDemo } from "./helpers";

test("explorar mostra todos os tipos de conteúdo em seções, diferente da lista de estilos", async ({ page }) => {
  await loginAsDemo(page);
  await page.goto("/explorar");
  for (const title of ["Estilos", "Imagens", "Pessoas", "Estratégias"]) {
    await expect(page.getByRole("heading", { level: 2, name: new RegExp(`^${title}\\s*\\d+`) })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Ver todos →" }).first()).toBeVisible();

  await page.goto("/estilos");
  await expect(page.getByRole("heading", { level: 2, name: /^Pessoas/ })).toHaveCount(0);
});

test("explorar filtra por busca e por tag", async ({ page }) => {
  await loginAsDemo(page);
  await page.goto("/explorar?q=Bauhaus");
  await expect(page.getByRole("heading", { level: 2, name: /^Estilos\s*1$/ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /^Pessoas\s*1$/ })).toBeVisible();

  await page.goto("/explorar");
  await page.getByRole("navigation", { name: "Filtrar por tag" }).getByRole("link", { name: "Urbano" }).click();
  await expect(page).toHaveURL(/tag=urbano/);
  await expect(page.getByRole("heading", { level: 2, name: /^Estilos\s*1$/ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /^Imagens/ })).toHaveCount(0);

  await page.goto("/explorar?q=zzzzzzz");
  await expect(page.getByText("Nada encontrado com esses filtros.")).toBeVisible();
});
