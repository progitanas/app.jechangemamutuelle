import { redirect } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "USER") redirect("/admin");

  return (
    <AppShell role={user.role} userName={user.firstName}>
      {children}
    </AppShell>
  );
}
