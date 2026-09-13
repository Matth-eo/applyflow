import "server-only";
import { Prisma, type Application } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { STATUSES, type ApplicationItem, type Status } from "@/types/application";

export const PAGE_SIZE = 10;
export type ApplicationQuery = {
  q: string;
  status: Status | "ALL";
  sort: "newest" | "oldest";
  page: number;
};
export function parseQuery(
  params: Record<string, string | string[] | undefined>,
): ApplicationQuery {
  const scalar = (value: string | string[] | undefined) => (typeof value === "string" ? value : "");
  const status = scalar(params.status);
  const page = Number(scalar(params.page));
  return {
    q: scalar(params.q).trim().slice(0, 160),
    status: STATUSES.includes(status as Status) ? (status as Status) : "ALL",
    sort: scalar(params.sort) === "oldest" ? "oldest" : "newest",
    page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 100000) : 1,
  };
}
export function serializeApplication(item: Application): ApplicationItem {
  return {
    id: item.id,
    company: item.company,
    position: item.position,
    location: item.location,
    jobUrl: item.jobUrl,
    salary: item.salary,
    appliedDate: item.appliedDate.toISOString().slice(0, 10),
    status: item.status,
    notes: item.notes,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
export async function getApplications(query: ApplicationQuery) {
  const user = await requireUser();
  const where: Prisma.ApplicationWhereInput = {
    userId: user.id,
    ...(query.status !== "ALL" && { status: query.status }),
    ...(query.q && {
      OR: ["company", "position", "location"].map((field) => ({
        [field]: { contains: query.q, mode: "insensitive" },
      })),
    }),
  };
  // A consistent snapshot keeps page totals and rows in sync during concurrent writes.
  return db.$transaction(
    async (tx) => {
      const total = await tx.application.count({ where });
      const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const page = Math.min(query.page, pageCount);
      const rows = await tx.application.findMany({
        where,
        orderBy: [{ createdAt: query.sort === "oldest" ? "asc" : "desc" }, { id: "asc" }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      });
      return { rows: rows.map(serializeApplication), total, pageCount, page };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
}
export async function getDashboard() {
  const user = await requireUser();
  const weekStart = new Date();
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);
  weekStart.setUTCHours(0, 0, 0, 0);
  const groupQuery = db.application.groupBy({
    by: ["status"],
    orderBy: { status: "asc" },
    where: { userId: user.id },
    _count: { _all: true },
  });
  const [groups, recent, thisWeek] = await db.$transaction(
    [
      groupQuery,
      db.application.findMany({
        where: { userId: user.id },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        take: 5,
      }),
      db.application.count({ where: { userId: user.id, createdAt: { gte: weekStart } } }),
    ],
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
  const counts = Object.fromEntries(
    STATUSES.map((status) => [
      status,
      groups.find((group) => group.status === status)?._count._all ?? 0,
    ]),
  ) as Record<Status, number>;
  return {
    counts,
    total: Object.values(counts).reduce((sum, count) => sum + count, 0),
    recent: recent.map(serializeApplication),
    thisWeek,
  };
}
