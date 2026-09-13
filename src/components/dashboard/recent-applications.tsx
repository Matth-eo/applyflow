import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, ExternalLink, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationDialog } from "@/components/applications/application-dialog";
import { CompanyCell } from "@/components/applications/application-table";
import { StatusBadge } from "@/components/status-badge";
import { displayDate } from "@/utils/date";
import type { ApplicationItem } from "@/types/application";

function RowActions({ application }: { application: ApplicationItem }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
        <a
          href={application.jobUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open job posting at ${application.company}`}
        >
          <ExternalLink />
        </a>
      </Button>
      <ApplicationDialog
        application={application}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label={`Edit ${application.position} at ${application.company}`}
          >
            <Pencil />
          </Button>
        }
      />
    </div>
  );
}
export function RecentApplications({ applications }: { applications: ApplicationItem[] }) {
  return (
    <section aria-labelledby="recent-title">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 id="recent-title" className="section-title">
            Recent Applications
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your latest opportunities, ready for the next step.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="shrink-0 text-primary">
          <Link href="/applications">
            View all
            <ArrowRight />
          </Link>
        </Button>
      </div>
      {applications.length ? (
        <div className="quiet-surface overflow-hidden">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Five most recently added applications</caption>
              <thead className="border-b border-border/60 text-xs text-muted-foreground">
                <tr>
                  {["Company & position", "Location", "Status", "Date applied"].map((label) => (
                    <th key={label} scope="col" className="whitespace-nowrap px-5 py-4 font-medium">
                      {label}
                    </th>
                  ))}
                  <th scope="col" className="pr-5 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {applications.map((application) => (
                  <tr
                    key={application.id}
                    className="transition-colors duration-200 hover:bg-muted/60 focus-within:bg-muted/60"
                  >
                    <td className="px-5 py-5">
                      <CompanyCell application={application} />
                    </td>
                    <td className="px-5 py-5 text-muted-foreground">
                      <span className="block max-w-36 truncate" title={application.location}>
                        {application.location}
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      <StatusBadge status={application.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-5 tabular-nums text-muted-foreground">
                      {displayDate(application.appliedDate)}
                    </td>
                    <td className="pr-4">
                      <RowActions application={application} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-border/60 md:hidden">
            {applications.map((application) => (
              <li
                key={application.id}
                className="px-4 py-5 transition-colors duration-200 hover:bg-muted/50"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <CompanyCell application={application} />
                  <StatusBadge status={application.status} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="min-w-0 text-xs leading-5 text-muted-foreground">
                    <p className="truncate">{application.location}</p>
                    <p>{displayDate(application.appliedDate)}</p>
                  </div>
                  <RowActions application={application} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="quiet-surface flex flex-col items-start gap-5 px-6 py-9 sm:flex-row sm:items-center sm:px-8">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BriefcaseBusiness className="size-5" />
          </span>
          <div className="flex-1">
            <h3 className="text-base font-medium">Make room for your next opportunity</h3>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              Save a role you’re interested in or track an application you’ve already sent.
              Everything you need will stay together here.
            </p>
          </div>
          <ApplicationDialog />
        </div>
      )}
    </section>
  );
}
