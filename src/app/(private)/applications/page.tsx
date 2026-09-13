import type { Metadata } from "next";
import { requirePersonalUser } from "@/lib/session";
import { getApplications, parseQuery, PAGE_SIZE } from "@/lib/applications";
import { ApplicationDialog } from "@/components/applications/application-dialog";
import { ApplicationTable } from "@/components/applications/application-table";
import {
  ApplicationFilters,
  ApplicationPagination,
} from "@/components/applications/application-filters";
export const metadata: Metadata = { title: "Applications" };
export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePersonalUser();
  const query = parseQuery(await searchParams);
  const { rows, total, pageCount, page } = await getApplications(query);
  const currentQuery = { ...query, page };
  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Your opportunity hub</p>
          <h1 className="page-title">Applications</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Every opportunity. Every next step. All together.
          </p>
        </div>
        <ApplicationDialog />
      </div>
      <section className="panel overflow-hidden" aria-label="Application manager">
        <ApplicationFilters query={currentQuery} />
        <ApplicationTable data={rows} filtered={!!query.q || query.status !== "ALL"} />
        <ApplicationPagination
          query={currentQuery}
          total={total}
          pageCount={pageCount}
          pageSize={PAGE_SIZE}
        />
      </section>
    </>
  );
}
