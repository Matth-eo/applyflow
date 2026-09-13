import type { Metadata } from "next";
import Link from "next/link";
import { getAdminUsers } from "@/lib/admin";
import { parseQuery } from "@/lib/applications";
import { AdminFilters, AdminPagination } from "@/components/admin/admin-controls";
import { displayDate } from "@/utils/date";
export const metadata: Metadata = { title: "Manage users" };
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseQuery(await searchParams);
  const data = await getAdminUsers(query);
  return (
    <>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Users</h1>
      <p className="mb-7 text-sm text-muted-foreground">
        Find an account and review its applications.
      </p>
      <section className="panel overflow-hidden">
        <AdminFilters path="/admin/users" query={query} users />
        {data.users.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Registered users</caption>
              <thead className="border-y bg-muted/40 text-muted-foreground">
                <tr>
                  {["Name", "Email", "Role", "Joined", "Applications"].map((label) => (
                    <th key={label} scope="col" className="px-5 py-3 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {user.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4">{user.email}</td>
                    <td className="px-5 py-4">{user.role === "ADMIN" ? "Admin" : "User"}</td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {displayDate(user.createdAt.toISOString())}
                    </td>
                    <td className="px-5 py-4">{user._count.applications}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-12 text-center text-muted-foreground">No users match your search.</p>
        )}
        <AdminPagination
          path="/admin/users"
          query={{ ...query, page: data.page }}
          total={data.total}
          pageCount={data.pageCount}
        />
      </section>
    </>
  );
}
