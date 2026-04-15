"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Clock, FolderKanban, Calendar, Save, Upload } from "lucide-react";
import { createClient } from "@/lib/db/browser-client";

const ROLE_DISPLAY: Record<string, { label: string; color: string }> = {
  super_admin:        { label: "Super Admin",        color: "bg-red-100 text-red-700 border-red-200" },
  admin:              { label: "Admin",              color: "bg-orange-100 text-orange-700 border-orange-200" },
  board_member:       { label: "Board Member",       color: "bg-blue-100 text-blue-700 border-blue-200" },
  member:             { label: "Member",             color: "bg-green-100 text-green-700 border-green-200" },
  prospective_member: { label: "Prospective Member", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  normal:             { label: "Member",             color: "bg-gray-100 text-gray-700 border-gray-200" },
  // Legacy
  president:             { label: "President",          color: "bg-blue-100 text-blue-700 border-blue-200" },
  secretary:             { label: "Secretary",          color: "bg-blue-100 text-blue-700 border-blue-200" },
  public_image_director: { label: "PI Director",        color: "bg-purple-100 text-purple-700 border-purple-200" },
  membership_director:   { label: "Membership Director",color: "bg-purple-100 text-purple-700 border-purple-200" },
  project_director:      { label: "Project Director",   color: "bg-purple-100 text-purple-700 border-purple-200" },
  event_manager:         { label: "Event Manager",      color: "bg-teal-100 text-teal-700 border-teal-200" },
  applicant:             { label: "Pending Approval",   color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
};

type Profile = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  bio?: string;
  short_bio?: string;
  occupation?: string;
  company?: string;
  avatar_url?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  year_of_service?: string;
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

type Committee = {
  id: string;
  name: string;
};

export function ProfileForm({
  profile,
  member,
  roles,
  committees,
  memberCommittees,
}: {
  profile: Profile;
  member: Member;
  roles: string[];
  committees?: Committee[];
  memberCommittees?: string[];
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [formData, setFormData] = useState({
    first_name:    profile?.first_name || "",
    last_name:     profile?.last_name || "",
    phone:         profile?.phone || "",
    bio:           profile?.bio || "",
    short_bio:     profile?.short_bio || "",
    occupation:    profile?.occupation || "",
    company:       profile?.company || "",
    year_of_service: profile?.year_of_service || "",
    address_line_1:  profile?.address_line_1 || "",
    address_line_2:  profile?.address_line_2 || "",
    city:            profile?.city || "",
    state:           profile?.state || "",
    postal_code:     profile?.postal_code || "",
    country:         profile?.country || "India",
    social_linkedin:  member?.social_linkedin || "",
    social_instagram: member?.social_instagram || "",
    social_facebook:  member?.social_facebook || "",
    social_twitter:   member?.social_twitter || "",
  });

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient() as any;
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `avatars/${profile?.user_id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("public")
        .upload(path, file, { cacheControl: "3600", upsert: true });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("public").getPublicUrl(path);
      const url = pub?.publicUrl as string;

      await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("user_id", profile?.user_id);

      setAvatarUrl(url);
      toast({ variant: "success", title: "Photo updated" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Upload failed", description: e.message });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient() as any;
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name:      formData.first_name,
          last_name:       formData.last_name,
          phone:           formData.phone || null,
          bio:             formData.bio || null,
          short_bio:       formData.short_bio || null,
          occupation:      formData.occupation || null,
          company:         formData.company || null,
          year_of_service: formData.year_of_service || null,
          address_line_1:  formData.address_line_1 || null,
          address_line_2:  formData.address_line_2 || null,
          city:            formData.city || null,
          state:           formData.state || null,
          postal_code:     formData.postal_code || null,
          country:         formData.country || "India",
          profile_complete: true,
        })
        .eq("user_id", profile?.user_id);

      if (profileError) throw profileError;

      if (member) {
        const { error: memberError } = await supabase
          .from("members")
          .update({
            social_linkedin:  formData.social_linkedin || null,
            social_instagram: formData.social_instagram || null,
            social_facebook:  formData.social_facebook || null,
            social_twitter:   formData.social_twitter || null,
          })
          .eq("user_id", profile?.user_id);

        if (memberError) throw memberError;
      }

      toast({ variant: "success", title: "Profile updated", description: "Your changes have been saved." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to save profile" });
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30 focus:border-rotary-blue";

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Profile Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-xl bg-rotary-blue text-white">
                  {profile ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              <label className="absolute -bottom-1 -right-1 cursor-pointer">
                <div className="h-6 w-6 rounded-full bg-rotary-blue flex items-center justify-center shadow">
                  <Upload className="h-3 w-3 text-white" />
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
            </div>
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
                  const r = ROLE_DISPLAY[role];
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
          <div className="space-y-4">
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
              <label className="block text-sm font-medium text-charcoal mb-1">Email Address</label>
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
                <label className="block text-sm font-medium text-charcoal mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Year of Service</label>
                <input
                  type="text"
                  value={formData.year_of_service}
                  onChange={(e) => setFormData({ ...formData, year_of_service: e.target.value })}
                  placeholder="e.g. 2024–25"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Classification</label>
                <input
                  type="text"
                  value={member?.classification || ""}
                  readOnly
                  className={`${inputClass} bg-gray-50 text-pewter cursor-not-allowed`}
                />
                <p className="text-xs text-pewter mt-1">Set by an admin.</p>
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
              <label className="block text-sm font-medium text-charcoal mb-1">Short Bio</label>
              <textarea
                rows={2}
                value={formData.short_bio}
                onChange={(e) => setFormData({ ...formData, short_bio: e.target.value })}
                className={inputClass}
                placeholder="A one-line introduction displayed on your member card..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Biography</label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className={inputClass}
                placeholder="Tell the community about yourself..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Address Line 1</label>
            <input
              type="text"
              value={formData.address_line_1}
              onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
              className={inputClass}
              placeholder="Street address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Address Line 2</label>
            <input
              type="text"
              value={formData.address_line_2}
              onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
              className={inputClass}
              placeholder="Apartment, suite, etc."
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">State / Province</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Postal Code</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className={inputClass}
            />
          </div>
        </CardContent>
      </Card>

      {/* Committee Memberships */}
      {committees && committees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Committee Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            {memberCommittees && memberCommittees.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {committees
                  .filter((c) => memberCommittees.includes(c.id))
                  .map((c) => (
                    <Badge key={c.id} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {c.name}
                    </Badge>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-pewter">You are not currently a member of any committee. Contact an admin to be added.</p>
            )}
          </CardContent>
        </Card>
      )}

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
            <CardTitle className="text-base">Social Links</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
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
          </CardContent>
        </Card>
      )}

      <div>
        <Button type="submit" className="bg-rotary-blue hover:bg-rotary-blue/90" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
