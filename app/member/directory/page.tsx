import { requireMember } from "@/lib/auth/guards";
import { createServerClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users } from "lucide-react";

export const metadata = { title: "Member Directory" };

export default async function MemberDirectoryPage() {
  const guard = await requireMember();
  if ("redirectTo" in guard) return redirect(guard.redirectTo);

  const supabase = await createServerClient();

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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pewter" />
        <input
          type="text"
          placeholder="Search by name, occupation, or classification..."
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30 focus:border-rotary-blue"
        />
      </div>

      {/* Members Grid */}
      {!members || members.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-10 w-10 text-pewter mx-auto mb-4" />
            <h3 className="font-semibold text-charcoal mb-1">No members found</h3>
            <p className="text-sm text-pewter">The member directory is currently empty.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member: any) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.profile?.avatar_url || ""} alt={member.profile ? `${member.profile.first_name} ${member.profile.last_name}` : ""} />
                    <AvatarFallback className="bg-rotary-blue text-white text-sm">
                      {member.profile ? `${member.profile.first_name[0]}${member.profile.last_name[0]}` : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-charcoal truncate">
                      {member.profile?.first_name} {member.profile?.last_name}
                    </h3>
                    {member.classification && (
                      <p className="text-sm text-pewter truncate">{member.classification}</p>
                    )}
                    {member.profile?.occupation && (
                      <p className="text-xs text-pewter truncate">{member.profile.occupation}</p>
                    )}
                    {member.profile?.company && (
                      <p className="text-xs text-pewter truncate">{member.profile.company}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
