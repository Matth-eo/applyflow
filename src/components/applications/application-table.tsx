"use client";
import { useMemo } from "react";
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";
import { BriefcaseBusiness, ExternalLink, Pencil, SearchX } from "lucide-react";
import type { ApplicationItem } from "@/types/application";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { ApplicationDialog } from "@/components/applications/application-dialog";
import { DeleteDialog } from "@/components/applications/delete-dialog";
import { displayDate } from "@/utils/date";

export function CompanyCell({ application }: { application: ApplicationItem }) {
  return (
    <div className="flex min-w-48 max-w-full items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted text-sm font-semibold text-muted-foreground">
        {application.company.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="max-w-64 truncate font-medium" title={application.company}>
          {application.company}
        </p>
        <p
          className="mt-1 max-w-64 truncate text-xs text-muted-foreground"
          title={application.position}
        >
          {application.position}
        </p>
      </div>
    </div>
  );
}
export function ApplicationTable({
  data,
  filtered = false,
}: {
  data: ApplicationItem[];
  filtered?: boolean;
}) {
  const columns = useMemo<ColumnDef<ApplicationItem>[]>(
    () => [
      {
        accessorKey: "company",
        header: "Company & position",
        cell: ({ row }) => <CompanyCell application={row.original} />,
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
          <span
            className="block max-w-44 truncate text-muted-foreground"
            title={row.original.location}
          >
            {row.original.location}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "appliedDate",
        header: "Date applied",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {displayDate(row.original.appliedDate)}
          </span>
        ),
      },
      {
        accessorKey: "salary",
        header: "Salary",
        cell: ({ row }) => (
          <span
            className="block max-w-40 truncate text-muted-foreground"
            title={row.original.salary ?? undefined}
          >
            {row.original.salary || "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
              <a
                href={row.original.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open job posting at ${row.original.company}`}
              >
                <ExternalLink />
              </a>
            </Button>
            <ApplicationDialog
              application={row.original}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  aria-label={`Edit ${row.original.position} at ${row.original.company}`}
                >
                  <Pencil />
                </Button>
              }
            />
            <DeleteDialog application={row.original} />
          </div>
        ),
      },
    ],
    [],
  );
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });
  if (!data.length)
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {filtered ? <SearchX className="size-6" /> : <BriefcaseBusiness className="size-6" />}
        </div>
        <h2 className="text-lg font-semibold">
          {filtered ? "No matching applications" : "Your next chapter starts here"}
        </h2>
        <p className="mb-6 mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {filtered
            ? "Try a different search or status to find what you’re looking for."
            : "Add your first opportunity and give your job search a little more clarity."}
        </p>
        {!filtered && <ApplicationDialog />}
      </div>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">
          Your job applications, with links to edit or delete each application.
        </caption>
        <thead className="border-y bg-muted/40 text-xs text-muted-foreground">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th scope="col" key={header.id} className="px-5 py-3.5 font-medium">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-muted/30">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-5 py-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
