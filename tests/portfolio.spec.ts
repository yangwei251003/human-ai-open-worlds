import { test, expect } from "@playwright/test";
const routes = ["", "projects/", "honors/", "resume/", "journal/", "cinema/", "gallery/"];
for (const width of [1440, 390]) {
  test(`seven exported worlds at ${width}px`, async ({ page, baseURL }) => {
    await page.setViewportSize({width, height: 960});
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("response", r => { if(r.status()>=400) errors.push(`${r.status()} ${r.url()}`); });
    for (const route of routes) {
      const response = await page.goto(`${baseURL}${route}`, {waitUntil: "networkidle"});
      expect(response?.status()).toBe(200);
      await expect(page.locator("main h1")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
      const external = await page.evaluate(() => performance.getEntriesByType("resource").map(r=>r.name).filter(u=>u.startsWith("http") && new URL(u).origin!==location.origin));
      expect(external).toEqual([]);
      expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");
    }
    expect(errors).toEqual([]);
  });
}
test("navigation, project filtering and media dialogs retain the Pages prefix", async ({ page, baseURL }) => {
  const prefix = new URL(baseURL!).pathname;
  await page.goto(baseURL!);
  await page.getByRole("button", {name: "WORLD INDEX"}).click();
  await expect(page.getByRole("dialog", {name:"世界索引"})).toBeVisible();
  await page.getByRole("dialog", {name:"世界索引"}).getByRole("link").filter({hasText:"AI 项目"}).click();
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${prefix}projects/`));
  await page.getByRole("group",{name:"按项目类别筛选"}).getByRole("button",{name:"Skill",exact:true}).click();
  await expect(page.getByRole("button",{name:"Skill",exact:true})).toHaveAttribute("aria-pressed","true");
  await page.goto(`${baseURL}honors/`);
  await page.getByRole("button",{name:/聚光查看/}).first().click();
  await expect(page.locator("dialog[open]")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await page.goto(`${baseURL}cinema/`);
  await page.getByRole("button",{name:"让海报变成银幕",exact:true}).click();
  await expect(page.locator("dialog[open]")).toBeVisible();
  await expect(page.locator("dialog[open] video")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.goto(`${baseURL}gallery/`);
  await page.getByRole("button",{name:"打开灯箱"}).click();
  await expect(page.locator("dialog[open]")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  expect(new URL(page.url()).pathname).toContain(prefix);
});
