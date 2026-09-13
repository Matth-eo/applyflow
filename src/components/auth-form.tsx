"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { login, register as createAccount } from "@/actions/auth";
import { loginSchema, registerSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";

type Values = z.infer<typeof registerSchema>;
export function AuthForm({
  mode,
  showHeading = true,
}: {
  mode: "login" | "register";
  showHeading?: boolean;
}) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  async function onSubmit(values: Values) {
    setError("");
    try {
      const result = await (isRegister ? createAccount(values) : login(values));
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (isRegister) {
        toast.success("Account created. Sign in to start your next chapter.");
        router.push("/login");
      } else {
        router.replace("/dashboard");
        router.refresh();
      }
    } catch {
      setError("We couldn’t connect. Please try again.");
    }
  }
  return (
    <>
      {showHeading && (
        <>
          <p className="eyebrow mb-3">
            {isRegister ? "Make your next move" : "Your workspace awaits"}
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            {isRegister ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mb-8 mt-3 text-sm leading-6 text-muted-foreground">
            {isRegister
              ? "A clearer, calmer job search starts here."
              : "Sign in to pick up where you left off."}
          </p>
        </>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {isRegister && (
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              autoComplete="name"
              className="field"
              placeholder="Alex Morgan"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              {...register("name")}
            />
            {errors.name && (
              <p id="name-error" className="mt-1.5 text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="field"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className="mt-1.5 text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="field pr-12"
              aria-invalid={!!errors.password}
              aria-describedby="password-help"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 top-1 rounded p-2 text-muted-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p
            id="password-help"
            className={`mt-1.5 text-sm ${errors.password ? "text-destructive" : "text-muted-foreground"}`}
          >
            {errors.password?.message ?? (isRegister ? "Use at least 12 characters." : "")}
          </p>
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : null}
          {isSubmitting ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          {!isSubmitting && <ArrowRight />}
        </Button>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground">
        {isRegister ? "Already have an account?" : "New to Applyflow?"}{" "}
        <Link
          className="font-semibold text-primary hover:underline"
          href={isRegister ? "/login" : "/register"}
        >
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </>
  );
}
