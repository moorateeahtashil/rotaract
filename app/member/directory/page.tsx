import { requireMember } from "@/lib/auth/guards";
import { createServerClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import { DirectoryList } from "./directory-list";

export const metadata = { title: "Member Directory" };

export default async function MemberDirectoryPage() {
  const guard = await requireMember();
  if ("redirectTo" in guard) return redirect(guard.redirectTo as string);

  const supabase = await createServerClient() as any;

  const { data: memberRows } = await supabase
    .from("members")
    .select("*")
    .eq("show_in_directory", true)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("join_date", { ascending: false });

  // Manual join — the members→profiles PostgREST embed doesn't resolve
  // (members.user_id references auth.users, not profiles).
  const rows = (memberRows || []) as any[];
  const { data: profiles } = rows.length
    ? await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, avatar_url, occupation, company, email")
        .in("user_id", rows.map((m) => m.user_id).filter(Boolean))
    : { data: [] };
  const profileByUser = new Map<string, any>();
  for (const p of profiles || []) profileByUser.set(p.user_id, p);
  const members = rows.map((m) => ({ ...m, profile: profileByUser.get(m.user_id) || null }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Member Directory</h1>
        <p className="text-pewter mt-1">Connect with fellow Rotaractors</p>
      </div>

      <DirectoryList members={members || []} />
    </div>
  );
}
