import { afterEach, describe, expect, it, vi } from "vitest";
const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ db: { $queryRaw: query } }));
import { rateLimit } from "@/lib/rate-limit";
afterEach(() => vi.unstubAllEnvs());
describe("shared rate limiter", () => {
  it("accepts the boundary attempt and rejects the next", async () => {
    vi.stubEnv("AUTH_SECRET", "unit-test-secret-not-for-production");
    query.mockResolvedValueOnce([{ count: 10 }]).mockResolvedValueOnce([{ count: 11 }]);
    expect(await rateLimit("login:alex@example.com", 10, 15)).toBe(true);
    expect(await rateLimit("login:alex@example.com", 10, 15)).toBe(false);
    const args = query.mock.calls[0];
    expect(args[1]).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(args)).not.toContain("alex@example.com");
    expect(args[0].join("")).toContain('ON CONFLICT ("key") DO UPDATE');
  });
  it("fails closed if the required secret is absent", async () => {
    vi.stubEnv("AUTH_SECRET", "");
    await expect(rateLimit("login:alex@example.com", 10, 15)).rejects.toThrow(
      "AUTH_SECRET is required",
    );
    expect(query).not.toHaveBeenCalled();
  });
});
