"use client";

import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function LoginDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Log in</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-6 sm:p-8">
        <p className="eyebrow mb-3">Your workspace awaits</p>
        <DialogTitle className="text-3xl font-semibold tracking-tight">Welcome back</DialogTitle>
        <DialogDescription className="mb-7 mt-3 text-sm leading-6 text-muted-foreground">
          Sign in to pick up where you left off.
        </DialogDescription>
        <AuthForm mode="login" showHeading={false} />
        <p className="mt-5 text-center">
          <Link
            href="/login"
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Open the sign-in page
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
}
