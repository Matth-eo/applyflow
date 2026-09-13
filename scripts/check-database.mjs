import { PrismaClient } from "@prisma/client";

try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

for (const key of ["DATABASE_URL", "DIRECT_URL"]) {
  if (!process.env[key]) {
    console.error(`${key}: missing`);
    process.exitCode = 1;
    continue;
  }
  try {
    const parsed = new URL(process.env[key]);
    if (!["postgres:", "postgresql:"].includes(parsed.protocol)) throw new Error("protocol");
  } catch {
    console.error(`${key}: expected a PostgreSQL URL only, without a psql command or extra quotes`);
    process.exitCode = 1;
    continue;
  }
  const client = new PrismaClient({ datasourceUrl: process.env[key] });
  try {
    await client.$queryRaw`SELECT 1`;
    console.log(`${key}: connection successful`);
  } catch (error) {
    console.error(`${key}: connection failed (${error.errorCode ?? error.code ?? error.name})`);
    const url = new URL(process.env[key]);
    let detail = error.message;
    for (const value of [
      process.env[key],
      url.password,
      decodeURIComponent(url.password),
      url.username,
      url.hostname,
    ]) {
      if (value) detail = detail.replaceAll(value, "[redacted]");
    }
    console.error(detail.slice(-1200));
    process.exitCode = 1;
  } finally {
    await client.$disconnect();
  }
}
