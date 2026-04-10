import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "@/components/forms/profile-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Profil</h1>
        <p className="text-sm text-slate-500">
          Mettez à jour vos informations personnelles.
        </p>
      </div>
      <ProfileForm
        email={user.email}
        defaultValues={{
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || "",
          city: user.city || "",
        }}
      />
    </div>
  );
}
