"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/db/browser-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Download, FileText } from "lucide-react";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
  access_level: string;
  is_active: boolean;
  created_at: string;
};

const ACCESS_LEVELS = [
  { value: "public", label: "Public (everyone)" },
  { value: "member_only", label: "Members only" },
  { value: "board_only", label: "Board only" },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  access_level: "member_only",
  is_active: true,
};

export default function AdminResourcesPage() {
  const supabase = createClient() as any;
  const { toast } = useToast();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("documents")
      .select("id, title, description, file_url, file_type, access_level, is_active, created_at")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    setResources(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setFileToUpload(null);
    setDialogOpen(true);
  }

  function openEdit(r: Resource) {
    setEditing(r);
    setForm({
      title: r.title,
      description: r.description || "",
      access_level: r.access_level,
      is_active: r.is_active,
    });
    setFileToUpload(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast({ variant: "destructive", title: "Title is required." });
      return;
    }
    if (!editing && !fileToUpload) {
      toast({ variant: "destructive", title: "Please select a file to upload." });
      return;
    }
    setSaving(true);
    try {
      let file_url = editing?.file_url || "";
      let file_type = editing?.file_type || null;

      if (fileToUpload) {
        const ext = fileToUpload.name.split(".").pop() || "";
        const safeName = fileToUpload.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage.from("resources").upload(path, fileToUpload, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("resources").getPublicUrl(path);
        file_url = pub.publicUrl as string;
        file_type = ext.toLowerCase();
      }

      const payload: any = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        access_level: form.access_level,
        is_active: form.is_active,
        file_url,
        file_type,
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        const { error } = await supabase.from("documents").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast({ variant: "success", title: "Updated" });
      } else {
        const { error } = await supabase.from("documents").insert(payload);
        if (error) throw error;
        toast({ variant: "success", title: "Resource added" });
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
    if (!confirm("Delete this resource?")) return;
    const { error } = await supabase.from("documents").update({ is_active: false }).eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ variant: "success", title: "Deleted" });
      load();
    }
  }

  const accessLabel: Record<string, string> = {
    public: "Public",
    member_only: "Members",
    board_only: "Board",
  };

  if (loading) return <div className="text-pewter text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Resources</h1>
          <p className="text-sm text-pewter mt-1">Manage downloadable documents and files for members.</p>
        </div>
        <Button onClick={openAdd} className="bg-rotary-blue hover:bg-rotary-blue/90">
          <Plus className="mr-2 h-4 w-4" /> Add Resource
        </Button>
      </div>

      {resources.length === 0 ? (
        <Card>
          <CardContent className="pt-10 pb-10 text-center">
            <FileText className="h-10 w-10 text-pewter mx-auto mb-3" />
            <p className="text-pewter text-sm">No resources yet. Upload the first document.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {resources.map((r) => (
            <Card key={r.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-rotary-blue/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-rotary-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-charcoal truncate">{r.title}</p>
                    {r.description && (
                      <p className="text-sm text-pewter line-clamp-1">{r.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs capitalize">{accessLabel[r.access_level] || r.access_level}</Badge>
                      {r.file_type && <span className="text-xs text-pewter uppercase">{r.file_type}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {r.file_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-cranberry border-cranberry/30 hover:bg-cranberry/5" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Resource" : "Add Resource"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Title *</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Document title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description..."
              />
            </div>
            <div>
              <Label>Access Level</Label>
              <Select value={form.access_level} onValueChange={(v) => setForm((f) => ({ ...f, access_level: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCESS_LEVELS.map((al) => (
                    <SelectItem key={al.value} value={al.value}>{al.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{editing ? "Replace File (optional)" : "File *"}</Label>
              <Input
                className="mt-1"
                type="file"
                onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
              />
              {editing?.file_url && !fileToUpload && (
                <p className="text-xs text-pewter mt-1">Current file will be kept if no new file is selected.</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="res_active"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="res_active">Active (visible to users)</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-rotary-blue hover:bg-rotary-blue/90" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : (editing ? "Save Changes" : "Upload Resource")}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
