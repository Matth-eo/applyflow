"use client";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      role="alert"
      className="panel mx-auto flex max-w-xl flex-col items-center p-10 text-center"
    >
      <TriangleAlert className="mb-4 size-9 text-amber-500" />
      <h1 className="text-xl font-semibold">We couldn’t load your workspace.</h1>
      <p className="my-3 text-sm leading-6 text-muted-foreground">
        There may be a temporary connection issue. Your saved applications have not been changed.
      </p>
      <Button onClick={reset} className="mt-3">
        Try again
      </Button>
    </div>
  );
}
