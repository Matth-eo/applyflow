import { describe, expect, it, vi } from "vitest";
import { compare, getRounds } from "bcryptjs";
import { seedAdmin } from "../prisma/seed.mjs";
describe("administrator seed", () => {
  it("requires an explicit administrator password before touching the database", async () => {
    const upsert = vi.fn();
    vi.stubEnv("ADMIN_SEED_PASSWORD", undefined);
    try {
      await expect(seedAdmin({ user: { upsert } })).rejects.toThrow(
        "ADMIN_SEED_PASSWORD is required to seed the administrator account.",
      );
      expect(upsert).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("rejects unsafe override lengths before touching the database", async () => {
    const upsert = vi.fn();
    await expect(seedAdmin({ user: { upsert } }, "short")).rejects.toThrow("ADMIN_SEED_PASSWORD");
    await expect(seedAdmin({ user: { upsert } }, "é".repeat(40))).rejects.toThrow(
      "ADMIN_SEED_PASSWORD",
    );
    expect(upsert).not.toHaveBeenCalled();
  });
  it("uses the requested credential as a cost-12 bcrypt hash and never overwrites existing credentials", async () => {
    const upsert = vi.fn().mockResolvedValue({ id: "admin", role: "ADMIN" });
    const password = "use-a-private-admin-password";
    await seedAdmin({ user: { upsert } }, password);
    const args = upsert.mock.calls[0][0];
    expect(args.where.email).toBe("admin@gmail.com");
    expect(args.update).toEqual({});
    expect(args.create.role).toBe("ADMIN");
    expect(getRounds(args.create.passwordHash)).toBe(12);
    expect(await compare(password, args.create.passwordHash)).toBe(true);
  });
  it("does not promote an existing ordinary user with the seed email", async () => {
    const upsert = vi.fn().mockResolvedValue({ id: "ordinary", role: "USER" });
    await expect(seedAdmin({ user: { upsert } }, "use-a-private-admin-password")).rejects.toThrow(
      "non-admin",
    );
    expect(upsert.mock.calls[0][0].update).toEqual({});
  });
});
