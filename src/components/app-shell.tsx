"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
} from "lucide-react";
import { logout } from "@/actions/auth";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type User = { name: string; email: string; role: "USER" | "ADMIN" };
const userNavigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/applications", label: "Applications", icon: BriefcaseBusiness },
];
const adminNavigation = [
  { href: "/admin", label: "Admin overview", icon: ShieldCheck },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/applications", label: "All applications", icon: BriefcaseBusiness },
];
function isActive(pathname: string, href: string) {
  return pathname === href || (href === "/admin/users" && pathname.startsWith("/admin/users/"));
}

function Navigation({ user, close }: { user: User; close?: () => void }) {
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN";
  const links = isAdmin ? adminNavigation : userNavigation;
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-[#101f2c] px-4 pb-4 pt-8 text-slate-300">
      <Link
        href={isAdmin ? "/admin" : "/dashboard"}
        onClick={close}
        className="mb-11 self-start px-3"
      >
        <Brand light />
      </Link>
      <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {isAdmin ? "Administration" : "Workspace"}
      </p>
      <nav aria-label="Main navigation" className="space-y-1.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={close}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 hover:bg-white/[0.04] hover:text-white",
                active && "bg-emerald-400/[0.09] text-emerald-300 hover:bg-emerald-400/[0.12]",
              )}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute -left-4 h-5 w-0.5 rounded-r bg-emerald-400"
                />
              )}
              <Icon
                strokeWidth={1.7}
                className={cn(
                  "size-[18px] shrink-0",
                  !active && "text-slate-400 group-hover:text-slate-200",
                )}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-12">
        {!isAdmin && (
          <div className="mb-7 px-3">
            <p className="text-xs font-medium text-slate-300">One step at a time.</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Every application brings your next chapter a little closer.
            </p>
            <Link
              href="/applications"
              onClick={close}
              className="mt-3 inline-flex items-center gap-1 text-xs text-slate-400 transition-colors duration-200 hover:text-emerald-300"
            >
              Keep moving forward
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        )}
        <div className="border-t border-white/[0.07] px-2 pt-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-xs font-semibold tracking-wide text-emerald-200">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-100">{user.name}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {isAdmin ? "Administrator" : "Personal account"}
              </p>
            </div>
          </div>
          <p className="mt-3 truncate text-xs text-slate-400" title={user.email}>
            {user.email}
          </p>
          <form action={logout}>
            <button className="mt-3 flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-xs text-slate-400 transition-colors duration-200 hover:bg-white/[0.04] hover:text-white">
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children, user }: { children: React.ReactNode; user: User }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = user.role === "ADMIN";
  const links = isAdmin ? adminNavigation : userNavigation;
  const title =
    links.find((link) => isActive(pathname, link.href))?.label ??
    (isAdmin ? "Administration" : "Overview");
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:not-sr-only focus:rounded focus:bg-card focus:p-3"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:block">
        <Navigation user={user} />
      </aside>
      <div className="min-w-0 lg:pl-60">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-border/50 px-4 sm:px-8 xl:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </Button>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {isAdmin ? "Administration" : "Workspace"}
            </span>
            <span aria-hidden="true" className="hidden text-border sm:inline">
              /
            </span>
            <span className="truncate text-sm font-medium">{title}</span>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:inline-flex">
              <span className="size-1.5 rounded-full bg-primary" />
              {isAdmin ? "Admin workspace" : "Personal workspace"}
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main
          id="main-content"
          className="mx-auto min-w-0 max-w-[1520px] px-4 py-7 sm:px-8 sm:py-9 xl:px-10 xl:py-10"
        >
          {children}
        </main>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="left-0 top-0 h-dvh max-h-dvh w-72 max-w-[calc(100%-2rem)] translate-x-0 translate-y-0 rounded-none border-0 bg-[#101f2c] p-0 text-white">
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <DialogDescription className="sr-only">
            Navigate your workspace and manage your session.
          </DialogDescription>
          <Navigation user={user} close={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
