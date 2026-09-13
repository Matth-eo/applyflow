import { beforeEach, describe, expect, it, vi } from "vitest";

const { db, requireUser, revalidatePath } = vi.hoisted(() => ({
  db: { application: { create: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() } },
  requireUser: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/session", () => ({ requireUser }));
vi.mock("next/cache", () => ({ revalidatePath }));
import { saveApplication, deleteApplication } from "@/actions/applications";

const id = "cmf7a7rm50000s4a1s7t4h0go";
const input = {
  company: "Linear",
  position: "Engineer",
  location: "Remote",
  jobUrl: "https://example.com/jobs",
  salary: "",
  appliedDate: "2026-09-05",
  status: "APPLIED",
  notes: "",
};
beforeEach(() => {
  vi.resetAllMocks();
  requireUser.mockResolvedValue({ id: "owner-1" });
});
describe("application authorization", () => {
  it("assigns creates to the authenticated owner, ignoring a supplied owner", async () => {
    db.application.create.mockResolvedValue({ id });
    expect(await saveApplication({ ...input, userId: "victim" })).toEqual({ success: true });
    expect(db.application.create).toHaveBeenCalledWith({
      data: {
        ...input,
        userId: "owner-1",
        appliedDate: new Date("2026-09-05T00:00:00.000Z"),
        salary: null,
        notes: null,
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePath).toHaveBeenCalledWith("/applications");
  });
  it("scopes updates to both id and owner", async () => {
    db.application.updateMany.mockResolvedValue({ count: 1 });
    expect(await saveApplication(input, id)).toEqual({ success: true });
    expect(db.application.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id, userId: "owner-1" } }),
    );
  });
  it("denies updates to an inaccessible record", async () => {
    db.application.updateMany.mockResolvedValue({ count: 0 });
    expect((await saveApplication(input, id)).success).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
  it("scopes deletes to both id and owner and handles an inaccessible record", async () => {
    db.application.deleteMany.mockResolvedValue({ count: 0 });
    expect((await deleteApplication(id)).success).toBe(false);
    expect(db.application.deleteMany).toHaveBeenCalledWith({ where: { id, userId: "owner-1" } });
  });
  it("deletes an owned record and refreshes the dashboard", async () => {
    db.application.deleteMany.mockResolvedValue({ count: 1 });
    expect(await deleteApplication(id)).toEqual({ success: true });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
  it("never touches the database for an unauthenticated request", async () => {
    requireUser.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(saveApplication(input)).rejects.toThrow("NEXT_REDIRECT");
    await expect(deleteApplication(id)).rejects.toThrow("NEXT_REDIRECT");
    expect(db.application.create).not.toHaveBeenCalled();
    expect(db.application.deleteMany).not.toHaveBeenCalled();
  });
  it("rejects invalid ids and payloads before writing", async () => {
    expect((await saveApplication(input, "bad-id")).success).toBe(false);
    expect((await saveApplication({ ...input, jobUrl: "javascript:alert(1)" })).success).toBe(
      false,
    );
    expect((await deleteApplication("bad-id")).success).toBe(false);
    expect(db.application.updateMany).not.toHaveBeenCalled();
    expect(db.application.create).not.toHaveBeenCalled();
    expect(db.application.deleteMany).not.toHaveBeenCalled();
  });
  it("returns a safe error on a database failure", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    db.application.create.mockRejectedValue(new Error("secret connection details"));
    const result = await saveApplication(input);
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).not.toContain("secret");
    log.mockRestore();
  });
});
