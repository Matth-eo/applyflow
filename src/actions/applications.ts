"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { applicationSchema } from "@/lib/validations";
import type { ActionResult } from "@/types/application";

function refresh() {
  revalidatePath("/dashboard");
  revalidatePath("/applications");
}
export async function saveApplication(input: unknown, id?: string): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  if (id !== undefined && !z.string().cuid().safeParse(id).success)
    return { success: false, error: "Invalid application." };
  const data = {
    ...parsed.data,
    appliedDate: new Date(`${parsed.data.appliedDate}T00:00:00.000Z`),
    salary: parsed.data.salary || null,
    notes: parsed.data.notes || null,
  };
  try {
    if (id) {
      const result = await db.application.updateMany({ where: { id, userId: user.id }, data });
      if (!result.count)
        return { success: false, error: "Application not found or no longer available." };
    } else {
      await db.application.create({ data: { ...data, userId: user.id } });
    }
    refresh();
    return { success: true };
  } catch (error) {
    console.error("Save application failed", error instanceof Error ? error.name : "Unknown error");
    return { success: false, error: "Your application couldn’t be saved. Please try again." };
  }
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!z.string().cuid().safeParse(id).success)
    return { success: false, error: "Invalid application." };
  try {
    const result = await db.application.deleteMany({ where: { id, userId: user.id } });
    if (!result.count)
      return { success: false, error: "Application not found or already deleted." };
    refresh();
    return { success: true };
  } catch (error) {
    console.error(
      "Delete application failed",
      error instanceof Error ? error.name : "Unknown error",
    );
    return { success: false, error: "Your application couldn’t be deleted. Please try again." };
  }
}
