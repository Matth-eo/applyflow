import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Bookmark,
  ChartNoAxesCombined,
  FileText,
  Layers2,
  LayoutDashboard,
  ListFilter,
  ShieldCheck,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { LoginDialog } from "@/components/login-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { statusConfig } from "@/utils/status";

export const metadata: Metadata = {
  title: "Job Application Tracker",
  description:
    "Organize the jobs you apply to. Track application statuses, store interview notes, and see your progress in one private workspace with ApplyFlow.",
};

const examples = [
  {
    company: "Northstar",
    initials: "N",
    position: "Frontend Engineer",
    location: "Remote",
    status: "INTERVIEW",
    date: "Sep 10",
    note: "Review team interview notes",
  },
  {
    company: "Orbit Studio",
    initials: "O",
    position: "Product Designer",
    location: "Manila",
    status: "APPLIED",
    date: "Sep 08",
    note: "Portfolio link included",
  },
  {
    company: "Forma",
    initials: "F",
    position: "Software Engineer",
    location: "Hybrid",
    status: "SAVED",
    date: "Sep 07",
    note: "Tailor resume before applying",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-5 sm:px-8">
        <Link href="/" aria-label="ApplyFlow home">
          <Brand />
        </Link>
        <nav aria-label="Public navigation" className="flex items-center gap-1 sm:gap-3">
          <ThemeToggle />
          <LoginDialog />
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/register">
              Create account <ArrowRight />
            </Link>
          </Button>
        </nav>
      </header>
      <main>
        <section
          aria-labelledby="hero-title"
          className="relative mx-auto max-w-6xl px-5 pb-10 pt-14 text-center sm:px-8 sm:pb-14 sm:pt-20"
        >
          <h1
            id="hero-title"
            className="mx-auto mt-6 max-w-4xl text-[2.6rem] font-semibold leading-[1.08] tracking-[-0.055em] sm:text-6xl lg:text-[5rem]"
          >
            Track every application.
            <br />
            <span className="text-primary">Stay on top of every opportunity.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            A home for the jobs you apply to. Organize applications, update their status, and keep
            your notes together.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="h-12 rounded-xl px-6">
              <Link href="/register">
                Start tracking applications <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="h-12 rounded-xl px-5">
              <a href="#workspace-preview">
                See the workspace <ArrowDown />
              </a>
            </Button>
          </div>
          <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            Your applications. Your private workspace.
          </p>
        </section>
        <section
          id="workspace-preview"
          aria-labelledby="preview-title"
          className="mx-auto max-w-6xl scroll-mt-6 px-5 sm:px-8"
        >
          <div className="rounded-[1.4rem] border border-border/60 bg-muted/60 p-1.5 shadow-[0_30px_80px_-45px_rgba(16,31,44,0.4)] sm:p-2">
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
              <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
                <div aria-hidden="true" className="flex gap-1.5">
                  <span className="size-2 rounded-full bg-muted-foreground/25" />
                  <span className="size-2 rounded-full bg-muted-foreground/25" />
                  <span className="size-2 rounded-full bg-muted-foreground/25" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  ApplyFlow / Applications
                </span>
                <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
                  Sample data
                </span>
              </div>
              <div className="flex">
                <aside
                  aria-label="Example navigation"
                  className="hidden w-44 shrink-0 bg-[#101f2c] p-4 text-slate-400 lg:block"
                >
                  <div className="mb-9 mt-2 flex items-center gap-2 text-sm font-semibold text-white">
                    <Layers2 className="size-5 text-emerald-400" />
                    ApplyFlow
                  </div>
                  <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.16em]">
                    Workspace
                  </p>
                  <p className="flex items-center gap-2 px-2 py-2.5 text-xs">
                    <LayoutDashboard className="size-3.5" />
                    Overview
                  </p>
                  <p className="flex items-center gap-2 rounded-lg bg-emerald-400/10 px-2 py-2.5 text-xs font-medium text-emerald-300">
                    <Bookmark className="size-3.5" />
                    Applications
                  </p>
                  <div className="mt-24 border-t border-white/10 pt-4 text-[11px]">
                    Your personal workspace
                  </div>
                </aside>
                <div className="min-w-0 flex-1 p-4 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Everything in one view
                      </p>
                      <h2
                        id="preview-title"
                        className="text-xl font-semibold tracking-tight sm:text-2xl"
                      >
                        Your applications, organized.
                      </h2>
                    </div>
                    <span className="hidden rounded-lg border border-border/70 px-3 py-2 text-xs text-muted-foreground sm:inline-flex">
                      3 applications
                    </span>
                  </div>
                  <div className="mb-2 mt-6 flex items-center justify-between border-b border-border/60 text-xs">
                    <span className="border-b-2 border-primary pb-3 font-medium text-primary">
                      All applications{" "}
                      <span className="ml-1.5 rounded bg-primary/10 px-1.5 py-0.5">3</span>
                    </span>
                    <span className="flex items-center gap-1.5 pb-3 text-muted-foreground">
                      <ListFilter className="size-3.5" />
                      By newest
                    </span>
                  </div>
                  <div className="divide-y divide-border/60">
                    {examples.map(
                      ({ company, initials, position, location, status, date, note }) => (
                        <div
                          key={company}
                          className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_110px_50px] sm:items-center sm:gap-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/60 text-sm font-semibold">
                              {initials}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold">{position}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {company} <span className="px-1 text-muted-foreground/50">/</span>{" "}
                                {location}
                              </p>
                              <p className="mt-1.5 text-[11px] text-muted-foreground">{note}</p>
                            </div>
                          </div>
                          <span
                            className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-medium ${statusConfig[status].className}`}
                          >
                            {statusConfig[status].label}
                          </span>
                          <span className="hidden text-right text-[11px] tabular-nums text-muted-foreground sm:block">
                            {date}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                  <p className="mt-3 text-[10px] text-muted-foreground">
                    Illustrative workspace with fictional applications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          aria-label="Tracking features"
          className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-3 md:gap-10"
        >
          {[
            {
              icon: Bookmark,
              title: "Keep every application",
              description: "Save the company, role, job link, and date in one searchable list.",
            },
            {
              icon: ChartNoAxesCombined,
              title: "See where things stand",
              description:
                "Track each status, from saved and applied to interview, offer, or rejected.",
            },
            {
              icon: FileText,
              title: "Keep the details close",
              description:
                "Store interview notes, salary details, and useful context with each application.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title}>
              <Icon className="mb-4 size-5 text-primary" />
              <h2 className="text-base font-semibold tracking-tight">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-border/60 px-5 py-6 text-xs text-muted-foreground sm:px-8">
        <span>ApplyFlow · Job application tracking, simplified.</span>
        <Link href="/login" className="transition-colors hover:text-primary">
          Sign in to your workspace ↗
        </Link>
      </footer>
    </div>
  );
}
