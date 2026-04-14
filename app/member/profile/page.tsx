import { requireMember } from "@/lib/auth/guards";
import { createServerClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const guard = await requireMember();
  if ("redirectTo" in guard) return redirect(guard.redirectTo as string);

  const supabase = await createServerClient() as any;

  const [
    { data: profile },
    { data: member },
    { data: roles },
    { data: committees },
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
    supabase
      .from("committees")
      .select("id, name")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order"),
  ]);

  // Get this member's committee memberships
  let memberCommitteeIds: string[] = [];
  if (member?.id) {
    const { data: cm } = await supabase
      .from("committee_members")
      .select("committee_id")
      .eq("member_id", member.id)
      .eq("is_active", true);
    memberCommitteeIds = cm?.map((c: any) => c.committee_id) ?? [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">My Profile</h1>
        <p className="text-pewter mt-1">Manage your account information and membership details</p>
      </div>
      <ProfileForm
        profile={profile}
        member={member}
        roles={roles?.map((r: any) => r.role) ?? []}
        committees={committees ?? []}
        memberCommittees={memberCommitteeIds}
      />
    </div>
  );
}
