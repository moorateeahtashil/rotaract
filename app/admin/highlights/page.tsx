"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/db/browser-client";
import { compressImage } from "@/lib/utils/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Globe, ImageIcon } from "lucide-react";

type Highlight = {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  sort_order: number;
};

const EMPTY_FORM = { title: "", body: "", sort_order: 0 };

export default function AdminHighlightsPage() {
  const supabase = createClient() as any;
  const { toast } = useToast();

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Highlight | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("rotary_highlights")
      .select("id, title, body, image_url, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    setHighlights(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sort_order: highlights.length + 1 });
    setImageFile(null);
    setImagePreview("");
    setDialogOpen(true);
  }

  function openEdit(h: Highlight) {
    setEditing(h);
    setForm({ title: h.title, body: h.body || "", sort_order: h.sort_order });
    setImageFile(null);
    setImagePreview(h.image_url || "");
    setDialogOpen(true);
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(original: File): Promise<string> {
    const file = await compressImage(original);
    const ext = file.name.split(".").pop() || "webp";
    const path = `highlight-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return data.publicUrl as string;
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast({ variant: "destructive", title: "Title is required." });
      return;
    }
    setSaving(true);
    try {
      let image_url = editing?.image_url || null;
      if (imageFile) image_url = await uploadImage(imageFile);

      const payload: any = {
        title: form.title.trim(),
        body: form.body.trim() || null,
        image_url,
        sort_order: Number(form.sort_order) || 0,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        const { error } = await supabase.from("rotary_highlights").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast({ variant: "success", title: "Updated" });
      } else {
        const { error } = await supabase.from("rotary_highlights").insert(payload);
        if (error) throw error;
        toast({ variant: "success", title: "Highlight added" });
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
    if (!confirm("Delete this highlight?")) return;
    const { error } = await supabase.from("rotary_highlights").update({ is_active: false }).eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ variant: "success", title: "Deleted" });
      load();
    }
  }

  if (loading) return <div className="text-pewter text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Rotary Highlights</h1>
          <p className="text-sm text-pewter mt-1">
            Cards shown in the "What is Rotary?" section on the homepage.
          </p>
        </div>
        <Button onClick={openAdd} className="bg-rotary-blue hover:bg-rotary-blue/90">
          <Plus className="mr-2 h-4 w-4" /> Add Highlight
        </Button>
      </div>

      {highlights.length === 0 ? (
        <Card>
          <CardContent className="pt-10 pb-10 text-center">
            <Globe className="h-10 w-10 text-pewter mx-auto mb-3" />
            <p className="text-pewter text-sm">No highlights yet. Add the first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {highlights.map((h) => (
            <Card key={h.id} className="overflow-hidden">
              <div className="h-28 bg-gradient-to-br from-rotary-blue/10 to-azure/10 flex items-center justify-center relative overflow-hidden">
                {h.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={h.image_url} alt={h.title} className="w-full h-full object-cover" />
                ) : (
                  <Globe className="h-8 w-8 text-rotary-blue/30" />
                )}
                <span className="absolute top-2 left-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full">
                  #{h.sort_order}
                </span>
              </div>
              <CardContent className="pt-3 pb-3">
                <p className="font-semibold text-charcoal truncate">{h.title}</p>
                {h.body && (
                  <p className="text-xs text-pewter mt-0.5 line-clamp-2">{h.body}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openEdit(h)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-cranberry border-cranberry/30 hover:bg-cranberry/5" onClick={() => handleDelete(h.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Highlight" : "Add Highlight"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Title *</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Peace, Education, Environment"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="A short description of this area of focus..."
              />
            </div>
            <div>
              <Label>Image</Label>
              <div className="mt-2 space-y-2">
                {imagePreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-border" />
                )}
                <Input type="file" accept="image/*" onChange={onImageChange} className="max-w-xs" />
              </div>
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input
                className="mt-1"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-rotary-blue hover:bg-rotary-blue/90" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : (editing ? "Save Changes" : "Add Highlight")}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
