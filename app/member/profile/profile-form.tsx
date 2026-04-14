"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Clock, FolderKanban, Calendar, Save } from "lucide-react";
import { createClient } from "@/lib/db/browser-client";

const ALL_ROLES: Record<string, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "bg-red-100 text-red-700 border-red-200" },
  admin: { label: "Admin", color: "bg-orange-100 text-orange-700 border-orange-200" },
  president: { label: "President", color: "bg-blue-100 text-blue-700 border-blue-200" },
  secretary: { label: "Secretary", color: "bg-blue-100 text-blue-700 border-blue-200" },
  board_member: { label: "Board Member", color: "bg-green-100 text-green-700 border-green-200" },
  event_manager: { label: "Event Manager", color: "bg-teal-100 text-teal-700 border-teal-200" },
  membership_director: { label: "Membership Director", color: "bg-purple-100 text-purple-700 border-purple-200" },
  project_director: { label: "Project Director", color: "bg-purple-100 text-purple-700 border-purple-200" },
  public_image_director: { label: "PI Director", color: "bg-purple-100 text-purple-700 border-purple-200" },
  member: { label: "Member", color: "bg-gray-100 text-gray-700 border-gray-200" },
  applicant: { label: "Applicant (Pending Approval)", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
};

type Profile = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  bio?: string;
  occupation?: string;
  company?: string;
  avatar_url?: string;
} | null;

type Member = {
  total_service_hours?: number;
  total_projects?: number;
  total_events?: number;
  status?: string;
  classification?: string;
  member_number?: string;
  social_linkedin?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_twitter?: string;
} | null;

export function ProfileForm({ profile, member, roles }: { profile: Profile; member: Member; roles: string[] }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    phone: profile?.phone || "",
    bio: profile?.bio || "",
    occupation: profile?.occupation || "",
    company: profile?.company || "",
    social_linkedin: member?.social_linkedin || "",
    social_instagram: member?.social_instagram || "",
    social_facebook: member?.social_facebook || "",
    social_twitter: member?.social_twitter || "",
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
          bio: formData.bio || null,
          occupation: formData.occupation || null,
          company: formData.company || null,
        })
        .eq("user_id", profile?.user_id);

      if (profileError) throw profileError;

      if (member) {
        const { error: memberError } = await supabase
          .from("members")
          .update({
            social_linkedin: formData.social_linkedin || null,
            social_instagram: formData.social_instagram || null,
            social_facebook: formData.social_facebook || null,
            social_twitter: formData.social_twitter || null,
          })
          .eq("user_id", profile?.user_id);

        if (memberError) throw memberError;
      }

      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to save profile" });
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30 focus:border-rotary-blue";

  return (
    <>
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="text-xl bg-rotary-blue text-white">
                {profile ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">
                {profile?.first_name} {profile?.last_name}
              </CardTitle>
              {member?.classification && (
                <p className="text-sm text-pewter">{member.classification}</p>
              )}
              {member?.member_number && (
                <p className="text-xs text-pewter">Member #{member.member_number}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-1">
                {roles.map((role) => {
                  const r = ALL_ROLES[role];
                  if (!r) return null;
                  return (
                    <Badge key={role} variant="outline" className={`text-xs ${r.color}`}>
                      {r.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
              <input
                type="email"
                value={profile?.email || ""}
                readOnly
                className={`${inputClass} bg-gray-50 text-pewter cursor-not-allowed`}
              />
              <p className="text-xs text-pewter mt-1">Email cannot be changed here. Contact an admin.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Occupation</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Company / Organization</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Bio</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className={inputClass}
                placeholder="Tell us a bit about yourself..."
              />
            </div>
            <Button type="submit" className="bg-rotary-blue hover:bg-rotary-blue/90" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
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
              <div className="text-sm text-pewter">Events Attended</div>
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
            <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={formData.social_linkedin}
                  onChange={(e) => setFormData({ ...formData, social_linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Instagram</label>
                <input
                  type="url"
                  value={formData.social_instagram}
                  onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Facebook</label>
                <input
                  type="url"
                  value={formData.social_facebook}
                  onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">X / Twitter</label>
                <input
                  type="url"
                  value={formData.social_twitter}
                  onChange={(e) => setFormData({ ...formData, social_twitter: e.target.value })}
                  placeholder="https://x.com/..."
                  className={inputClass}
                />
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
