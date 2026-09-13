"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center"
    >
      <h1 className="text-2xl font-bold">We couldn’t connect to Applyflow.</h1>
      <p className="text-muted-foreground">Please try again shortly.</p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    </main>
  );
}
