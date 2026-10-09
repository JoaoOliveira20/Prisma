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
  await expect(page.getByRole("heading", { level: 1, name: "Uma coisa → várias dimensões." })).toBeVisible();
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

test("tela de login: título principal, mostrar senha e alternância com o link do rodapé", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { level: 1, name: "Bem-vindo de volta" })).toBeVisible();

  const password = page.getByLabel("Senha");
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Mostrar" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Ocultar" }).click();
  await expect(password).toHaveAttribute("type", "password");

  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Crie sua conta" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Registrar" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByLabel("Confirmar senha")).toBeVisible();

  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Bem-vindo de volta" })).toBeVisible();
});

test("recuperação de senha e login com Google aparecem como indisponíveis", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /Esqueceu a senha/ })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Continuar com Google/ })).toBeDisabled();
  await expect(page.getByText("em breve").first()).toBeVisible();
});

test("foco de teclado no login usa o anel claro e a ordem de tabulação é lógica", async ({ page }) => {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.getByRole("tab", { name: "Entrar" }).focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("E-mail")).toBeFocused();
  const outline = await page.getByLabel("E-mail").evaluate((element) => getComputedStyle(element).outlineColor);
  expect(outline).toBe("rgb(236, 235, 230)");

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Senha")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Mostrar" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Entrar", exact: true })).toBeFocused();
});

test.describe("login com movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });

  test("o formulário aparece sem depender de animação", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { level: 1, name: "Bem-vindo de volta" })).toBeVisible();
    const opacity = await page.getByRole("heading", { level: 1 }).evaluate((element) => getComputedStyle(element.parentElement!).opacity);
    expect(opacity).toBe("1");
  });
});

test("favicon está disponível sem login e referenciado no head", async ({ page, request }) => {
  for (const [path, type] of [["/icon.svg", "image/svg+xml"], ["/favicon.ico", "image/x-icon"], ["/apple-icon.png", "image/png"]]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"]).toContain(type);
  }

  await page.goto("/login");
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveCount(1);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
});

test("sessão dura 1 dia e é renovada no máximo uma vez por hora de uso", async ({ page, context }) => {
  await register(page);
  const cookie = async (name: string) => (await context.cookies()).find((item) => item.name === name)!;

  const token = await cookie("prisma_token");
  const secondsLeft = token.expires - Date.now() / 1000;
  expect(secondsLeft).toBeGreaterThan(86400 - 300);
  expect(secondsLeft).toBeLessThanOrEqual(86400 + 5);

  const marker = await cookie("prisma_session_refreshed_at");
  await page.goto("/estilos");
  await page.goto("/pessoas");
  await page.getByRole("link", { name: "Estratégias", exact: true }).click();
  await expect(page).toHaveURL(/\/estrategias$/);
  expect((await cookie("prisma_session_refreshed_at")).value).toBe(marker.value);
  expect((await cookie("prisma_token")).value).toBe(token.value);

  await context.clearCookies({ name: "prisma_session_refreshed_at" });
  await page.waitForTimeout(1100);
  await page.goto("/estilos");
  const renewedMarker = await cookie("prisma_session_refreshed_at");
  const renewedToken = await cookie("prisma_token");
  expect(Number(renewedMarker.value)).toBeGreaterThan(Number(marker.value));
  expect(renewedToken.value).toBe(token.value);
  expect(renewedToken.expires).toBeGreaterThan(token.expires);
  await expect(page.getByRole("heading", { level: 1, name: "Estilos" })).toBeVisible();
});

test("token vencido no servidor leva ao login e limpa a sessão", async ({ page, context, request }) => {
  const login = await request.post(`${process.env.E2E_API_URL ?? "http://localhost:8000/api"}/auth/register`, {
    headers: { Accept: "application/json" },
    data: { name: "Sessão curta", email: `short-${Date.now()}@example.com`, password: "senha-segura-123", password_confirmation: "senha-segura-123" },
  });
  const { token } = await login.json();
  await context.addCookies([{ name: "prisma_token", value: `${token}-adulterado`, url: "http://localhost:3000" }]);
  await page.goto("/estilos");
  await expect(page).toHaveURL(/\/login$/);
  expect((await context.cookies()).some((item) => item.name === "prisma_token")).toBe(false);
});
