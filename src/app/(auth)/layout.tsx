import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" aria-label="ApplyFlow home">
          <Brand />
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:py-14">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card sm:p-9">
            {children}
          </div>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">One place for your next move.</p>
      </main>
    </div>
  );
}
