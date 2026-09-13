import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

// Runs against a local production server and only removes its own random fixtures.
const base = process.env.TEST_APP_URL ?? "http://localhost:3000";
assert(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Use a local test server.");
const manifest = JSON.parse(await readFile(".next/server/server-reference-manifest.json", "utf8"));
const actionIds = Object.fromEntries(
  Object.entries(manifest.node).map(([id, entry]) => [entry.exportedName, id]),
);
const db = new PrismaClient();
const suffix = randomUUID();
const emails = [`Applyflow-a-${suffix}@example.invalid`, `Applyflow-b-${suffix}@example.invalid`];
const password = randomBytes(24).toString("base64url");
const cookiesA = new Map();
const cookiesB = new Map();

async function request(path, options = {}, jar = new Map()) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    redirect: "manual",
    headers: {
      Origin: base,
      Cookie: [...jar].map(([key, value]) => `${key}=${value}`).join("; "),
      ...options.headers,
    },
  });
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(";", 1)[0];
    const separator = pair.indexOf("=");
    const name = pair.slice(0, separator);
    const value = pair.slice(separator + 1);
    if (value) jar.set(name, value);
    else jar.delete(name);
  }
  return response;
}

async function action(name, args, jar = new Map(), path = "/applications") {
  assert(actionIds[name], `Build is missing the ${name} action.`);
  const response = await request(
    path,
    {
      method: "POST",
      headers: { "Next-Action": actionIds[name], "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(args),
    },
    jar,
  );
  const body = await response.text();
  return { response, body };
}

function expectResult(result, success) {
  assert.equal(result.response.status, 200, "Server action returned an unexpected HTTP status.");
  assert(result.body.includes(`"success":${success}`), `Expected action success=${success}.`);
}

async function expectPageRedirect(response, destination, privateMarker) {
  const body = await response.text();
  if (privateMarker)
    assert(!body.includes(privateMarker), "A denied response leaked private data.");
  if (response.status === 307) {
    assert.equal(new URL(response.headers.get("location"), base).pathname, destination);
    return;
  }
  // App Router emits a meta refresh when a Suspense boundary has already streamed.
  assert.equal(response.status, 200);
  const redirectMeta = body.match(/<meta\b[^>]*id="__next-page-redirect"[^>]*>/)?.[0];
  assert(redirectMeta?.includes(`url=${destination}"`), "Missing or incorrect streamed redirect.");
}

try {
  for (const path of [
    "/dashboard",
    "/applications",
    "/admin",
    "/admin/users",
    "/admin/applications",
  ]) {
    const response = await request(path);
    assert.equal(response.status, 307, "Private routes must redirect anonymous visitors.");
    assert.equal(new URL(response.headers.get("location"), base).pathname, "/login");
  }
  console.log("PASS anonymous private-route protection");

  expectResult(
    await action(
      "register",
      [{ name: "Integration A", email: emails[0], password, role: "ADMIN" }],
      cookiesA,
      "/register",
    ),
    true,
  );
  const userA = await db.user.findUniqueOrThrow({ where: { email: emails[0] } });
  assert.notEqual(userA.passwordHash, password);
  assert.equal(userA.role, "USER", "Registration must not accept an injected admin role.");
  const userB = await db.user.create({
    data: { name: "Integration B", email: emails[1], passwordHash: await hash(password, 12) },
  });
  expectResult(await action("login", [{ email: emails[0], password }], cookiesA, "/login"), true);
  expectResult(await action("login", [{ email: emails[1], password }], cookiesB, "/login"), true);
  const session = await (await request("/api/auth/session", {}, cookiesA)).json();
  assert.equal(session.user.id, userA.id);
  console.log("PASS registration, password hashing, login, and authenticated session");

  const input = {
    company: `Integration-${suffix}`,
    position: "Frontend Engineer",
    location: "Remote",
    jobUrl: "https://example.com/job",
    salary: "USD 100,000 / year",
    appliedDate: "2026-09-05",
    status: "APPLIED",
    notes: "Private interview notes",
  };
  expectResult(await action("saveApplication", [{ ...input, userId: userB.id }], cookiesA), true);
  const record = await db.application.findFirstOrThrow({ where: { userId: userA.id } });
  assert.equal(record.userId, userA.id);
  assert.equal(record.appliedDate.toISOString().slice(0, 10), input.appliedDate);
  expectResult(
    await action("saveApplication", [{ ...input, jobUrl: "javascript:alert(1)" }], cookiesA),
    false,
  );
  assert.equal(await db.application.count({ where: { userId: userA.id } }), 1);
  console.log("PASS application creation, owner injection prevention, and server validation");

  expectResult(
    await action("saveApplication", [{ ...input, company: "Hijacked" }, record.id], cookiesB),
    false,
  );
  expectResult(await action("deleteApplication", [record.id], cookiesB), false);
  assert.equal(
    (await db.application.findUniqueOrThrow({ where: { id: record.id } })).company,
    input.company,
  );
  const anonymousUpdate = await action("saveApplication", [
    { ...input, company: "Anonymous" },
    record.id,
  ]);
  assert(anonymousUpdate.response.headers.get("x-action-redirect")?.includes("/login"));
  const otherWorkspace = await (await request("/applications", {}, cookiesB)).text();
  assert(!otherWorkspace.includes(input.company), "Another user’s data leaked into the response.");
  console.log("PASS cross-user reads, updates, deletes, and anonymous mutation protection");

  for (const path of [
    "/admin",
    "/admin/users",
    "/admin/applications",
    `/admin/users/${userA.id}`,
  ]) {
    const response = await request(path, {}, cookiesB);
    await expectPageRedirect(response, "/dashboard", input.company);
  }
  await db.user.update({ where: { id: userB.id }, data: { role: "ADMIN" } });
  for (const path of [
    "/admin",
    `/admin/users?q=${encodeURIComponent(emails[0])}`,
    `/admin/applications?q=${encodeURIComponent(input.company)}`,
    `/admin/users/${userA.id}`,
  ]) {
    const response = await request(path, {}, cookiesB);
    assert.equal(response.status, 200, "Database admins must be able to access admin pages.");
    const body = await response.text();
    assert(
      !body.includes('id="__next-page-redirect"'),
      "An admin received a redirect instead of content.",
    );
    if (path === "/admin") assert(body.includes("Applications created per day"));
    const adminNav = body.match(
      /<nav\b[^>]*aria-label="Main navigation"[^>]*>([\s\S]*?)<\/nav>/,
    )?.[1];
    assert(adminNav?.includes('href="/admin/users"'));
    assert(adminNav?.includes('href="/admin/applications"'));
    assert(!adminNav?.includes('href="/dashboard"'));
    assert(!adminNav?.includes('href="/applications"'));
    assert(!body.includes(userA.passwordHash), "Admin pages must never disclose password hashes.");
    if (path.includes("/users")) assert(body.includes(emails[0]));
    if (path.includes("/applications") || path.includes(`/users/${userA.id}`))
      assert(body.includes(input.company));
  }
  // A database role change takes effect with the same session, without logging in again.
  for (const path of ["/dashboard", "/applications"]) {
    await expectPageRedirect(await request(path, {}, cookiesB), "/admin", input.company);
  }
  await db.user.update({ where: { id: userB.id }, data: { role: "USER" } });
  const revoked = await request("/admin", {}, cookiesB);
  await expectPageRedirect(revoked, "/dashboard", input.company);
  console.log(
    "PASS admin authorization, user details, cross-account reads, role injection and live revocation",
  );

  for (const status of ["SAVED", "APPLIED", "INTERVIEW", "TECHNICAL_EXAM", "OFFER", "REJECTED"]) {
    expectResult(
      await action("saveApplication", [{ ...input, status }, record.id], cookiesA),
      true,
    );
    assert.equal(
      (await db.application.findUniqueOrThrow({ where: { id: record.id } })).status,
      status,
    );
  }
  const dashboard = await request("/dashboard", {}, cookiesA);
  assert.equal(dashboard.status, 200);
  const dashboardBody = await dashboard.text();
  assert(dashboardBody.includes(input.company));
  assert(dashboardBody.includes("Application Pipeline"));
  assert(dashboardBody.includes("Progress Insights"));
  const userNav = dashboardBody.match(
    /<nav\b[^>]*aria-label="Main navigation"[^>]*>([\s\S]*?)<\/nav>/,
  )?.[1];
  assert(userNav?.includes('href="/dashboard"'));
  assert(userNav?.includes('href="/applications"'));
  assert(!userNav?.includes('href="/admin"'));
  console.log("PASS all workflow statuses and authenticated dashboard rendering");

  await db.application.createMany({
    data: Array.from({ length: 10 }, (_, index) => ({
      ...input,
      company: `Fixture-${suffix}-${index}`,
      appliedDate: new Date("2026-09-05T00:00:00Z"),
      status: "SAVED",
      userId: userA.id,
      createdAt: new Date(Date.now() + index * 1000),
    })),
  });
  const secondPage = await request("/applications?page=2", {}, cookiesA);
  assert.equal(secondPage.status, 200);
  assert(
    (await secondPage.text()).includes(input.company),
    "The oldest record should appear on page two.",
  );
  const filtered = await request("/applications?status=SAVED", {}, cookiesA);
  assert(
    !(await filtered.text()).includes(input.company),
    "Status filtering included a rejected record.",
  );
  const searched = await request(
    `/applications?q=${encodeURIComponent(input.company)}`,
    {},
    cookiesA,
  );
  const searchBody = await searched.text();
  assert(searchBody.includes(input.company));
  assert(!searchBody.includes(`Fixture-${suffix}-`));
  const oldest = await request("/applications?sort=oldest", {}, cookiesA);
  assert((await oldest.text()).includes(input.company));
  console.log("PASS database pagination, search, status filter, and oldest-first ordering");

  expectResult(await action("deleteApplication", [record.id], cookiesA), true);
  assert.equal(await db.application.findUnique({ where: { id: record.id } }), null);
  await action("logout", [], cookiesA, "/dashboard");
  const ended = await (await request("/api/auth/session", {}, cookiesA)).json();
  assert.equal(ended, null);
  console.log("PASS owned deletion and session logout");
  console.log("Integration suite passed.");
} finally {
  await db.user.deleteMany({ where: { email: { in: emails } } });
  if (process.env.AUTH_SECRET) {
    const keys = emails.map((email) =>
      createHmac("sha256", process.env.AUTH_SECRET).update(`login:${email}`).digest("hex"),
    );
    await db.rateLimit.deleteMany({ where: { key: { in: keys } } });
  }
  await db.$disconnect();
  console.log("Removed this run’s test accounts and their applications.");
}
