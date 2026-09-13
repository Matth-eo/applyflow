"use client";
import { ChartNoAxesCombined } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { STATUSES, type Status } from "@/types/application";
import { statusConfig } from "@/utils/status";
import { cn } from "@/lib/utils";
export function StatusChart({
  counts,
  total,
  appearance = "panel",
  audience = "personal",
}: {
  counts: Record<Status, number>;
  total: number;
  appearance?: "panel" | "quiet";
  audience?: "personal" | "admin";
}) {
  const data = STATUSES.map((status) => ({
    name: statusConfig[status].label,
    value: counts[status],
    color: statusConfig[status].color,
  }));
  return (
    <section
      className={cn(
        "min-w-0",
        appearance === "panel" && "quiet-surface border border-border/50 p-5 sm:p-6",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="section-title">Application Breakdown</h2>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          All time
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {audience === "admin"
          ? "Application statuses across every account."
          : "Where your opportunities stand."}
      </p>
      {total === 0 ? (
        <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-5 py-8 text-center sm:px-6">
          <span className="mb-5 flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ChartNoAxesCombined className="size-6" />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              {audience === "admin"
                ? "No applications to summarize yet"
                : "Your story is just getting started"}
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
              {audience === "admin"
                ? "The breakdown will appear as users add applications to their accounts."
                : "Add your first application to see how your opportunities are taking shape."}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-5 min-[540px]:flex-row lg:flex-col 2xl:flex-row">
          <div
            className="relative h-[190px] w-[190px] shrink-0"
            role="img"
            aria-label={`${total} applications. Counts and percentages by status are listed alongside the chart.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.filter((item) => item.value > 0)}
                  dataKey="value"
                  innerRadius={64}
                  outerRadius={83}
                  paddingAngle={data.filter((item) => item.value > 0).length > 1 ? 3 : 0}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {data
                    .filter((item) => item.value > 0)
                    .map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
                    fontSize: 13,
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="metric-value text-3xl">{total}</span>
              <span className="mt-1 text-xs text-muted-foreground">Total</span>
            </div>
          </div>
          <ul
            className={cn(
              "w-full min-w-0 space-y-3",
              appearance === "quiet" &&
                "lg:grid lg:grid-cols-2 lg:gap-x-5 lg:gap-y-3 lg:space-y-0 xl:block xl:space-y-3",
            )}
          >
            {STATUSES.map((status) => (
              <li
                key={status}
                className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm"
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: statusConfig[status].color }}
                />
                <span className="flex-1 text-muted-foreground">{statusConfig[status].label}</span>
                <span className="font-semibold tabular-nums">{counts[status]}</span>
                <span
                  className={cn(
                    "w-10 text-right text-xs tabular-nums text-muted-foreground",
                    appearance === "quiet" && "lg:sr-only xl:not-sr-only xl:w-10 xl:text-right",
                  )}
                >
                  {Math.round((counts[status] / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
