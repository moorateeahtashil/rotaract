"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/db/browser-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

type SettingsMap = Record<string, string>;

const GENERAL_KEYS = ["club_name", "site_tagline", "contact_email", "contact_phone", "contact_address"];
const FOOTER_KEYS = ["footer_tagline", "footer_about"];
const SOCIAL_KEYS = [
  "social_facebook", "social_instagram", "social_twitter",
  "social_linkedin", "social_youtube", "social_whatsapp",
];

export default function AdminSettingsPage() {
  const supabase = createClient() as any;
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsMap>({});
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("site_settings")
        .select("key,value");
      const map: SettingsMap = {};
      (data || []).forEach((r: any) => (map[r.key] = r.value));
      setSettings(map);
      setLogoUrl(map["site_logo_url"] || "");
    }
    load();
  }, []);

  function update(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function saveGroup(keys: string[], groupLabel: string) {
    setSaving(groupLabel);
    try {
      const META: Record<string, { label: string; group_key: string; description?: string }> = {
        club_name:      { label: "Club Name",           group_key: "general" },
        site_tagline:   { label: "Site Tagline",        group_key: "general" },
        contact_email:  { label: "Contact Email",       group_key: "contact" },
        contact_phone:  { label: "Contact Phone",       group_key: "contact" },
        contact_address:{ label: "Club Address",        group_key: "contact" },
        footer_tagline: { label: "Footer Tagline",      group_key: "footer" },
        footer_about:   { label: "Footer About",        group_key: "footer" },
        social_facebook:  { label: "Facebook URL",      group_key: "social" },
        social_instagram: { label: "Instagram URL",     group_key: "social" },
        social_twitter:   { label: "Twitter/X URL",     group_key: "social" },
        social_linkedin:  { label: "LinkedIn URL",      group_key: "social" },
        social_youtube:   { label: "YouTube URL",       group_key: "social" },
        social_whatsapp:  { label: "WhatsApp URL",      group_key: "social" },
      };

      const rows = keys.map((key) => ({
        key,
        value: settings[key] || "",
        value_type: "string",
        group_key: META[key]?.group_key || "general",
        label: META[key]?.label || key,
        is_public: true,
      }));

      const { error } = await supabase
        .from("site_settings")
        .upsert(rows, { onConflict: "key" });
      if (error) throw error;
      toast({ title: "Saved", description: `${groupLabel} settings updated.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(null);
    }
  }

  async function onUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `logos/site-logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("public").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("public").getPublicUrl(path);
      const publicUrl = pub?.publicUrl as string;

      const { error: setErr } = await supabase.from("site_settings").upsert(
        {
          key: "site_logo_url",
          value: publicUrl,
          value_type: "string",
          group_key: "branding",
          label: "Site Logo URL",
          is_public: true,
        },
        { onConflict: "key" }
      );
      if (setErr) throw setErr;

      setLogoUrl(publicUrl);
      update("site_logo_url", publicUrl);
      toast({ title: "Logo uploaded", description: "Site logo has been updated." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Upload failed", description: e.message });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Site Settings</h1>
        <p className="text-sm text-pewter">Manage global website configuration, footer, and social media links</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Club Name</Label>
                <Input
                  className="mt-1"
                  value={settings["club_name"] || ""}
                  onChange={(e) => update("club_name", e.target.value)}
                  placeholder="Rotaract Club of ..."
                />
              </div>
              <div>
                <Label>Site Tagline</Label>
                <Input
                  className="mt-1"
                  value={settings["site_tagline"] || ""}
                  onChange={(e) => update("site_tagline", e.target.value)}
                  placeholder="Service Above Self"
                />
              </div>
              <Button
                onClick={() => saveGroup(GENERAL_KEYS, "General")}
                disabled={saving === "General"}
                className="bg-rotary-blue hover:bg-rotary-blue/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving === "General" ? "Saving..." : "Save General"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Site Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-12 w-28 border border-border rounded-md bg-white flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt="Site logo" className="max-h-10 w-auto" />
                    ) : (
                      <span className="text-xs text-pewter">No logo</span>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={onUploadLogo}
                    disabled={uploading}
                    className="max-w-xs"
                  />
                </div>
                {uploading && <p className="text-xs text-pewter">Uploading...</p>}
                <p className="text-xs text-pewter mt-1">Recommended: transparent PNG or SVG, height ~36px</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer */}
        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Footer Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Footer Tagline</Label>
                <Input
                  className="mt-1"
                  value={settings["footer_tagline"] || ""}
                  onChange={(e) => update("footer_tagline", e.target.value)}
                  placeholder="Serving Communities, Developing Leaders."
                />
                <p className="text-xs text-pewter mt-1">Short tagline displayed in the website footer.</p>
              </div>
              <div>
                <Label>Footer About Text</Label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={settings["footer_about"] || ""}
                  onChange={(e) => update("footer_about", e.target.value)}
                  placeholder="A brief description of your club for the footer section."
                />
              </div>
              <Button
                onClick={() => saveGroup(FOOTER_KEYS, "Footer")}
                disabled={saving === "Footer"}
                className="bg-rotary-blue hover:bg-rotary-blue/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving === "Footer" ? "Saving..." : "Save Footer"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "social_facebook",  label: "Facebook",   placeholder: "https://facebook.com/yourclub" },
                { key: "social_instagram", label: "Instagram",  placeholder: "https://instagram.com/yourclub" },
                { key: "social_twitter",   label: "Twitter / X",placeholder: "https://x.com/yourclub" },
                { key: "social_linkedin",  label: "LinkedIn",   placeholder: "https://linkedin.com/company/yourclub" },
                { key: "social_youtube",   label: "YouTube",    placeholder: "https://youtube.com/@yourclub" },
                { key: "social_whatsapp",  label: "WhatsApp Group", placeholder: "https://chat.whatsapp.com/..." },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    className="mt-1"
                    type="url"
                    value={settings[key] || ""}
                    onChange={(e) => update(key, e.target.value)}
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <Button
                onClick={() => saveGroup(SOCIAL_KEYS, "Social")}
                disabled={saving === "Social"}
                className="bg-rotary-blue hover:bg-rotary-blue/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving === "Social" ? "Saving..." : "Save Social Links"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Contact Email</Label>
                <Input
                  className="mt-1"
                  type="email"
                  value={settings["contact_email"] || ""}
                  onChange={(e) => update("contact_email", e.target.value)}
                  placeholder="hello@yourclub.org"
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input
                  className="mt-1"
                  type="tel"
                  value={settings["contact_phone"] || ""}
                  onChange={(e) => update("contact_phone", e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <Label>Club Address</Label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={settings["contact_address"] || ""}
                  onChange={(e) => update("contact_address", e.target.value)}
                  placeholder="123 Main Street, City, Country"
                />
              </div>
              <Button
                onClick={() => saveGroup(["contact_email", "contact_phone", "contact_address"], "Contact")}
                disabled={saving === "Contact"}
                className="bg-rotary-blue hover:bg-rotary-blue/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving === "Contact" ? "Saving..." : "Save Contact Info"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
