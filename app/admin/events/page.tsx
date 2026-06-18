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
import { Plus, Pencil, Trash2, Calendar, MapPin, ExternalLink, X, QrCode, Copy } from "lucide-react";
import { compressImage } from "@/lib/utils/image";

type Event = {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string | null;
  date: string;
  end_date: string | null;
  location: string | null;
  location_url: string | null;
  map_embed_url: string | null;
  image_url: string | null;
  status: string;
  is_public: boolean;
  is_featured: boolean;
  event_type: string | null;
  capacity: number | null;
};

type EventType = {
  id: string;
  name: string;
};

const STATUS_OPTIONS = ["draft", "published", "ongoing", "completed", "cancelled"];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const EMPTY_FORM = {
  title: "",
  slug: "",
  description: "",
  long_description: "",
  date: "",
  time: "",
  end_date: "",
  location: "",
  location_url: "",
  map_embed_url: "",
  status: "published",
  is_public: true,
  is_featured: false,
  event_type: "",
  capacity: "",
};

function MapSelector({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [mapOpen, setMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [iframeKey, setIframeKey] = useState(0);

  const embedUrl = value || "https://www.openstreetmap.org/export/embed.html?bbox=76.2,10.0,76.4,10.3&layer=mapnik";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const encoded = encodeURIComponent(searchQuery);
      const osmSearchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}`;
      
      fetch(osmSearchUrl)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const { lat, lon, display_name } = data[0];
            const bbox = `${parseFloat(lon) - 0.01},${parseFloat(lat) - 0.01},${parseFloat(lon) + 0.01},${parseFloat(lat) + 0.01}`;
            const newEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
            onChange(newEmbedUrl);
            setMapOpen(false);
          }
        });
    }
  };

  return (
    <div className="space-y-2">
      <Label>Map Location (Optional)</Label>
      {value ? (
        <div className="relative rounded-lg border overflow-hidden">
          <iframe
            key={iframeKey}
            src={value}
            width="100%"
            height="200"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setMapOpen(true)} className="w-full">
          <MapPin className="h-4 w-4 mr-2" /> Select Location on Map
        </Button>
      )}

      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Select Location on Map</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit">Search</Button>
            </form>
            <div className="rounded-lg border overflow-hidden">
              <iframe
                src={embedUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-sm text-pewter">
              Zoom and pan to the desired location, then click "Use This Location" to embed it.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => { onChange(embedUrl); setMapOpen(false); setIframeKey(k => k + 1); }} className="flex-1">
                Use This Location
              </Button>
              <Button variant="outline" onClick={() => setMapOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminEventsPage() {
  const supabase = createClient() as any;
  const { toast } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [qr, setQr] = useState<{ open: boolean; loading: boolean; title?: string; token?: string; expires?: string }>({ open: false, loading: false });

  async function generateCode(ev: Event) {
    setQr({ open: true, loading: true });
    try {
      const res = await fetch("/api/admin/qr/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug: ev.slug, expiryHours: 24 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate code");
      setQr({ open: true, loading: false, title: ev.title, token: data.token, expires: data.expires_at });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
      setQr({ open: false, loading: false });
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    const [eventsData, typesData] = await Promise.all([
      supabase
        .from("events")
        .select("id, title, slug, description, long_description, date, end_date, location, location_url, map_embed_url, image_url, status, is_public, is_featured, event_type, capacity")
        .is("deleted_at", null)
        .order("date", { ascending: false }),
      supabase
        .from("event_types")
        .select("id, name")
        .order("name", { ascending: true }),
    ]);
    setEvents(eventsData.data || []);
    setEventTypes(typesData.data || []);
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
      description: e.description || "",
      long_description: e.long_description || "",
      date: dateObj ? dateObj.toISOString().split("T")[0] : "",
      time: dateObj ? dateObj.toTimeString().slice(0, 5) : "",
      end_date: e.end_date ? new Date(e.end_date).toISOString().split("T")[0] : "",
      location: e.location || "",
      location_url: e.location_url || "",
      map_embed_url: e.map_embed_url || "",
      status: e.status,
      is_public: e.is_public,
      is_featured: e.is_featured,
      event_type: e.event_type || "",
      capacity: e.capacity != null ? String(e.capacity) : "",
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

  async function uploadImage(original: File): Promise<string> {
    const file = await compressImage(original);
    const ext = file.name.split(".").pop() || "webp";
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
      const dateTime = form.time ? `${form.date}T${form.time}:00` : `${form.date}T00:00:00`;
      const slug = form.slug.trim() || slugify(form.title);

      let image_url = editing?.image_url || null;
      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }

      const payload: any = {
        title: form.title.trim(),
        slug,
        description: form.description.trim() || null,
        long_description: form.long_description.trim() || null,
        date: dateTime,
        end_date: form.end_date ? `${form.end_date}T23:59:00` : null,
        location: form.location.trim() || null,
        location_url: form.location_url.trim() || null,
        map_embed_url: form.map_embed_url || null,
        capacity: form.capacity ? Number(form.capacity) : null,
        status: form.status,
        is_public: form.is_public,
        is_featured: form.is_featured,
        event_type: form.event_type || null,
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
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor[ev.status] || "bg-gray-100 text-gray-600"}`}>
                            {ev.status}
                          </span>
                          {ev.event_type && (
                            <Badge variant="outline" className="text-xs">{ev.event_type}</Badge>
                          )}
                          {ev.is_featured && (
                            <Badge className="bg-rotary-gold text-black text-xs">Featured</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => generateCode(ev)} title="Attendance QR code">
                      <QrCode className="h-3.5 w-3.5" />
                    </Button>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Event" : "Add Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Label>Event Type</Label>
                <Select value={form.event_type} onValueChange={(v) => setForm((f) => ({ ...f, event_type: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((t) => (
                      <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              <Label>Short Description</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description for event cards..."
              />
            </div>
            <div>
              <Label>Long Description</Label>
              <Textarea
                className="mt-1"
                rows={4}
                value={form.long_description}
                onChange={(e) => setForm((f) => ({ ...f, long_description: e.target.value }))}
                placeholder="Detailed information about the event..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <Label>Location Name</Label>
              <Input
                className="mt-1"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Venue name, address, or Online"
              />
            </div>
            <div>
              <Label>Location URL (Google Maps, etc.)</Label>
              <Input
                className="mt-1"
                value={form.location_url}
                onChange={(e) => setForm((f) => ({ ...f, location_url: e.target.value }))}
                placeholder="https://maps.google.com/..."
              />
            </div>
            <MapSelector
              value={form.map_embed_url}
              onChange={(url) => setForm((f) => ({ ...f, map_embed_url: url }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ev_public"
                  checked={form.is_public}
                  onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="ev_public">Public</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ev_featured"
                  checked={form.is_featured}
                  onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="ev_featured">Featured</Label>
              </div>
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

      {/* Attendance QR code */}
      <Dialog open={qr.open} onOpenChange={(o) => setQr((q) => ({ ...q, open: o }))}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Attendance Code{qr.title ? ` — ${qr.title}` : ""}</DialogTitle>
          </DialogHeader>
          {qr.loading ? (
            <p className="text-sm text-pewter py-6 text-center">Generating…</p>
          ) : qr.token ? (
            <div className="space-y-4 text-center">
              {/* QR encodes the token; members scan it on their Attendance page */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qr.token)}`}
                alt="Attendance QR code"
                className="mx-auto rounded-lg border border-border"
                width={240}
                height={240}
              />
              <div>
                <p className="text-xs text-pewter mb-1">Or enter this code manually:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{qr.token}</code>
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(qr.token!); toast({ variant: "success", title: "Copied" }); }}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {qr.expires && (
                <p className="text-xs text-pewter">Expires {new Date(qr.expires).toLocaleString()}</p>
              )}
              <p className="text-xs text-pewter">Display this at the event. Members scan it (or type the code) on their Attendance page to check in. Generating a new code deactivates the old one.</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
