import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div role="status" aria-label="Loading workspace" className="space-y-7">
      <span className="sr-only">Loading your workspace…</span>
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="h-56" />
        <div className="space-y-5">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}
