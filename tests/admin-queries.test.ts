import { beforeEach, describe, expect, it, vi } from "vitest";
const { requireAdmin, db } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  db: {
    user: { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
    application: { count: vi.fn(), findMany: vi.fn(), groupBy: vi.fn() },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
  },
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/session", () => ({ requireAdmin, requireUser: vi.fn() }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
import { getAdminApplications, getAdminDashboard, getAdminUser, getAdminUsers } from "@/lib/admin";
import { parseQuery } from "@/lib/applications";
beforeEach(() => {
  vi.resetAllMocks();
  requireAdmin.mockResolvedValue({ role: "ADMIN" });
  db.$transaction.mockImplementation(async (fn) => fn(db));
  db.user.count.mockResolvedValue(0);
  db.user.findMany.mockResolvedValue([]);
  db.application.count.mockResolvedValue(0);
  db.application.findMany.mockResolvedValue([]);
  db.application.groupBy.mockResolvedValue([]);
  db.$queryRaw.mockResolvedValue([]);
});
describe("admin data access", () => {
  it("guards every cross-account query independently", async () => {
    requireAdmin.mockRejectedValue(new Error("DENIED"));
    for (const read of [
      () => getAdminDashboard(),
      () => getAdminUsers(parseQuery({})),
      () => getAdminUser("bad"),
      () => getAdminApplications(parseQuery({})),
    ])
      await expect(read()).rejects.toThrow("DENIED");
    expect(db.$transaction).not.toHaveBeenCalled();
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });
  it("searches users without selecting password hashes and clamps pages", async () => {
    db.user.count.mockResolvedValue(11);
    const result = await getAdminUsers(parseQuery({ q: "Alex", page: "99" }));
    expect(result.page).toBe(2);
    const args = db.user.findMany.mock.calls[0][0];
    expect(args.select).not.toHaveProperty("passwordHash");
    expect(args.select.role).toBe(true);
    expect(args.where.OR).toHaveLength(2);
    expect(args.skip).toBe(10);
  });
  it("limits user-detail application queries to the selected user", async () => {
    const id = "cmf7a7rm50000s4a1s7t4h0go";
    await getAdminApplications(parseQuery({ status: "INTERVIEW" }), id);
    expect(db.application.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: id, status: "INTERVIEW" },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      }),
    );
  });
  it("zero-fills daily and status charts and excludes saved jobs from submissions", async () => {
    const result = await getAdminDashboard();
    expect(result.daily).toHaveLength(30);
    expect(result.daily.every((day) => day.count === 0)).toBe(true);
    expect(result.interviews).toBe(0);
    expect(db.application.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: { not: "SAVED" } }) }),
    );
  });
  it("rejects malformed and missing user IDs", async () => {
    await expect(getAdminUser("bad")).rejects.toThrow("NOT_FOUND");
    expect(db.user.findUnique).not.toHaveBeenCalled();
    db.user.findUnique.mockResolvedValue(null);
    await expect(getAdminUser("cmf7a7rm50000s4a1s7t4h0go")).rejects.toThrow("NOT_FOUND");
  });
});
