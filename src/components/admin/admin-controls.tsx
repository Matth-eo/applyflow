import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUSES } from "@/types/application";
import { statusConfig } from "@/utils/status";
import type { ApplicationQuery } from "@/lib/applications";

export function AdminFilters({
  path,
  query,
  users = false,
}: {
  path: string;
  query: ApplicationQuery;
  users?: boolean;
}) {
  return (
    <form action={path} className="flex flex-wrap gap-3 p-5">
      <div className="relative min-w-48 flex-1">
        <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
        <input
          key={query.q}
          name="q"
          defaultValue={query.q}
          maxLength={160}
          className="field pl-9"
          aria-label={users ? "Search users by name or email" : "Search applications"}
          placeholder={users ? "Search name or email…" : "Search company, position, or location…"}
        />
      </div>
      {!users && (
        <>
          <select
            key={query.status}
            name="status"
            defaultValue={query.status}
            className="field w-auto"
            aria-label="Filter by status"
          >
            <option value="ALL">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusConfig[status].label}
              </option>
            ))}
          </select>
          <select
            key={query.sort}
            name="sort"
            defaultValue={query.sort}
            className="field w-auto"
            aria-label="Sort applications"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </>
      )}
      <Button type="submit">Search</Button>
      {(query.q || query.status !== "ALL" || query.sort !== "newest") && (
        <Button asChild variant="outline">
          <Link href={path}>Reset</Link>
        </Button>
      )}
    </form>
  );
}

export function AdminPagination({
  path,
  query,
  total,
  pageCount,
}: {
  path: string;
  query: ApplicationQuery;
  total: number;
  pageCount: number;
}) {
  function href(page: number) {
    const params = new URLSearchParams({
      q: query.q,
      status: query.status,
      sort: query.sort,
      page: String(page),
    });
    return `${path}?${params}`;
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t p-5 text-sm">
      <p className="text-muted-foreground">
        {total} results · Page {query.page} of {pageCount}
      </p>
      <nav aria-label="Pagination" className="flex gap-2">
        {query.page > 1 ? (
          <Button asChild variant="outline">
            <Link href={href(query.page - 1)}>
              <ChevronLeft />
              Previous
            </Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            <ChevronLeft />
            Previous
          </Button>
        )}
        {query.page < pageCount ? (
          <Button asChild variant="outline">
            <Link href={href(query.page + 1)}>
              Next
              <ChevronRight />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            Next
            <ChevronRight />
          </Button>
        )}
      </nav>
    </div>
  );
}
