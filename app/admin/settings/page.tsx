"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/db/browser-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const supabase = createClient() as any;
  const { toast } = useToast();
  const [clubName, setClubName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("site_settings")
        .select("key,value")
        .in("key", ["club_name", "site_logo_url"]);
      const map: Record<string, string> = {};
      (data || []).forEach((r: any) => (map[r.key] = r.value));
      setClubName(map["club_name"] || "");
      setLogoUrl(map["site_logo_url"] || "");
    }
    load();
  }, []);

  async function saveBasic() {
    setSaving(true);
    try {
      const { error } = await supabase.from("site_settings").upsert(
        {
          key: "club_name",
          value: clubName || "",
          value_type: "string",
          group_key: "general",
          label: "Club Name",
          is_public: true,
        },
        { onConflict: "key" }
      );
      if (error) throw error;
      toast({ title: "Saved", description: "Site settings updated." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to save settings" });
    } finally {
      setSaving(false);
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
      toast({ title: "Logo uploaded", description: "Your site logo has been updated." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Upload failed", description: e.message || "Could not upload logo" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Site Settings</h1>
        <p className="text-sm text-pewter">Manage basic site configuration and branding</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Club Name</Label>
            <Input className="mt-1" value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="Rotaract Club of ..." />
          </div>
          <div className="flex gap-2">
            <Button onClick={saveBasic} disabled={saving} className="bg-rotary-blue hover:bg-rotary-blue/90">
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

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
              <div className="flex items-center gap-2">
                <Input type="file" accept="image/*" onChange={onUploadLogo} disabled={uploading} />
                <Button variant="outline" disabled>{uploading ? "Uploading..." : "Upload"}</Button>
              </div>
            </div>
            <p className="text-xs text-pewter mt-1">Recommended: transparent PNG or SVG, height ~36px</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

