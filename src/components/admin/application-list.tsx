import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getAdminApplications } from "@/lib/admin";
import type { ApplicationQuery } from "@/lib/applications";
import { CompanyCell } from "@/components/applications/application-table";
import { StatusBadge } from "@/components/status-badge";
import { AdminFilters, AdminPagination } from "@/components/admin/admin-controls";
import { displayDate } from "@/utils/date";

export async function AdminApplicationList({
  query,
  path,
  userId,
}: {
  query: ApplicationQuery;
  path: string;
  userId?: string;
}) {
  const data = await getAdminApplications(query, userId);
  return (
    <section className="panel overflow-hidden" aria-label="Admin application list">
      <AdminFilters path={path} query={query} />
      {data.rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Applications and their account owners</caption>
            <thead className="border-y bg-muted/40 text-muted-foreground">
              <tr>
                {["Company & position", "User", "Status", "Date applied", "Details"].map(
                  (label) => (
                    <th key={label} scope="col" className="px-5 py-3 font-medium">
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.rows.map((row) => (
                <tr key={row.id} className="align-top hover:bg-muted/30">
                  <td className="px-5 py-4">
                    <CompanyCell application={row} />
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/users/${row.user.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {row.user.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">{row.user.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                    {displayDate(row.appliedDate)}
                  </td>
                  <td className="min-w-56 max-w-sm px-5 py-4">
                    <details>
                      <summary className="cursor-pointer font-medium text-primary">
                        View details
                      </summary>
                      <dl className="mt-3 space-y-2 break-words text-sm">
                        <dt className="font-medium">Location</dt>
                        <dd>{row.location}</dd>
                        <dt className="font-medium">Salary</dt>
                        <dd>{row.salary || "Not provided"}</dd>
                        <dt className="font-medium">Notes</dt>
                        <dd className="whitespace-pre-wrap">{row.notes || "No notes"}</dd>
                        <dt className="font-medium">Added</dt>
                        <dd>{displayDate(row.createdAt)}</dd>
                      </dl>
                      <a
                        href={row.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        Job posting
                        <ExternalLink className="size-4" />
                      </a>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-16 text-center">
          <h2 className="font-semibold">No applications found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try another search or status. Applications will appear here as users add them.
          </p>
        </div>
      )}
      <AdminPagination
        path={path}
        query={{ ...query, page: data.page }}
        total={data.total}
        pageCount={data.pageCount}
      />
    </section>
  );
}
