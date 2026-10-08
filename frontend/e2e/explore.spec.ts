import { expect, test } from "@playwright/test";
import { register } from "./helpers";

test("explorar mostra todos os tipos de conteúdo em seções, diferente da lista de estilos", async ({ page }) => {
  await register(page);
  await page.goto("/explorar");
  await expect(page.getByRole("heading", { name: /^Estilos \(\d+\)/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Pessoas \(\d+\)/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Estratégias \(\d+\)/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Imagens \(\d+\)/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver todos →" }).first()).toBeVisible();

  await page.goto("/estilos");
  await expect(page.getByRole("heading", { name: /^Pessoas/ })).toHaveCount(0);
});

test("explorar filtra por busca e por tag", async ({ page }) => {
  await register(page);
  await page.goto("/explorar?q=Bauhaus");
  await expect(page.getByRole("heading", { name: /^Estilos \(1\)/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Pessoas \(1\)/ })).toBeVisible();

  await page.goto("/explorar");
  await page.getByRole("link", { name: "Urbano" }).click();
  await expect(page).toHaveURL(/tag=urbano/);
  await expect(page.getByRole("heading", { name: /^Estilos \(1\)/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Imagens/ })).toHaveCount(0);

  await page.goto("/explorar?q=zzzzzzz");
  await expect(page.getByText("Nada encontrado com esses filtros.")).toBeVisible();
});
