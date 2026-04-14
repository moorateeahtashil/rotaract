"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, GripVertical, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/db/browser-client";

type EventType = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color_hex: string;
  is_active: boolean;
  sort_order: number;
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function EventTypesPage() {
  const [types, setTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type?: EventType }>({ open: false });
  const [editing, setEditing] = useState<EventType | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    color_hex: "#17458f",
  });
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("event_types")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });
    setTypes(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", color_hex: "#17458f" });
    setDialogOpen(true);
  }

  function openEdit(type: EventType) {
    setEditing(type);
    setForm({ name: type.name, description: type.description || "", color_hex: type.color_hex });
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    const supabase = createClient();
    try {
      if (editing) {
        const { error } = await supabase
          .from("event_types")
          .update({ name: form.name, description: form.description, color_hex: form.color_hex })
          .eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Updated", description: `"${form.name}" has been updated.` });
      } else {
        const { error } = await supabase.from("event_types").insert({
          name: form.name,
          slug: slugify(form.name),
          description: form.description || null,
          color_hex: form.color_hex,
          sort_order: types.length,
        });
        if (error) throw error;
        toast({ title: "Created", description: `"${form.name}" event type created.` });
      }
      setDialogOpen(false);
      await load();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(type: EventType) {
    const supabase = createClient();
    await supabase.from("event_types").update({ is_active: !type.is_active }).eq("id", type.id);
    await load();
  }

  async function deleteType(type: EventType) {
    const supabase = createClient();
    await supabase
      .from("event_types")
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq("id", type.id);
    toast({ title: "Deleted", description: `"${type.name}" has been removed.` });
    setDeleteDialog({ open: false });
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Event Types</h1>
          <p className="text-sm text-pewter">Create and manage event categories used when creating events</p>
        </div>
        <Button onClick={openCreate} className="bg-rotary-blue hover:bg-rotary-blue/90">
          <Plus className="mr-2 h-4 w-4" /> New Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-rotary-blue" />
            All Event Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-pewter text-center py-6">Loading...</p>
          ) : types.length === 0 ? (
            <div className="text-center py-10">
              <Tag className="h-10 w-10 text-pewter mx-auto mb-3" />
              <p className="text-charcoal font-medium mb-1">No event types yet</p>
              <p className="text-sm text-pewter mb-4">Create event types to categorize your events.</p>
              <Button onClick={openCreate} variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Create First Type
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {types.map((type) => (
                <div
                  key={type.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${type.is_active ? "border-border bg-white" : "border-dashed border-gray-200 bg-gray-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: type.color_hex }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-charcoal text-sm">{type.name}</span>
                        {!type.is_active && (
                          <Badge variant="outline" className="text-xs text-gray-500">Inactive</Badge>
                        )}
                      </div>
                      {type.description && (
                        <p className="text-xs text-pewter mt-0.5">{type.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(type)}
                      className="text-xs text-pewter hover:text-charcoal"
                    >
                      {type.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(type)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-cranberry hover:bg-cranberry/5"
                      onClick={() => setDeleteDialog({ open: true, type })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Event Type" : "New Event Type"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Community Service"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this event type"
                rows={2}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="color"
                  value={form.color_hex}
                  onChange={(e) => setForm({ ...form, color_hex: e.target.value })}
                  className="h-9 w-14 rounded border border-border cursor-pointer"
                />
                <Input
                  value={form.color_hex}
                  onChange={(e) => setForm({ ...form, color_hex: e.target.value })}
                  placeholder="#17458f"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={save}
              disabled={saving || !form.name}
              className="bg-rotary-blue hover:bg-rotary-blue/90"
            >
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteDialog.type?.name}&rdquo;? Events using this type will not be affected but the type will no longer be available for new events.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.type && deleteType(deleteDialog.type)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
