"use client";
import { Button } from "@/components/ui/button";
export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section role="alert" className="panel p-10 text-center">
      <h1 className="text-xl font-semibold">We couldn’t load the admin workspace.</h1>
      <p className="my-4 text-sm text-muted-foreground">
        Please check your connection and try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}
