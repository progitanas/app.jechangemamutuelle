import { EmptyState } from "@/components/dashboard/empty-state";
import Link from "next/link";

const USER_ROLES = ["USER", "ADMIN"] as const;
type UserRole = (typeof USER_ROLES)[number];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const { q = "", role = "" } = await searchParams;
  const parsedRole = USER_ROLES.includes(role as UserRole)
    ? (role as UserRole)
    : undefined;

  const users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt: string;
  }> = [];

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold tracking-tight">Utilisateurs</h1>
      <form className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher par nom ou email"
          className="min-w-64 flex-1 rounded-xl border border-slate-200 px-4 py-2.5"
        />
        <select
          name="role"
          defaultValue={parsedRole || ""}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="">Tous les roles</option>
          {USER_ROLES.map((currentRole) => (
            <option key={currentRole} value={currentRole}>
              {currentRole}
            </option>
          ))}
        </select>
        <button className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">
          Filtrer
        </button>
        <Link
          href="/admin/users"
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          Réinitialiser
        </Link>
      </form>
      {users.length === 0 ? (
        <EmptyState
          title="Aucun utilisateur"
          description="Aucun resultat pour cette recherche."
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-3 pr-4">Nom</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3">Inscription</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="py-3 pr-4">{user.email}</td>
                    <td className="py-3 pr-4">{user.role}</td>
                    <td className="py-3">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
