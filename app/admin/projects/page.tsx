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
import { Plus, Pencil, Trash2, FolderKanban } from "lucide-react";

type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  is_featured: boolean;
  is_published: boolean;
  avenue_id: string | null;
  avenue?: { id: string; name: string; slug: string } | null;
};

type AvenueOption = { id: string; name: string; slug: string };

const STATUS_OPTIONS = ["planned", "active", "completed", "archived", "cancelled"];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const EMPTY_FORM = {
  title: "",
  slug: "",
  description: "",
  long_description: "",
  status: "planned",
  start_date: "",
  end_date: "",
  location: "",
  avenue_id: "",
  is_featured: false,
  is_published: false,
};

export default function AdminProjectsPage() {
  const supabase = createClient() as any;
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [avenueOptions, setAvenueOptions] = useState<AvenueOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: proj }, { data: avns }] = await Promise.all([
      supabase
        .from("projects")
        .select(`
          id, title, slug, description, status, start_date, end_date,
          location, is_featured, is_published, avenue_id, event_id,
          avenue:avenues(id, name, slug)
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("avenues")
        .select("id, name, slug")
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("name", { ascending: true }),
    ]);
    setProjects(proj || []);
    setAvenueOptions(avns || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      title: p.title,
      slug: p.slug,
      description: p.description,
      long_description: "",
      status: p.status,
      start_date: p.start_date || "",
      end_date: p.end_date || "",
      location: p.location || "",
      avenue_id: p.avenue_id || "",
      is_featured: p.is_featured,
      is_published: p.is_published,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast({ variant: "destructive", title: "Title is required." });
      return;
    }
    setSaving(true);
    try {
      const slug = form.slug.trim() || slugify(form.title);
      const payload: any = {
        title: form.title.trim(),
        slug,
        description: form.description.trim() || "",
        status: form.status,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        location: form.location.trim() || null,
        avenue_id: form.avenue_id || null,
        is_featured: form.is_featured,
        is_published: form.is_published,
        published_at: form.is_published && !editing?.is_published ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      };
      if (editing) {
        const { error } = await supabase.from("projects").update(payload).eq("id", editing.id);
        if (error) throw error;
        // Keep the linked attendance event's basics in sync.
        if ((editing as any).event_id) {
          await supabase.from("events").update({
            title: payload.title,
            date: payload.start_date || undefined,
            end_date: payload.end_date || null,
            location: payload.location,
            updated_at: new Date().toISOString(),
          }).eq("id", (editing as any).event_id);
        }
        toast({ variant: "success", title: "Updated", description: "Project updated." });
      } else {
        const { data: created, error } = await supabase.from("projects").insert(payload).select("id").single();
        if (error) throw error;
        // A project is also an attendable event — create a linked event so it
        // appears in Attendance and counts toward member requirements.
        try {
          const { data: ev } = await supabase.from("events").insert({
            title: payload.title,
            slug: `${slug}-event-${Date.now().toString(36)}`,
            description: payload.description || payload.title,
            event_type: "Project",
            date: payload.start_date || new Date().toISOString().split("T")[0],
            end_date: payload.end_date || null,
            location: payload.location,
            status: "published",
            is_public: true,
            project_id: created.id,
          }).select("id").single();
          if (ev) await supabase.from("projects").update({ event_id: ev.id }).eq("id", created.id);
        } catch { /* non-fatal: project still created */ }
        toast({ variant: "success", title: "Created", description: "Project created (with an attendance event)." });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete project "${title}"?`)) return;
    const { error } = await supabase
      .from("projects")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ variant: "success", title: "Deleted" });
      load();
    }
  }

  const statusColor: Record<string, string> = {
    planned: "bg-yellow-100 text-yellow-700",
    active: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    archived: "bg-gray-100 text-gray-600",
    cancelled: "bg-red-100 text-red-600",
  };

  if (loading) return <div className="text-pewter text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Projects</h1>
          <p className="text-sm text-pewter mt-1">Showcase completed club initiatives and service projects.</p>
        </div>
        <Button onClick={openAdd} className="bg-rotary-blue hover:bg-rotary-blue/90">
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="pt-10 pb-10 text-center">
            <FolderKanban className="h-10 w-10 text-pewter mx-auto mb-3" />
            <p className="text-pewter text-sm">No projects yet. Create the first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-rotary-blue/10 flex items-center justify-center flex-shrink-0">
                    <FolderKanban className="h-5 w-5 text-rotary-blue/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-charcoal truncate">{p.title}</p>
                        <p className="text-sm text-pewter mt-0.5 line-clamp-1">{p.description}</p>
                        {p.avenue && (
                          <p className="text-xs text-rotary-blue mt-1 font-medium">
                            Area of Focus: {p.avenue.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor[p.status] || "bg-gray-100 text-gray-600"}`}>
                          {p.status}
                        </span>
                        {p.is_featured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                        {!p.is_published && <Badge variant="secondary" className="text-xs">Draft</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-cranberry border-cranberry/30 hover:bg-cranberry/5" onClick={() => handleDelete(p.id, p.title)}>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Project" : "Add Project"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Title *</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))}
                placeholder="Project title"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                className="mt-1 font-mono text-sm"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this project..."
              />
            </div>
            <div>
              <Label>Area of Focus (Avenue of Service)</Label>
              <Select
                value={form.avenue_id}
                onValueChange={(v) => setForm((f) => ({ ...f, avenue_id: v === "none" ? "" : v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select an area of focus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {avenueOptions.map((avenue) => (
                    <SelectItem key={avenue.id} value={avenue.id}>
                      {avenue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input
                className="mt-1"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Project location"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium">Published</span>
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-rotary-blue hover:bg-rotary-blue/90" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : (editing ? "Save Changes" : "Create Project")}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
