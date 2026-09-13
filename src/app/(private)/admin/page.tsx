import type { Metadata } from "next";
import { Users, BriefcaseBusiness, Send, MessageSquare } from "lucide-react";
import { getAdminDashboard } from "@/lib/admin";
import { StatusChart } from "@/components/dashboard/status-chart";
import { DailyChart } from "@/components/admin/daily-chart";
export const metadata: Metadata = { title: "Admin overview" };
export default async function AdminPage() {
  const data = await getAdminDashboard();
  return (
    <div className="space-y-7">
      <div>
        <p className="eyebrow mb-2">Administration</p>
        <h1 className="page-title">Workspace overview</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Account activity and applications Applyflow.
        </p>
      </div>
      <section
        aria-label="Platform statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          {
            label: "Total users",
            value: data.totalUsers,
            icon: Users,
            detail: "All accounts, including admins",
          },
          {
            label: "Total job applications",
            value: data.totalApplications,
            icon: BriefcaseBusiness,
            detail: "All users and statuses",
          },
          {
            label: "Applications submitted today",
            value: data.submittedToday,
            icon: Send,
            detail: "Date applied is today (UTC), excluding saved",
          },
          {
            label: "Total interviews",
            value: data.interviews,
            icon: MessageSquare,
            detail: "Currently in Interview status",
          },
        ].map(({ label, value, icon: Icon, detail }) => (
          <div key={label} className="panel p-5">
            <Icon className="mb-4 size-5 text-primary" />
            <p className="text-3xl font-semibold tabular-nums">{value}</p>
            <h2 className="mt-2 text-sm font-medium">{label}</h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
          </div>
        ))}
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        <StatusChart counts={data.counts} total={data.totalApplications} audience="admin" />
        <DailyChart data={data.daily} />
      </div>
    </div>
  );
}
