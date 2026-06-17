import { requireMember } from "@/lib/auth/guards";
import { createServerClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import { DirectoryList } from "./directory-list";

export const metadata = { title: "Member Directory" };

export default async function MemberDirectoryPage() {
  const guard = await requireMember();
  if ("redirectTo" in guard) return redirect(guard.redirectTo as string);

  const supabase = await createServerClient() as any;

  const { data: members } = await supabase
    .from("members")
    .select(
      `
      *,
      profile:profiles(first_name, last_name, avatar_url, occupation, company, email)
    `,
    )
    .eq("show_in_directory", true)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("join_date", { ascending: false });

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
