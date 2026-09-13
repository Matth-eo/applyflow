import { describe, expect, it } from "vitest";
import { applicationSchema, loginSchema, registerSchema } from "@/lib/validations";
import { STATUSES } from "@/types/application";

const application = {
  company: " Linear ",
  position: "Engineer",
  location: "Remote",
  jobUrl: "https://example.com/jobs/1",
  salary: "",
  appliedDate: "2026-09-05",
  status: "SAVED",
  notes: "",
};
describe("application validation", () => {
  it("trims fields and accepts optional empty salary and notes", () => {
    const result = applicationSchema.parse(application);
    expect(result.company).toBe("Linear");
    expect(result.salary).toBe("");
  });
  it.each(STATUSES)("accepts the %s workflow status", (status) => {
    expect(applicationSchema.safeParse({ ...application, status }).success).toBe(true);
  });
  it.each([
    "javascript:alert(1)",
    "data:text/html,test",
    "ftp://example.com/file",
    "example.com/jobs",
  ])("rejects unsafe or incomplete URL %s", (jobUrl) => {
    expect(applicationSchema.safeParse({ ...application, jobUrl }).success).toBe(false);
  });
  it.each(["2026-02-30", "2026-13-01", "2025-02-29", "1899-12-31", "9999-01-01", "not-a-date"])(
    "rejects invalid calendar date %s",
    (appliedDate) => {
      expect(applicationSchema.safeParse({ ...application, appliedDate }).success).toBe(false);
    },
  );
  it("accepts a leap-day date", () => {
    expect(applicationSchema.safeParse({ ...application, appliedDate: "2028-02-29" }).success).toBe(
      true,
    );
  });
  it("rejects blank required fields and oversize notes", () => {
    expect(applicationSchema.safeParse({ ...application, company: "   " }).success).toBe(false);
    expect(applicationSchema.safeParse({ ...application, notes: "x".repeat(10001) }).success).toBe(
      false,
    );
    expect(applicationSchema.safeParse({ ...application, status: "UNKNOWN" }).success).toBe(false);
  });
});
describe("account validation", () => {
  it("normalizes email consistently for login and registration", () => {
    expect(loginSchema.parse({ email: "  Alex@Example.com ", password: "test" }).email).toBe(
      "alex@example.com",
    );
  });
  it("requires a long password and prevents bcrypt UTF-8 truncation", () => {
    const user = { name: "Alex", email: "alex@example.com" };
    expect(registerSchema.safeParse({ ...user, password: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...user, password: "a".repeat(72) }).success).toBe(true);
    expect(registerSchema.safeParse({ ...user, password: "é".repeat(40) }).success).toBe(false);
    expect(registerSchema.safeParse({ ...user, password: "a".repeat(73) }).success).toBe(false);
  });
});
