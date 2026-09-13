"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";
import { STATUSES, type Status } from "@/types/application";
import { statusConfig } from "@/utils/status";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Button } from "@/components/ui/button";

export type FilterQuery = {
  q: string;
  status: Status | "ALL";
  sort: "newest" | "oldest";
  page: number;
};
function queryUrl(query: FilterQuery) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status !== "ALL") params.set("status", query.status);
  if (query.sort !== "newest") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  return `/applications${params.size ? `?${params}` : ""}`;
}
export function ApplicationFilters({ query }: { query: FilterQuery }) {
  const router = useRouter();
  const [search, setSearch] = useState(query.q);
  const debounced = useDebouncedValue(search);
  const [pending, startTransition] = useTransition();
  const queryRef = useRef(query);
  const hasLocalChange = useRef(false);
  queryRef.current = query;
  // Keep back/forward navigation in sync without remounting the focused input.
  useEffect(() => {
    if (!hasLocalChange.current) setSearch(query.q);
  }, [query.q]);
  useEffect(() => {
    if (hasLocalChange.current) {
      hasLocalChange.current = false;
      startTransition(() =>
        router.replace(queryUrl({ ...queryRef.current, q: debounced.trim(), page: 1 }), {
          scroll: false,
        }),
      );
    }
  }, [debounced, router]);
  function update(patch: Partial<FilterQuery>) {
    hasLocalChange.current = false;
    startTransition(() =>
      router.replace(queryUrl({ ...query, q: search.trim(), ...patch, page: 1 }), {
        scroll: false,
      }),
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3 p-5">
      <div className="relative min-w-48 flex-1">
        <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
        <input
          aria-label="Search applications"
          className="field pl-9 pr-9"
          placeholder="Search company, position, or location…"
          value={search}
          maxLength={160}
          onChange={(event) => {
            hasLocalChange.current = true;
            setSearch(event.target.value);
          }}
        />
        {pending && (
          <Loader2 className="absolute right-3 top-3 size-4 animate-spin text-muted-foreground" />
        )}
      </div>
      <select
        aria-label="Filter by status"
        className="field w-auto"
        value={query.status}
        onChange={(event) => update({ status: event.target.value as FilterQuery["status"] })}
      >
        <option value="ALL">All statuses</option>
        {STATUSES.map((status) => (
          <option value={status} key={status}>
            {statusConfig[status].label}
          </option>
        ))}
      </select>
      <select
        aria-label="Sort applications"
        className="field w-auto"
        value={query.sort}
        onChange={(event) => update({ sort: event.target.value as FilterQuery["sort"] })}
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
      {(query.q || query.status !== "ALL" || query.sort !== "newest") && (
        <Button
          variant="ghost"
          onClick={() => {
            setSearch("");
            update({ q: "", status: "ALL", sort: "newest" });
          }}
        >
          <X />
          Reset
        </Button>
      )}
      <span role="status" className="sr-only">
        {pending ? "Updating applications" : ""}
      </span>
    </div>
  );
}
export function ApplicationPagination({
  query,
  total,
  pageCount,
  pageSize,
}: {
  query: FilterQuery;
  total: number;
  pageCount: number;
  pageSize: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t px-5 py-4">
      <p className="text-xs text-muted-foreground">
        {total
          ? `${(query.page - 1) * pageSize + 1}–${Math.min(query.page * pageSize, total)} of ${total} applications`
          : "0 applications"}
      </p>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          Page {query.page} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="icon"
          disabled={query.page <= 1 || pending}
          aria-label="Previous page"
          onClick={() =>
            startTransition(() =>
              router.push(queryUrl({ ...query, page: query.page - 1 }), { scroll: false }),
            )
          }
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={query.page >= pageCount || pending}
          aria-label="Next page"
          onClick={() =>
            startTransition(() =>
              router.push(queryUrl({ ...query, page: query.page + 1 }), { scroll: false }),
            )
          }
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
