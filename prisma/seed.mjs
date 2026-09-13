import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { pathToFileURL } from "node:url";

export async function seedAdmin(db, password = process.env.ADMIN_SEED_PASSWORD) {
  if (!password) {
    throw new Error("ADMIN_SEED_PASSWORD is required to seed the administrator account.");
  }
  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error(
      "ADMIN_SEED_PASSWORD must be at least 12 characters and at most 72 UTF-8 bytes.",
    );
  }
  const admin = await db.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      email: "admin@gmail.com",
      name: "Applyflow Admin",
      role: "ADMIN",
      passwordHash: await hash(password, 12),
    },
    select: { id: true, role: true },
  });
  // Never silently promote a pre-existing ordinary account with the same email.
  if (admin.role !== "ADMIN")
    throw new Error(
      "The seed email belongs to a non-admin account. Resolve the collision explicitly before seeding.",
    );
  return admin;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const db = new PrismaClient();
  try {
    await seedAdmin(db);
    console.log("Administrator account is ready. Existing credentials were preserved.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Admin seed failed.");
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
}
