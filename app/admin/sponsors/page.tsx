"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/db/browser-client";
import { compressImage } from "@/lib/utils/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Handshake, Building2 } from "lucide-react";

type Sponsor = {
  id: string;
  club_name: string;
  district: string | null;
  charter_date: string | null;
  logo_url: string | null;
  description: string | null;
  relationship_text: string | null;
  president_name: string | null;
  president_email: string | null;
  website_url: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  is_active: boolean;
};

const EMPTY_FORM = {
  club_name: "",
  district: "",
  charter_date: "",
  description: "",
  relationship_text: "",
  president_name: "",
  president_email: "",
  website_url: "",
  social_facebook: "",
  social_instagram: "",
  is_active: true,
};

export default function AdminSponsorsPage() {
  const supabase = createClient() as any;
  const { toast } = useToast();

  const [items, setItems] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("sponsor_club")
      .select("*")
      .order("club_name", { ascending: true });
    setItems(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setLogoFile(null);
    setLogoPreview("");
    setDialogOpen(true);
  }

  function openEdit(s: Sponsor) {
    setEditing(s);
    setForm({
      club_name: s.club_name,
      district: s.district || "",
      charter_date: s.charter_date ? s.charter_date.slice(0, 10) : "",
      description: s.description || "",
      relationship_text: s.relationship_text || "",
      president_name: s.president_name || "",
      president_email: s.president_email || "",
      website_url: s.website_url || "",
      social_facebook: s.social_facebook || "",
      social_instagram: s.social_instagram || "",
      is_active: s.is_active,
    });
    setLogoFile(null);
    setLogoPreview(s.logo_url || "");
    setDialogOpen(true);
  }

  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function uploadLogo(original: File): Promise<string> {
    // Compress (skips SVG automatically); keep logos crisp with a smaller cap.
    const file = await compressImage(original, { maxWidth: 600, maxHeight: 600, quality: 0.9 });
    const ext = file.name.split(".").pop() || "webp";
    const path = `sponsor-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    return data.publicUrl as string;
  }

  async function handleSave() {
    if (!form.club_name.trim()) {
      toast({ variant: "destructive", title: "Club name is required." });
      return;
    }
    setSaving(true);
    try {
      let logo_url = editing?.logo_url || null;
      if (logoFile) logo_url = await uploadLogo(logoFile);

      const payload: any = {
        club_name: form.club_name.trim(),
        district: form.district.trim() || null,
        charter_date: form.charter_date || null,
        description: form.description.trim() || null,
        relationship_text: form.relationship_text.trim() || null,
        president_name: form.president_name.trim() || null,
        president_email: form.president_email.trim() || null,
        website_url: form.website_url.trim() || null,
        social_facebook: form.social_facebook.trim() || null,
        social_instagram: form.social_instagram.trim() || null,
        is_active: form.is_active,
        logo_url,
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        const { error } = await supabase.from("sponsor_club").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast({ variant: "success", title: "Sponsor updated" });
      } else {
        const { error } = await supabase.from("sponsor_club").insert(payload);
        if (error) throw error;
        toast({ variant: "success", title: "Sponsor added" });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this sponsor club?")) return;
    const { error } = await supabase.from("sponsor_club").delete().eq("id", id);
    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else { toast({ variant: "success", title: "Removed" }); load(); }
  }

  if (loading) return <div className="text-pewter text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Sponsor Clubs</h1>
          <p className="text-sm text-pewter mt-1">The sponsoring Rotary club(s) shown on the public Sponsors page.</p>
        </div>
        <Button onClick={openAdd} className="bg-rotary-blue hover:bg-rotary-blue/90">
          <Plus className="mr-2 h-4 w-4" /> Add Sponsor Club
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-10 pb-10 text-center">
            <Handshake className="h-10 w-10 text-pewter mx-auto mb-3" />
            <p className="text-pewter text-sm">No sponsor clubs yet. Add the first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((s) => (
            <Card key={s.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-lg bg-rotary-blue/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {s.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logo_url} alt={s.club_name} className="h-full w-full object-contain" />
                    ) : (
                      <Building2 className="h-6 w-6 text-rotary-blue" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-charcoal truncate">{s.club_name}</p>
                    {s.district && <p className="text-xs text-pewter">District {s.district}</p>}
                    {!s.is_active && <Badge variant="outline" className="bg-gray-100 text-gray-600 mt-1">Hidden</Badge>}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openEdit(s)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-cranberry border-cranberry/30 hover:bg-cranberry/5" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Sponsor Club" : "Add Sponsor Club"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Club Name *</Label>
              <Input className="mt-1" value={form.club_name} onChange={(e) => setForm((f) => ({ ...f, club_name: e.target.value }))} placeholder="Rotary Club of ..." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>District</Label>
                <Input className="mt-1" value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} placeholder="e.g. 9211" />
              </div>
              <div>
                <Label>Charter Date</Label>
                <Input type="date" className="mt-1" value={form.charter_date} onChange={(e) => setForm((f) => ({ ...f, charter_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Logo</Label>
              <div className="mt-2 space-y-2">
                {logoPreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Preview" className="h-20 w-20 object-contain rounded-lg border border-border" />
                )}
                <Input type="file" accept="image/*" onChange={onLogoChange} className="max-w-xs" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>Relationship / Message</Label>
              <Textarea className="mt-1" rows={2} value={form.relationship_text} onChange={(e) => setForm((f) => ({ ...f, relationship_text: e.target.value }))} placeholder="How they mentor/sponsor the club" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>President Name</Label>
                <Input className="mt-1" value={form.president_name} onChange={(e) => setForm((f) => ({ ...f, president_name: e.target.value }))} />
              </div>
              <div>
                <Label>President Email</Label>
                <Input type="email" className="mt-1" value={form.president_email} onChange={(e) => setForm((f) => ({ ...f, president_email: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Website URL</Label>
              <Input className="mt-1" value={form.website_url} onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))} placeholder="https://" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Facebook</Label>
                <Input className="mt-1" value={form.social_facebook} onChange={(e) => setForm((f) => ({ ...f, social_facebook: e.target.value }))} />
              </div>
              <div>
                <Label>Instagram</Label>
                <Input className="mt-1" value={form.social_instagram} onChange={(e) => setForm((f) => ({ ...f, social_instagram: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label className="text-charcoal">Active</Label>
                <p className="text-xs text-pewter">Show on the public Sponsors page</p>
              </div>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-rotary-blue hover:bg-rotary-blue/90" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : (editing ? "Save Changes" : "Add Sponsor")}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
