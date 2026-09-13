import "server-only";
import { createHmac } from "node:crypto";
import { db } from "@/lib/db";

export async function rateLimit(identifier: string, limit: number, minutes: number) {
  if (!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET is required.");
  const key = createHmac("sha256", process.env.AUTH_SECRET).update(identifier).digest("hex");
  // An atomic UPSERT prevents concurrent requests from bypassing the limit.
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "expiresAt")
    VALUES (${key}, 1, NOW() + (${minutes} * INTERVAL '1 minute'))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."expiresAt" <= NOW() THEN 1 ELSE "RateLimit"."count" + 1 END,
      "expiresAt" = CASE WHEN "RateLimit"."expiresAt" <= NOW() THEN NOW() + (${minutes} * INTERVAL '1 minute') ELSE "RateLimit"."expiresAt" END
    RETURNING "count"`;
  return rows[0].count <= limit;
}
