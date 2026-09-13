import type { Metadata } from "next";
import { parseQuery } from "@/lib/applications";
import { AdminApplicationList } from "@/components/admin/application-list";
export const metadata: Metadata = { title: "All applications" };
export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseQuery(await searchParams);
  return (
    <>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">All applications</h1>
      <p className="mb-7 text-sm text-muted-foreground">
        Review opportunities across every account.
      </p>
      <AdminApplicationList query={query} path="/admin/applications" />
    </>
  );
}
