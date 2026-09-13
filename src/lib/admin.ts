import "server-only";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PAGE_SIZE, serializeApplication, type ApplicationQuery } from "@/lib/applications";
import { STATUSES, type Status } from "@/types/application";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  _count: { select: { applications: true } },
} satisfies Prisma.UserSelect;

export async function getAdminDashboard() {
  await requireAdmin();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 29);
  return db.$transaction(
    async (tx) => {
      const totalUsers = await tx.user.count();
      const totalApplications = await tx.application.count();
      const submittedToday = await tx.application.count({
        where: { appliedDate: { gte: today, lt: tomorrow }, status: { not: "SAVED" } },
      });
      const groups = await tx.application.groupBy({ by: ["status"], _count: { _all: true } });
      const counts = Object.fromEntries(
        STATUSES.map((status) => [
          status,
          groups.find((group) => group.status === status)?._count._all ?? 0,
        ]),
      ) as Record<Status, number>;
      // createdAt is stored as UTC; aggregate in PostgreSQL rather than fetching all records.
      const rows = await tx.$queryRaw<{ day: string; count: bigint }[]>`
      SELECT to_char("createdAt"::date, 'YYYY-MM-DD') AS "day", COUNT(*) AS "count"
      FROM "Application" WHERE "createdAt" >= ${start} AND "createdAt" < ${tomorrow}
      GROUP BY "createdAt"::date ORDER BY "createdAt"::date`;
      const daily = Array.from({ length: 30 }, (_, index) => {
        const day = new Date(start);
        day.setUTCDate(day.getUTCDate() + index);
        const date = day.toISOString().slice(0, 10);
        return { date, count: Number(rows.find((row) => row.day === date)?.count ?? 0) };
      });
      return {
        totalUsers,
        totalApplications,
        submittedToday,
        interviews: counts.INTERVIEW,
        counts,
        daily,
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
}

export async function getAdminUsers(query: ApplicationQuery) {
  await requireAdmin();
  const where: Prisma.UserWhereInput = query.q
    ? {
        OR: [
          { name: { contains: query.q, mode: "insensitive" } },
          { email: { contains: query.q, mode: "insensitive" } },
        ],
      }
    : {};
  return db.$transaction(
    async (tx) => {
      const total = await tx.user.count({ where });
      const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const page = Math.min(query.page, pageCount);
      const users = await tx.user.findMany({
        where,
        select: publicUserSelect,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
      });
      return { users, total, pageCount, page };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
}

export async function getAdminUser(id: string) {
  await requireAdmin();
  if (!z.string().cuid().safeParse(id).success) notFound();
  const user = await db.user.findUnique({ where: { id }, select: publicUserSelect });
  if (!user) notFound();
  return user;
}

export async function getAdminApplications(query: ApplicationQuery, userId?: string) {
  await requireAdmin();
  if (userId !== undefined && !z.string().cuid().safeParse(userId).success) notFound();
  const where: Prisma.ApplicationWhereInput = {
    ...(userId && { userId }),
    ...(query.status !== "ALL" && { status: query.status }),
    ...(query.q && {
      OR: ["company", "position", "location"].map((field) => ({
        [field]: { contains: query.q, mode: "insensitive" },
      })),
    }),
  };
  return db.$transaction(
    async (tx) => {
      const total = await tx.application.count({ where });
      const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const page = Math.min(query.page, pageCount);
      const rows = await tx.application.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: [{ createdAt: query.sort === "oldest" ? "asc" : "desc" }, { id: "asc" }],
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
      });
      return {
        rows: rows.map((row) => ({ ...serializeApplication(row), user: row.user })),
        total,
        pageCount,
        page,
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
}
