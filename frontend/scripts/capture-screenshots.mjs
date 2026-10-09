import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const apiUrl = process.env.API_URL ?? "http://localhost:8000/api";
const outputDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../docs/screenshots");
const credentials = { email: "demo@prisma.test", password: "password" };

mkdirSync(outputDir, { recursive: true });

async function api(token, method, route, data) {
  const response = await fetch(`${apiUrl}${route}`, {
    method,
    headers: { Accept: "application/json", "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.status === 204 ? null : response.json();
}

async function prepareCollections() {
  const { token } = await api(null, "POST", "/auth/login", credentials);
  for (const [type, slug] of [["style", "bauhaus"], ["style", "minimalismo"], ["person", "dieter-rams"], ["strategy", "sistemas-de-grade"]]) {
    await api(token, "POST", `/favorites/${type}/${slug}`);
  }
  const references = await api(token, "GET", "/images?kind=reference&per_page=3");
  const groupName = "Para estudar depois";
  const groups = await api(token, "GET", "/groups");
  const group = groups.data.find((item) => item.name === groupName) ?? (await api(token, "POST", "/groups", { name: groupName })).data;
  for (const reference of references.data) {
    await api(token, "POST", `/groups/${group.id}/items`, { type: "reference", slug: String(reference.id) });
  }
  await api(token, "POST", `/favorites/reference/${references.data[0].id}`);
  return references.data;
}

async function login(page) {
  await page.goto(`${baseUrl}/login`);
  await page.getByLabel("E-mail").fill(credentials.email);
  await page.getByLabel("Senha").fill(credentials.password);
  await page.getByRole("button", { name: "Entrar", exact: true }).last().click();
  await page.waitForURL(`${baseUrl}/`);
}

async function settle(page) {
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
}

async function shoot(page, name, route, options = {}) {
  const viewport = page.viewportSize();
  if (options.height) await page.setViewportSize({ width: viewport.width, height: options.height });
  await page.goto(`${baseUrl}${route}`);
  await settle(page);
  if (options.before) await options.before(page);
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), clip: options.clip });
  if (options.height) await page.setViewportSize(viewport);
  console.log(`ok ${name}`);
}

const references = await prepareCollections();
const browser = await chromium.launch();
const options = { reducedMotion: "reduce" };

const guest = await browser.newPage({ viewport: { width: 1440, height: 1000 }, ...options });
await shoot(guest, "login", "/login", { before: (page) => page.waitForTimeout(800) });
await guest.close();

const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, ...options });
await login(desktop);
await shoot(desktop, "home", "/");
await shoot(desktop, "styles", "/estilos");
await shoot(desktop, "style-detail", "/estilos/bauhaus", { height: 1150 });
await shoot(desktop, "references-library", "/referencias", { height: 1300 });
await shoot(desktop, "reference-details", `/referencias/${references[0].id}`, { height: 1300 });
await shoot(desktop, "strategies", "/estrategias");
await shoot(desktop, "collections", "/grupos");
await shoot(desktop, "search-filters", "/pessoas", {
  before: async (page) => {
    await page.getByRole("group", { name: "Filtrar por tag" }).getByRole("button", { name: "Design", exact: true }).click();
    await page.waitForURL(/tag=design/);
    await page.getByRole("searchbox").fill("gráfic");
    await page.waitForURL(/q=gr/);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
  },
});
await shoot(desktop, "command-palette", "/estilos/bauhaus", {
  before: async (page) => {
    await page.keyboard.press("Control+k");
    await page.getByRole("combobox").fill("bau");
    await page.getByRole("option").first().waitFor();
    await page.waitForTimeout(400);
  },
});
await desktop.close();

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, ...options });
const mobilePage = await mobile.newPage();
await login(mobilePage);
await shoot(mobilePage, "mobile-library", "/referencias");
await shoot(mobilePage, "mobile-menu", "/estilos/bauhaus", {
  before: async (page) => {
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.waitForTimeout(600);
  },
});
await browser.close();
