import { statusConfig } from "@/utils/status";
import type { Status } from "@/types/application";
import { cn } from "@/lib/utils";
export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium",
        config.className,
      )}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
}
