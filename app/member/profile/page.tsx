import { requireMember } from "@/lib/auth/guards";
import { createServerClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const guard = await requireMember();
  if ("redirectTo" in guard) return redirect(guard.redirectTo);

  const supabase = await createServerClient();

  const [
    { data: profile },
    { data: member },
    { data: roles },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", guard.userId)
      .single(),
    supabase
      .from("members")
      .select("*")
      .eq("user_id", guard.userId)
      .single(),
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", guard.userId)
      .eq("is_active", true),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">My Profile</h1>
        <p className="text-pewter mt-1">Manage your account information</p>
      </div>
      <ProfileForm profile={profile} member={member} roles={roles?.map((r: any) => r.role) ?? []} />
    </div>
  );
}
