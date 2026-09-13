"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { saveApplication } from "@/actions/applications";
import { applicationSchema, type ApplicationInput } from "@/lib/validations";
import { STATUSES, type ApplicationItem } from "@/types/application";
import { statusConfig } from "@/utils/status";
import { todayInput } from "@/utils/date";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ApplicationDialog({
  application,
  trigger,
}: {
  application?: ApplicationItem;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus />
            Add application
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="pr-8 text-xl font-semibold">
          {application ? "Edit application" : "Add an application"}
        </DialogTitle>
        <DialogDescription className="mb-6 mt-2 text-sm text-muted-foreground">
          {application
            ? "Keep your opportunity up to date."
            : "Keep the details together. Take the next step when you’re ready."}
        </DialogDescription>
        <ApplicationForm application={application} close={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
function ApplicationForm({
  application,
  close,
}: {
  application?: ApplicationItem;
  close: () => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: application
      ? {
          company: application.company,
          position: application.position,
          location: application.location,
          jobUrl: application.jobUrl,
          salary: application.salary ?? "",
          appliedDate: application.appliedDate,
          status: application.status,
          notes: application.notes ?? "",
        }
      : {
          company: "",
          position: "",
          location: "",
          jobUrl: "",
          salary: "",
          appliedDate: todayInput(),
          status: "SAVED",
          notes: "",
        },
  });
  async function onSubmit(values: ApplicationInput) {
    setServerError("");
    try {
      const result = await saveApplication(values, application?.id);
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      toast.success(application ? "Application updated." : "Application added. One step forward!");
      close();
      router.refresh();
    } catch {
      setServerError("We couldn’t save your changes. Check your connection and try again.");
    }
  }
  const field = (
    name: keyof ApplicationInput,
    label: string,
    placeholder: string,
    type = "text",
  ) => (
    <div>
      <label htmlFor={`application-${name}`} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={`application-${name}`}
        className="field"
        type={type}
        placeholder={placeholder}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        {...register(name)}
      />
      {errors[name] && (
        <p id={`${name}-error`} className="mt-1 text-sm text-destructive">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <fieldset disabled={isSubmitting} className="space-y-4 disabled:opacity-60">
        <div className="grid gap-4 sm:grid-cols-2">
          {field("company", "Company", "e.g. Linear")}
          {field("position", "Position", "e.g. Frontend Engineer")}
        </div>
        {field("location", "Location", "e.g. Manila, Philippines or Remote")}
        {field("jobUrl", "Job URL", "https://company.com/careers/role", "url")}
        <div className="grid gap-4 sm:grid-cols-2">
          {field("salary", "Salary (optional)", "e.g. ₱80,000–₱100,000 / month")}
          {field("appliedDate", "Date applied", "", "date")}
        </div>
        <p className="text-xs text-muted-foreground">
          For saved jobs, use the date you found the opportunity.
        </p>
        <div>
          <label htmlFor="application-status" className="mb-1.5 block text-sm font-medium">
            Status
          </label>
          <select
            id="application-status"
            className="field"
            {...register("status")}
            aria-invalid={!!errors.status}
            aria-describedby={errors.status ? "status-error" : undefined}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusConfig[status].label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p id="status-error" className="mt-1 text-sm text-destructive">
              {errors.status.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="application-notes" className="mb-1.5 block text-sm font-medium">
            Notes (optional)
          </label>
          <textarea
            id="application-notes"
            className="field min-h-28 resize-y"
            placeholder="Interview details, contacts, or things to remember…"
            {...register("notes")}
            aria-invalid={!!errors.notes}
            aria-describedby={errors.notes ? "notes-error" : undefined}
          />
          {errors.notes && (
            <p id="notes-error" className="mt-1 text-sm text-destructive">
              {errors.notes.message}
            </p>
          )}
        </div>
      </fieldset>
      {serverError && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </p>
      )}
      <div className="flex justify-end gap-3 border-t pt-5">
        <Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? "Saving…" : application ? "Save changes" : "Add application"}
        </Button>
      </div>
    </form>
  );
}
