"use server";

import { AuthError } from "next-auth";
import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { loginSchema, registerSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/types/application";

export async function login(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Enter a valid email and password." };
  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError)
      return {
        success: false,
        error:
          "Unable to sign in. Check your details, or try again in 15 minutes if you have made several attempts.",
      };
    console.error("Sign-in failed", error instanceof Error ? error.name : "Unknown error");
    return { success: false, error: "Sign-in is unavailable. Please try again shortly." };
  }
}

export async function register(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  try {
    // Only trust the platform-provided IP on Vercel. Local deployments share a bucket.
    const ip = process.env.VERCEL
      ? ((await headers()).get("x-vercel-forwarded-for") ?? "unknown")
      : "local";
    if (!(await rateLimit(`register:${ip}`, 5, 60)))
      return {
        success: false,
        error: "Too many registration attempts. Please try again in an hour.",
      };
    const { name, email, password } = parsed.data;
    await db.user.create({ data: { name, email, passwordHash: await hash(password, 12) } });
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
      return {
        success: false,
        error: "Unable to create an account with these details. Try signing in instead.",
      };
    console.error("Registration failed", error instanceof Error ? error.name : "Unknown error");
    return { success: false, error: "We couldn’t create your account. Please try again shortly." };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
