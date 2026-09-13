import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div role="status" aria-label="Loading overview" className="space-y-9">
      <span className="sr-only">Loading your overview…</span>
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-80 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
        <Skeleton className="h-20 rounded-xl xl:col-span-2" />
        <Skeleton className="h-96 rounded-2xl sm:h-64" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}
