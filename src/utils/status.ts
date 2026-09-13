import type { Status } from "@/types/application";
export const statusConfig: Record<Status, { label: string; color: string; className: string }> = {
  SAVED: {
    label: "Saved",
    color: "#94a3b8",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  APPLIED: {
    label: "Applied",
    color: "#4f7df3",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  INTERVIEW: {
    label: "Interview",
    color: "#9970ec",
    className: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  TECHNICAL_EXAM: {
    label: "Technical exam",
    color: "#efab3d",
    className: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  OFFER: {
    label: "Offer",
    color: "#14a38b",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  REJECTED: {
    label: "Rejected",
    color: "#ee7583",
    className: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  },
};
