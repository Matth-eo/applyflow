export const STATUSES = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "TECHNICAL_EXAM",
  "OFFER",
  "REJECTED",
] as const;
export type Status = (typeof STATUSES)[number];
export type ApplicationItem = {
  id: string;
  company: string;
  position: string;
  location: string;
  jobUrl: string;
  salary: string | null;
  appliedDate: string;
  status: Status;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
export type ActionResult = { success: true } | { success: false; error: string };
