import { z } from "zod";
import { STATUSES } from "@/types/application";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(254);
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(128, "Password is too long."),
});
export const registerSchema = loginSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters.")
    .max(80, "Use 80 characters or fewer."),
  password: z
    .string()
    .min(12, "Use at least 12 characters.")
    .max(72, "Use 72 characters or fewer.")
    .refine(
      (value) => new TextEncoder().encode(value).length <= 72,
      "Password must fit within 72 UTF-8 bytes.",
    ),
});
export const applicationSchema = z.object({
  company: z
    .string()
    .trim()
    .min(1, "Enter a company name.")
    .max(120, "Use 120 characters or fewer."),
  position: z.string().trim().min(1, "Enter a position.").max(160, "Use 160 characters or fewer."),
  location: z
    .string()
    .trim()
    .min(1, "Enter a location or Remote.")
    .max(160, "Use 160 characters or fewer."),
  jobUrl: z
    .string()
    .trim()
    .min(1, "Enter the job posting URL.")
    .max(2048, "URL is too long.")
    .url("Enter a valid URL, including https://.")
    .refine((value) => /^https?:\/\//i.test(value), "Use an http:// or https:// URL."),
  salary: z.string().trim().max(120, "Use 120 characters or fewer."),
  appliedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.")
    .refine((value) => {
      const date = new Date(value);
      return (
        !isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value &&
        value >= "1900-01-01" &&
        value <= "2100-12-31"
      );
    }, "Choose a valid date between 1900 and 2100."),
  status: z.enum(STATUSES, { errorMap: () => ({ message: "Choose a valid status." }) }),
  notes: z.string().trim().max(10000, "Notes must be 10,000 characters or fewer."),
});
export type ApplicationInput = z.infer<typeof applicationSchema>;
