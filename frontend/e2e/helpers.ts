import { expect, type APIRequestContext, type Locator, type Page } from "@playwright/test";

export const apiUrl = process.env.E2E_API_URL ?? "http://localhost:8000/api";

export const uniqueName = (prefix: string) => `${prefix} ${Date.now()}${Math.floor(Math.random() * 1000)}`;

export async function register(page: Page) {
  const email = `e2e-${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;
  await page.goto("/login");
  await page.getByRole("tab", { name: "Registrar" }).click();
  await page.getByLabel("Nome").fill("Teste E2E");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill("senha-segura-123");
  await page.getByLabel("Confirmar senha").fill("senha-segura-123");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL("/");
  return email;
}

export async function loginAsDemo(page: Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("demo@prisma.test");
  await page.getByLabel("Senha").fill("password");
  await page.getByRole("button", { name: "Entrar", exact: true }).last().click();
  await expect(page).toHaveURL("/");
}

export async function createApiSession(request: APIRequestContext) {
  const response = await request.post(`${apiUrl}/auth/register`, {
    headers: { Accept: "application/json" },
    data: {
      name: "Sessão API",
      email: `api-${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`,
      password: "senha-segura-123",
      password_confirmation: "senha-segura-123",
    },
  });
  const { token } = await response.json();
  return {
    token,
    post: (path: string, data: unknown) =>
      request.post(`${apiUrl}${path}`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, data }),
  };
}

export async function chooseMenuAction(page: Page, action: string, scope: Page | Locator = page) {
  await scope.getByRole("button", { name: "Mais ações" }).click();
  await page.getByRole("menuitem", { name: action }).click();
}
