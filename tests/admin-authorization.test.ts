import { beforeEach, describe, expect, it, vi } from "vitest";
const { auth, findUnique, redirect } = vi.hoisted(() => ({
  auth: vi.fn(),
  findUnique: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));
vi.mock("server-only", () => ({}));
vi.mock("react", () => ({ cache: (fn: unknown) => fn }));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db: { user: { findUnique } } }));
vi.mock("next/navigation", () => ({ redirect }));
import { requireAdmin, requirePersonalUser } from "@/lib/session";
beforeEach(() => {
  vi.clearAllMocks();
  auth.mockResolvedValue({ user: { id: "user-1", role: "ADMIN" } });
});
describe("admin guard", () => {
  it("redirects admins away from the personal workspace using their current database role", async () => {
    findUnique.mockResolvedValue({ id: "user-1", role: "ADMIN" });
    await expect(requirePersonalUser()).rejects.toThrow("REDIRECT:/admin");
  });
  it("keeps the personal workspace available to ordinary users", async () => {
    findUnique.mockResolvedValue({ id: "user-1", role: "USER" });
    expect((await requirePersonalUser()).role).toBe("USER");
  });
  it("rejects anonymous sessions before querying users", async () => {
    auth.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/login");
    expect(findUnique).not.toHaveBeenCalled();
  });
  it("rejects deleted accounts", async () => {
    findUnique.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/login");
  });
  it("ignores a stale or forged session role and checks the database", async () => {
    findUnique.mockResolvedValue({ id: "user-1", role: "USER" });
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/dashboard");
  });
  it("accepts a current database admin and selects no password hash", async () => {
    findUnique.mockResolvedValue({ id: "user-1", role: "ADMIN" });
    expect((await requireAdmin()).role).toBe("ADMIN");
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: { id: true, name: true, email: true, role: true },
    });
  });
});
