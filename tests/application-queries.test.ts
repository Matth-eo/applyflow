import { beforeEach, describe, expect, it, vi } from "vitest";
const { db, requireUser } = vi.hoisted(() => ({
  db: {
    application: { count: vi.fn(), findMany: vi.fn(), groupBy: vi.fn() },
    $transaction: vi.fn(),
  },
  requireUser: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/session", () => ({ requireUser }));
import {
  getApplications,
  getDashboard,
  parseQuery,
  serializeApplication,
} from "@/lib/applications";
import type { Application } from "@prisma/client";

beforeEach(() => {
  vi.resetAllMocks();
  requireUser.mockResolvedValue({ id: "owner-1" });
  db.$transaction.mockImplementation(async (input) =>
    typeof input === "function" ? input(db) : Promise.all(input),
  );
  db.application.count.mockResolvedValue(0);
  db.application.findMany.mockResolvedValue([]);
  db.application.groupBy.mockResolvedValue([]);
});
describe("query parsing", () => {
  it("bounds untrusted query values", () => {
    expect(
      parseQuery({ page: "-5", status: "UNKNOWN", sort: "DROP TABLE", q: ["a", "b"] }),
    ).toEqual({ page: 1, status: "ALL", sort: "newest", q: "" });
    expect(parseQuery({ page: "2.5" }).page).toBe(1);
    expect(parseQuery({ page: "Infinity" }).page).toBe(1);
    expect(parseQuery({ page: "9999999", q: "x".repeat(200) })).toMatchObject({
      page: 100000,
      q: "x".repeat(160),
    });
  });
});
describe("user-scoped reads", () => {
  it("filters search by owner, clamps stale pages, and uses database pagination", async () => {
    db.application.count.mockResolvedValue(12);
    const result = await getApplications({
      q: "Engineer",
      status: "APPLIED",
      sort: "oldest",
      page: 999,
    });
    expect(result).toMatchObject({ total: 12, page: 2, pageCount: 2 });
    expect(db.application.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: "owner-1",
          status: "APPLIED",
          OR: ["company", "position", "location"].map((field) => ({
            [field]: { contains: "Engineer", mode: "insensitive" },
          })),
        },
        skip: 10,
        take: 10,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      }),
    );
    expect(db.application.count.mock.calls[0][0].where).toEqual(
      db.application.findMany.mock.calls[0][0].where,
    );
  });
  it("scopes every dashboard query to the current user and fills zero statuses", async () => {
    db.application.groupBy.mockResolvedValue([
      { status: "APPLIED", _count: { _all: 3 } },
      { status: "OFFER", _count: { _all: 1 } },
    ]);
    const result = await getDashboard();
    expect(result.total).toBe(4);
    expect(result.counts).toEqual({
      SAVED: 0,
      APPLIED: 3,
      INTERVIEW: 0,
      TECHNICAL_EXAM: 0,
      OFFER: 1,
      REJECTED: 0,
    });
    for (const mock of [db.application.groupBy, db.application.findMany, db.application.count])
      expect(mock.mock.calls[0][0].where.userId).toBe("owner-1");
  });
  it("rejects an unauthenticated read before querying applications", async () => {
    requireUser.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(getApplications(parseQuery({}))).rejects.toThrow("NEXT_REDIRECT");
    expect(db.application.findMany).not.toHaveBeenCalled();
  });
  it("serializes dates and excludes owner identifiers from client DTOs", () => {
    const row: Application = {
      id: "application-1",
      userId: "owner-1",
      company: "Example",
      position: "Engineer",
      location: "Remote",
      jobUrl: "https://example.com",
      salary: null,
      notes: null,
      status: "SAVED",
      appliedDate: new Date("2026-09-05T00:00:00Z"),
      createdAt: new Date("2026-09-05T12:30:00Z"),
      updatedAt: new Date("2026-09-05T12:30:00Z"),
    };
    const result = serializeApplication(row);
    expect(result.appliedDate).toBe("2026-09-05");
    expect(result.createdAt).toBe("2026-09-05T12:30:00.000Z");
    expect(result).not.toHaveProperty("userId");
  });
});
