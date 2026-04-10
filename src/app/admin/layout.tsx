import { redirect } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <AppShell role={user.role} userName={`${user.firstName} (admin)`}>
      {children}
    </AppShell>
  );
}
