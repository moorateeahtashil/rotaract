import { requireMember } from "@/lib/auth/guards";
import { createServerClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, FolderKanban, Users, User, Settings, Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const guard = await requireMember();
  if ("redirect" in guard) return redirect(guard.redirectTo);

  const supabase = createServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", guard.userId)
    .single();

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("user_id", guard.userId)
    .single();

  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*")
    .gte("date", new Date().toISOString())
    .in("status", ["published", "ongoing"])
    .is("deleted_at", null)
    .order("date", { ascending: true })
    .limit(3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">My Profile</h1>
        <p className="text-pewter mt-1">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile ? `${profile.first_name} ${profile.last_name}` : ""} />
              <AvatarFallback className="text-xl bg-rotary-blue text-white">
                {profile ? `${profile.first_name[0]}${profile.last_name[0]}` : "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">
                {profile?.first_name} {profile?.last_name}
              </CardTitle>
              {member?.classification && (
                <p className="text-sm text-pewter">{member.classification}</p>
              )}
              {member?.status && (
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-medium ${
                  member.status === "active" ? "bg-green-100 text-green-700" :
                  member.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {member.status}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">First Name</label>
                <input
                  type="text"
                  defaultValue={profile?.first_name || ""}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30 focus:border-rotary-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Last Name</label>
                <input
                  type="text"
                  defaultValue={profile?.last_name || ""}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30 focus:border-rotary-blue"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
              <input
                type="email"
                defaultValue={profile?.email || ""}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30 focus:border-rotary-blue"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Phone</label>
                <input
                  type="tel"
                  defaultValue={profile?.phone || ""}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30 focus:border-rotary-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Occupation</label>
                <input
                  type="text"
                  defaultValue={profile?.occupation || ""}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30 focus:border-rotary-blue"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Bio</label>
              <textarea
                rows={3}
                defaultValue={profile?.bio || ""}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30 focus:border-rotary-blue"
              />
            </div>
            <Button className="bg-rotary-blue hover:bg-rotary-blue/90">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      {/* Stats */}
      {member && (
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-6 w-6 text-rotary-blue mx-auto mb-2" />
              <div className="text-2xl font-bold text-charcoal">{member.total_service_hours || 0}</div>
              <div className="text-sm text-pewter">Service Hours</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <FolderKanban className="h-6 w-6 text-rotary-blue mx-auto mb-2" />
              <div className="text-2xl font-bold text-charcoal">{member.total_projects || 0}</div>
              <div className="text-sm text-pewter">Projects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-6 w-6 text-rotary-blue mx-auto mb-2" />
              <div className="text-2xl font-bold text-charcoal">{member.total_events || 0}</div>
              <div className="text-sm text-pewter">Events</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Social Links */}
      {member && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Social Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">LinkedIn</label>
                <input
                  type="url"
                  defaultValue={member.social_linkedin || ""}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30 focus:border-rotary-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Instagram</label>
                <input
                  type="url"
                  defaultValue={member.social_instagram || ""}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30 focus:border-rotary-blue"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
