import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const requireUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) redirect("/login");
  return user;
});

// Read the current database role rather than trusting a potentially stale JWT claim.
export const requireAdmin = cache(async () => {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
});

export const requirePersonalUser = cache(async () => {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin");
  return user;
});
