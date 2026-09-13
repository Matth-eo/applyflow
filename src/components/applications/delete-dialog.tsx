"use client";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteApplication } from "@/actions/applications";
import { Button } from "@/components/ui/button";
import type { ApplicationItem } from "@/types/application";
export function DeleteDialog({ application }: { application: ApplicationItem }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  async function remove() {
    setPending(true);
    try {
      const result = await deleteApplication(application.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Application deleted.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("We couldn’t delete the application. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Delete ${application.position} at ${application.company}`}
        >
          <Trash2 />
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-card p-6 shadow-xl">
          <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Trash2 className="size-5" />
          </div>
          <AlertDialog.Title className="text-xl font-semibold">
            Delete this application?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-3 text-sm leading-6 text-muted-foreground">
            This will permanently delete your {application.position} application at{" "}
            {application.company}, including its notes. This can’t be undone.
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button variant="outline" disabled={pending}>
                Keep application
              </Button>
            </AlertDialog.Cancel>
            <Button variant="destructive" disabled={pending} onClick={remove}>
              {pending && <Loader2 className="animate-spin" />}
              {pending ? "Deleting…" : "Delete application"}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
