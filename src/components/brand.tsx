import { Layers2 } from "lucide-react";
import { cn } from "@/lib/utils";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
        <Layers2 className="size-5" strokeWidth={2.4} />
      </span>
      <span className={cn("text-xl font-bold tracking-tight", light && "text-white")}>
        Apply<span className={light ? "text-emerald-400" : "text-primary"}>Flow</span>
      </span>
    </span>
  );
}
