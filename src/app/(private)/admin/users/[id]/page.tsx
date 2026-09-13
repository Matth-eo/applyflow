import type { Metadata } from "next";
import { getAdminUser } from "@/lib/admin";
import { parseQuery } from "@/lib/applications";
import { AdminApplicationList } from "@/components/admin/application-list";
import { displayDate } from "@/utils/date";
export const metadata: Metadata = { title: "User details" };
export default async function AdminUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const user = await getAdminUser(id);
  const query = parseQuery(await searchParams);
  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <p className="eyebrow mb-2">User details</p>
        <h1 className="break-words text-3xl font-bold">{user.name}</h1>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Email", user.email],
            ["Role", user.role === "ADMIN" ? "Admin" : "User"],
            ["Joined", displayDate(user.createdAt.toISOString())],
            ["Applications", user._count.applications],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="mt-1 break-words font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <h2 className="text-xl font-semibold">Job applications</h2>
      <AdminApplicationList query={query} path={`/admin/users/${user.id}`} userId={user.id} />
    </div>
  );
}
