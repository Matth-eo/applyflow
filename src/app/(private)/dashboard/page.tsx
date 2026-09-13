import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  CheckCheck,
  Code2,
  MessageSquare,
  Send,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { requirePersonalUser } from "@/lib/session";
import { getDashboard } from "@/lib/applications";
import { cn } from "@/lib/utils";
import { statusConfig } from "@/utils/status";
import { StatusChart } from "@/components/dashboard/status-chart";
import { RecentApplications } from "@/components/dashboard/recent-applications";
import { ApplicationDialog } from "@/components/applications/application-dialog";
export const metadata: Metadata = { title: "Overview" };
const icons = {
  SAVED: Bookmark,
  APPLIED: Send,
  INTERVIEW: MessageSquare,
  TECHNICAL_EXAM: Code2,
  OFFER: CheckCheck,
  REJECTED: XCircle,
};

export default async function DashboardPage() {
  const user = await requirePersonalUser();
  const { total, counts, recent, thisWeek } = await getDashboard();
  const progressed = counts.INTERVIEW + counts.TECHNICAL_EXAM + counts.OFFER;
  const submitted = total - counts.SAVED;
  const progressRate = submitted ? Math.round((progressed / submitted) * 100) : 0;
  const active = counts.APPLIED + counts.INTERVIEW + counts.TECHNICAL_EXAM;
  return (
    <div className="space-y-9 sm:space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="eyebrow mb-3">Your next chapter</p>
          <h1 className="page-title">
            Welcome back, {user.name.split(" ")[0]}
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            A clear view of your opportunities and your next steps.
          </p>
        </div>
        <ApplicationDialog />
      </header>
      <section
        aria-label="Application statistics"
        className="grid gap-5 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]"
      >
        <Link
          href="/applications"
          className="group flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#101f2c] px-5 py-4 text-white transition-colors duration-200 hover:bg-[#162d3d] sm:px-6 xl:col-span-2"
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <p className="text-sm font-medium text-slate-300">Total Applications</p>
            <p className="metric-value text-3xl sm:text-4xl">{total}</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-medium text-emerald-300">
            All opportunities
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </Link>
        <section
          aria-labelledby="pipeline-title"
          className="quiet-surface min-w-0 overflow-hidden border border-border/50"
        >
          <div className="px-5 pb-5 pt-6 sm:px-6">
            <h2 id="pipeline-title" className="section-title">
              Application Pipeline
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              From first interest to next chapter
            </p>
          </div>
          <div className="grid grid-cols-2 border-t border-border/60 sm:grid-cols-4">
            {(["SAVED", "APPLIED", "INTERVIEW", "TECHNICAL_EXAM"] as const).map((status) => {
              const Icon = icons[status];
              return (
                <Link
                  key={status}
                  href={`/applications?status=${status}`}
                  className="group min-w-0 px-5 py-5 transition-colors duration-200 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary [&:nth-child(even)]:border-l [&:nth-child(n+3)]:border-t [&:nth-child(n+3)]:border-border/60 sm:px-6 sm:py-6 sm:[&:nth-child(n+2)]:border-l sm:[&:nth-child(n+3)]:border-t-0"
                >
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg",
                        statusConfig[status].className,
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <ArrowUpRight className="size-3.5 text-muted-foreground/40 transition-colors group-hover:text-primary" />
                  </div>
                  <span className="metric-value block text-3xl">{counts[status]}</span>
                  <span className="mt-1.5 block text-sm font-medium leading-5 text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                    {statusConfig[status].label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
        <section
          aria-labelledby="outcomes-title"
          className="quiet-surface min-w-0 overflow-hidden border border-border/50"
        >
          <div className="px-5 pb-5 pt-6 sm:px-6">
            <h2 id="outcomes-title" className="section-title">
              Application Outcomes
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Decisions along the way.</p>
          </div>
          <div className="grid grid-cols-2 border-t border-border/60 divide-x divide-border/60">
            {(["OFFER", "REJECTED"] as const).map((status) => {
              const Icon = icons[status];
              return (
                <Link
                  key={status}
                  href={`/applications?status=${status}`}
                  className="group min-w-0 px-5 py-5 transition-colors duration-200 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-6 sm:py-6"
                >
                  <span
                    className={cn(
                      "mb-4 flex size-8 items-center justify-center rounded-lg",
                      statusConfig[status].className,
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="metric-value block text-3xl">{counts[status]}</span>
                  <span className="mt-1.5 block text-sm font-medium leading-5 text-muted-foreground group-hover:text-foreground">
                    {statusConfig[status].label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        <StatusChart counts={counts} total={total} />
        <section
          aria-labelledby="progress-title"
          className="quiet-surface min-w-0 border border-border/50 p-5 sm:p-6"
        >
          <div className="mb-3">
            <h2 id="progress-title" className="section-title">
              Progress Insights
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The small steps that keep you moving.
            </p>
          </div>
          <dl className="mt-6 space-y-3">
            {[
              {
                icon: CalendarDays,
                label: "Added this week",
                description: "Today and the previous 6 UTC calendar days",
                value: thisWeek,
                unit: "applications",
              },
              {
                icon: TrendingUp,
                label: "In progress",
                description: "Applied, interview, and technical exam",
                value: active,
                unit: "opportunities",
              },
              {
                icon: Target,
                label: "Moving forward",
                description: "Interview, exam, or offer ÷ non-saved jobs",
                value: `${progressRate}%`,
                unit: "of submitted",
              },
            ].map(({ icon: Icon, label, description, value, unit }) => (
              <div
                key={label}
                className="flex flex-wrap items-center gap-3 rounded-xl bg-muted/50 p-4 sm:gap-4"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-primary">
                  <Icon className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <dt className="text-sm font-medium">{label}</dt>
                  <dd className="mt-1 text-xs leading-5 text-muted-foreground">{description}</dd>
                </div>
                <div className="shrink-0 text-right">
                  <dd className="metric-value text-2xl sm:text-3xl">
                    {value}
                    <span className="sr-only"> {unit}</span>
                  </dd>
                  <span aria-hidden="true" className="block text-xs text-muted-foreground">
                    {unit}
                  </span>
                </div>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <RecentApplications applications={recent} />
      <p className="pb-2 text-center text-xs leading-5 text-muted-foreground">
        Progress looks different every day. Keep your notes up to date, follow up thoughtfully, and
        give yourself credit for showing up.
      </p>
    </div>
  );
}
