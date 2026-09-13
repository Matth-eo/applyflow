import { requireUser } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <AppShell user={{ name: user.name, email: user.email, role: user.role }}>{children}</AppShell>
  );
}
