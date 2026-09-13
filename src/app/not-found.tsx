import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center">
      <p className="eyebrow">404 · Page not found</p>
      <h1 className="text-3xl font-bold">Let’s get you back on track.</h1>
      <p className="text-muted-foreground">This page may have moved or no longer exists.</p>
      <Button asChild>
        <Link href="/dashboard">
          <ArrowLeft />
          Back to dashboard
        </Link>
      </Button>
    </main>
  );
}
