import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { randomUUID, randomBytes, createHmac } from "node:crypto";

const db = new PrismaClient();
const run = randomUUID();
const email = `ui-user-${run}@example.invalid`;
const adminEmail = `ui-admin-${run}@example.invalid`;
const password = randomBytes(24).toString("base64url");
let userId: string;
test.beforeAll(async () => {
  const passwordHash = await hash(password, 12);
  const user = await db.user.create({ data: { name: "Alex Morgan", email, passwordHash } });
  userId = user.id;
  await db.user.create({
    data: { name: "Workspace Admin", email: adminEmail, passwordHash, role: "ADMIN" },
  });
});
test.afterAll(async () => {
  await db.user.deleteMany({ where: { email: { in: [email, adminEmail] } } });
  if (process.env.AUTH_SECRET) {
    const keys = [email, adminEmail].map((value) =>
      createHmac("sha256", process.env.AUTH_SECRET!).update(`login:${value}`).digest("hex"),
    );
    await db.rateLimit.deleteMany({ where: { key: { in: keys } } });
  }
  await db.$disconnect();
});
async function login(page: Page, account: string, modal = false) {
  await page.goto(modal ? "/" : "/login");
  if (modal) await page.getByRole("button", { name: "Log in", exact: true }).click();
  await page.getByLabel("Email address").fill(account);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(account === adminEmail ? /\/admin$/ : /\/dashboard$/);
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
}

test("user workspace: empty state, CRUD, pipeline, responsive layouts and dark mode", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await login(page, email, true);
  await expect(page.getByRole("heading", { name: "Application Pipeline" })).toBeVisible();
  const pipeline = page.getByRole("region", { name: "Application Pipeline", exact: true });
  await expect(pipeline.getByRole("link")).toHaveCount(4);
  for (const status of ["SAVED", "APPLIED", "INTERVIEW", "TECHNICAL_EXAM"]) {
    await expect(pipeline.locator(`a[href="/applications?status=${status}"]`)).toHaveCount(1);
  }
  const outcomes = page.getByRole("region", { name: "Application Outcomes" });
  await expect(outcomes.getByRole("link")).toHaveCount(2);
  await expect(outcomes.locator('a[href="/applications?status=OFFER"]')).toHaveCount(1);
  await expect(outcomes.locator('a[href="/applications?status=REJECTED"]')).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Progress Insights" })).toBeVisible();
  await expect(page.getByText("Your story is just getting started")).toBeVisible();
  await expect(page.locator(".recharts-wrapper")).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Overview", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Admin overview" }),
  ).toHaveCount(0);
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("empty-desktop.png"), fullPage: true });

  await page.getByRole("button", { name: "Add application", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Add application", exact: true }).click();
  await expect(dialog.getByText("Enter a company name.")).toBeVisible();
  await dialog.getByLabel("Company", { exact: true }).fill("Northstar");
  await dialog.getByLabel("Position", { exact: true }).fill("Product Engineer");
  await dialog.getByLabel("Location", { exact: true }).fill("Remote");
  await dialog.getByLabel("Job URL", { exact: true }).fill("https://example.com/careers");
  await dialog.getByLabel("Status", { exact: true }).selectOption("INTERVIEW");
  await dialog.getByLabel("Notes (optional)").fill("Preparing for the team interview.");
  await dialog.getByRole("button", { name: "Add application", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("table").getByText("Northstar", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Edit Product Engineer at Northstar" })
    .filter({ visible: true })
    .click();
  await dialog.getByLabel("Status", { exact: true }).selectOption("OFFER");
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("table").getByText("Offer", { exact: true })).toBeVisible();

  const statuses = ["SAVED", "APPLIED", "INTERVIEW", "TECHNICAL_EXAM", "REJECTED"] as const;
  await db.application.createMany({
    data: statuses.map((status, index) => ({
      userId,
      company: ["Linear", "Vercel", "Notion", "Figma", "Stripe"][index],
      position: [
        "Frontend Engineer",
        "Design Engineer",
        "Software Engineer",
        "Full-stack Engineer",
        "Product Engineer",
      ][index],
      location: index % 2 ? "Singapore" : "Remote",
      jobUrl: "https://example.com/job",
      status,
      appliedDate: new Date("2026-09-05T00:00:00Z"),
    })),
  });
  await page.reload();
  await expect(page.locator(".recharts-wrapper")).toHaveCount(1);
  await page.screenshot({ path: info.outputPath("populated-desktop.png"), fullPage: true });
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 950 });
    await noOverflow(page);
    await page.screenshot({ path: info.outputPath(`user-${width}.png`), fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Toggle light and dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.screenshot({ path: info.outputPath("user-mobile-dark.png"), fullPage: true });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Applications", exact: true }).click();
  await expect(page).toHaveURL(/\/applications$/);
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.getByLabel("Search applications", { exact: true }).fill("Northstar");
  await expect(page).toHaveURL(/q=Northstar/);
  await page.getByRole("button", { name: "Delete Product Engineer at Northstar" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Delete application", exact: true })
    .click();
  await expect(page.getByRole("alertdialog")).toBeHidden();
  await expect(page.getByRole("heading", { name: "No matching applications" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("admin uses only admin navigation and personal URLs redirect", async ({ page }, info) => {
  await login(page, adminEmail);
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav.getByRole("link", { name: "Admin overview", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Users", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "All applications", exact: true })).toBeVisible();
  await expect(nav.locator('a[href="/dashboard"], a[href="/applications"]')).toHaveCount(0);
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("admin-desktop.png"), fullPage: true });
  await expect(page.getByText("Application statuses across every account.")).toBeVisible();
  await page.getByRole("button", { name: "Toggle light and dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.screenshot({ path: info.outputPath("admin-desktop-dark.png"), fullPage: true });
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/applications");
  await expect(page).toHaveURL(/\/admin$/);
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.screenshot({ path: info.outputPath("admin-mobile-nav.png"), fullPage: true });
  await page.getByRole("dialog").getByRole("link", { name: "Users", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/users$/);
  await page.getByLabel("Search users by name or email").fill(email);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("table").getByText(email, { exact: true })).toBeVisible();
  await noOverflow(page);
});

test("regular users cannot enter the admin workspace", async ({ page }) => {
  await login(page, email);
  for (const path of ["/admin", "/admin/users", "/admin/applications"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/dashboard$/);
  }
});
