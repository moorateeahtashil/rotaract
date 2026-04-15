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
import { Plus, Pencil, Trash2, Calendar, ImageIcon } from "lucide-react";

type Event = {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  end_date: string | null;
  location: string | null;
  image_url: string | null;
  status: string;
  is_public: boolean;
  capacity: number | null;
};

const STATUS_OPTIONS = ["draft", "published", "ongoing", "completed", "cancelled"];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const EMPTY_FORM = {
  title: "",
  slug: "",
  description: "",
  date: "",
  time: "",
  end_date: "",
  location: "",
  capacity: "",
  status: "draft",
  is_public: true,
};

export default function AdminEventsPage() {
  const supabase = createClient() as any;
  const { toast } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("id, title, slug, description, date, end_date, location, image_url, status, is_public, capacity")
      .is("deleted_at", null)
      .order("date", { ascending: false });
    setEvents(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setImageFile(null);
    setImagePreview("");
    setDialogOpen(true);
  }

  function openEdit(e: Event) {
    setEditing(e);
    const dateObj = e.date ? new Date(e.date) : null;
    setForm({
      title: e.title,
      slug: e.slug,
      description: e.description,
      date: dateObj ? dateObj.toISOString().split("T")[0] : "",
      time: dateObj ? dateObj.toTimeString().slice(0, 5) : "",
      end_date: e.end_date ? new Date(e.end_date).toISOString().split("T")[0] : "",
      location: e.location || "",
      capacity: e.capacity != null ? String(e.capacity) : "",
      status: e.status,
      is_public: e.is_public,
    });
    setImagePreview(e.image_url || "");
    setImageFile(null);
    setDialogOpen(true);
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file: File): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `event-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("events").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("events").getPublicUrl(path);
    return data.publicUrl as string;
  }

  async function handleSave() {
    if (!form.title.trim() || !form.date) {
      toast({ variant: "destructive", title: "Title and date are required." });
      return;
    }
    setSaving(true);
    try {
      // Combine date + time into a datetime string
      const dateTime = form.time ? `${form.date}T${form.time}:00` : `${form.date}T00:00:00`;
      const slug = form.slug.trim() || slugify(form.title);

      let image_url = editing?.image_url || null;
      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }

      const payload: any = {
        title: form.title.trim(),
        slug,
        description: form.description.trim() || "",
        date: dateTime,
        end_date: form.end_date ? `${form.end_date}T23:59:00` : null,
        location: form.location.trim() || null,
        capacity: form.capacity ? Number(form.capacity) : null,
        status: form.status,
        is_public: form.is_public,
        image_url,
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        const { error } = await supabase.from("events").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast({ variant: "success", title: "Updated", description: "Event updated." });
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
        toast({ variant: "success", title: "Created", description: "Event created." });
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
    if (!confirm(`Delete event "${title}"?`)) return;
    const { error } = await supabase
      .from("events")
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
    draft: "bg-gray-100 text-gray-600",
    published: "bg-green-100 text-green-700",
    ongoing: "bg-blue-100 text-blue-700",
    completed: "bg-purple-100 text-purple-700",
    cancelled: "bg-red-100 text-red-600",
  };

  if (loading) return <div className="text-pewter text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Events</h1>
          <p className="text-sm text-pewter mt-1">Create and manage club events.</p>
        </div>
        <Button onClick={openAdd} className="bg-rotary-blue hover:bg-rotary-blue/90">
          <Plus className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="pt-10 pb-10 text-center">
            <Calendar className="h-10 w-10 text-pewter mx-auto mb-3" />
            <p className="text-pewter text-sm">No events yet. Create the first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <Card key={ev.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-lg bg-rotary-blue/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {ev.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ev.image_url} alt={ev.title} className="h-full w-full object-cover" />
                    ) : (
                      <Calendar className="h-6 w-6 text-rotary-blue/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-charcoal truncate">{ev.title}</p>
                        <p className="text-xs text-pewter mt-0.5">
                          {new Date(ev.date).toLocaleDateString("en-US", { dateStyle: "medium" })}
                          {ev.location && ` · ${ev.location}`}
                        </p>
                        <p className="text-sm text-pewter mt-1 line-clamp-1">{ev.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor[ev.status] || "bg-gray-100 text-gray-600"}`}>
                          {ev.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => openEdit(ev)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-cranberry border-cranberry/30 hover:bg-cranberry/5" onClick={() => handleDelete(ev.id, ev.title)}>
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
            <DialogTitle>{editing ? "Edit Event" : "Add Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Title *</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))}
                placeholder="Event title"
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
                placeholder="What is this event about?"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date *</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  className="mt-1"
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                />
              </div>
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
            <div>
              <Label>Location</Label>
              <Input
                className="mt-1"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Venue name, address, or Online"
              />
            </div>
            <div>
              <Label>Capacity</Label>
              <Input
                className="mt-1"
                type="number"
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                placeholder="Leave blank for unlimited"
              />
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
            <div>
              <Label>Event Image</Label>
              <div className="mt-2 space-y-2">
                {imagePreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-border" />
                )}
                <Input type="file" accept="image/*" onChange={onImageChange} className="max-w-xs" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ev_public"
                checked={form.is_public}
                onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="ev_public">Public (visible to everyone)</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-rotary-blue hover:bg-rotary-blue/90" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : (editing ? "Save Changes" : "Create Event")}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
