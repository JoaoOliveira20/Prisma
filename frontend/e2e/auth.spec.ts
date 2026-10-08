import { expect, test } from "@playwright/test";
import { loginAsDemo, register } from "./helpers";

test("rotas protegidas redirecionam para o login", async ({ page }) => {
  await page.goto("/estilos");
  await expect(page).toHaveURL(/\/login$/);
});

test("login com senha errada mostra erro em português", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("demo@prisma.test");
  await page.getByLabel("Senha").fill("errada");
  await page.getByRole("button", { name: "Entrar", exact: true }).last().click();
  await expect(page.getByRole("alert").filter({ hasText: "E-mail ou senha incorretos." })).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel("E-mail")).toHaveValue("demo@prisma.test");
});

test("cadastro valida confirmação de senha", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("tab", { name: "Registrar" }).click();
  await page.getByLabel("Nome").fill("Fulano");
  await page.getByLabel("E-mail").fill(`x${Date.now()}@example.com`);
  await page.getByLabel("Senha", { exact: true }).fill("senha-segura-123");
  await page.getByLabel("Confirmar senha").fill("diferente-123");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByText("A confirmação de senha não confere.")).toBeVisible();
});

test("cadastro, sessão persistente e logout", async ({ page }) => {
  await register(page);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Início" })).toBeVisible();
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/estilos");
  await expect(page).toHaveURL(/\/login$/);
});

test("login de demonstração leva ao início e /login redireciona quando logado", async ({ page }) => {
  await loginAsDemo(page);
  await page.goto("/login");
  await expect(page).toHaveURL("/");
});

test("cookie inválido volta ao login sem laço de redirecionamento", async ({ page, context }) => {
  await context.addCookies([{ name: "prisma_token", value: "token-invalido", url: "http://localhost:3000" }]);
  await page.goto("/estilos");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Entrar", exact: true }).last()).toBeVisible();
});

test("e-mail já cadastrado é recusado", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("tab", { name: "Registrar" }).click();
  await page.getByLabel("Nome").fill("Duplicado");
  await page.getByLabel("E-mail").fill("demo@prisma.test");
  await page.getByLabel("Senha", { exact: true }).fill("senha-segura-123");
  await page.getByLabel("Confirmar senha").fill("senha-segura-123");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByText("O valor de e-mail já está em uso.")).toBeVisible();
  await expect(page.getByLabel("Nome")).toHaveValue("Duplicado");
});

test("cabeçalhos de segurança estão presentes", async ({ request }) => {
  const response = await request.get("/login");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
});
