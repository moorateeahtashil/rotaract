"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/db/browser-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Pencil, Trash2, Image as ImageIcon, Upload, ChevronRight } from "lucide-react";

type Album = {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  is_public: boolean;
  created_at: string;
  media_count?: number;
};

type AlbumMedia = {
  id: string;
  album_id: string;
  media_url: string;
  caption: string | null;
  sort_order: number;
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminGalleryPage() {
  const supabase = createClient() as any;
  const { toast } = useToast();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  // Album dialog
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [albumForm, setAlbumForm] = useState({ title: "", description: "", is_public: true });
  const [savingAlbum, setSavingAlbum] = useState(false);

  // Media view dialog
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumMedia, setAlbumMedia] = useState<AlbumMedia[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const loadAlbums = useCallback(async () => {
    setLoading(true);
    const { data: albumsData } = await supabase
      .from("albums")
      .select("id, title, description, cover_image_url, is_public, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (!albumsData) { setAlbums([]); setLoading(false); return; }

    // Get media counts
    const { data: mediaCounts } = await supabase
      .from("album_media")
      .select("album_id");

    const countMap: Record<string, number> = {};
    (mediaCounts || []).forEach((m: any) => {
      countMap[m.album_id] = (countMap[m.album_id] || 0) + 1;
    });

    setAlbums(albumsData.map((a: any) => ({ ...a, media_count: countMap[a.id] || 0 })));
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadAlbums(); }, [loadAlbums]);

  function openAddAlbum() {
    setEditingAlbum(null);
    setAlbumForm({ title: "", description: "", is_public: true });
    setAlbumDialogOpen(true);
  }

  function openEditAlbum(a: Album) {
    setEditingAlbum(a);
    setAlbumForm({ title: a.title, description: a.description || "", is_public: a.is_public });
    setAlbumDialogOpen(true);
  }

  async function handleSaveAlbum() {
    if (!albumForm.title.trim()) {
      toast({ variant: "destructive", title: "Album title is required." });
      return;
    }
    setSavingAlbum(true);
    try {
      const payload: any = {
        title: albumForm.title.trim(),
        slug: slugify(albumForm.title),
        description: albumForm.description.trim() || null,
        is_public: albumForm.is_public,
        updated_at: new Date().toISOString(),
      };
      if (editingAlbum) {
        const { error } = await supabase.from("albums").update(payload).eq("id", editingAlbum.id);
        if (error) throw error;
        toast({ variant: "success", title: "Updated" });
      } else {
        const { error } = await supabase.from("albums").insert(payload);
        if (error) throw error;
        toast({ variant: "success", title: "Album created" });
      }
      setAlbumDialogOpen(false);
      loadAlbums();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSavingAlbum(false);
    }
  }

  async function handleDeleteAlbum(id: string) {
    if (!confirm("Delete this album and all its images?")) return;
    const { error } = await supabase
      .from("albums")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ variant: "success", title: "Deleted" });
      loadAlbums();
    }
  }

  async function openAlbumMedia(album: Album) {
    setSelectedAlbum(album);
    const { data } = await supabase
      .from("album_media")
      .select("*")
      .eq("album_id", album.id)
      .order("sort_order");
    setAlbumMedia(data || []);
    setMediaDialogOpen(true);
  }

  async function handleUploadImages(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedAlbum) return;
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingMedia(true);
    try {
      for (const file of files) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${selectedAlbum.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("gallery").upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("gallery").getPublicUrl(path);
        const { error: insertErr } = await supabase.from("album_media").insert({
          album_id: selectedAlbum.id,
          media_url: pub.publicUrl,
          sort_order: albumMedia.length,
        });
        if (insertErr) throw insertErr;
      }
      toast({ variant: "success", title: `${files.length} image${files.length > 1 ? "s" : ""} uploaded.` });
      // Refresh media
      const { data } = await supabase.from("album_media").select("*").eq("album_id", selectedAlbum.id).order("sort_order");
      setAlbumMedia(data || []);
      loadAlbums();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Upload failed", description: e.message });
    } finally {
      setUploadingMedia(false);
    }
  }

  async function handleDeleteMedia(mediaId: string) {
    const { error } = await supabase.from("album_media").delete().eq("id", mediaId);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setAlbumMedia((prev) => prev.filter((m) => m.id !== mediaId));
      loadAlbums();
    }
  }

  if (loading) return <div className="text-pewter text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Gallery</h1>
          <p className="text-sm text-pewter mt-1">Manage photo albums and images.</p>
        </div>
        <Button onClick={openAddAlbum} className="bg-rotary-blue hover:bg-rotary-blue/90">
          <Plus className="mr-2 h-4 w-4" /> New Album
        </Button>
      </div>

      {albums.length === 0 ? (
        <Card>
          <CardContent className="pt-10 pb-10 text-center">
            <ImageIcon className="h-10 w-10 text-pewter mx-auto mb-3" />
            <p className="text-pewter text-sm">No albums yet. Create the first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map((album) => (
            <Card key={album.id} className="overflow-hidden">
              <div
                className="h-32 bg-gradient-to-br from-rotary-blue/10 to-azure/10 flex items-center justify-center relative cursor-pointer"
                onClick={() => openAlbumMedia(album)}
              >
                {album.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={album.cover_image_url} alt={album.title} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-rotary-blue/30" />
                )}
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                  {album.media_count} photo{album.media_count !== 1 ? "s" : ""}
                </div>
              </div>
              <CardContent className="pt-3 pb-3">
                <p className="font-semibold text-charcoal truncate">{album.title}</p>
                {album.description && (
                  <p className="text-xs text-pewter mt-0.5 line-clamp-1">{album.description}</p>
                )}
                {!album.is_public && (
                  <span className="inline-block text-xs text-pewter border border-border rounded px-1.5 py-0.5 mt-1">Private</span>
                )}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openAlbumMedia(album)}>
                    <ChevronRight className="h-3.5 w-3.5 mr-1" /> Open
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => openEditAlbum(album)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-cranberry border-cranberry/30 hover:bg-cranberry/5 text-xs" onClick={() => handleDeleteAlbum(album.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Album create/edit dialog */}
      <Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAlbum ? "Edit Album" : "New Album"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Album Title *</Label>
              <Input
                className="mt-1"
                value={albumForm.title}
                onChange={(e) => setAlbumForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Annual Gala 2025"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={albumForm.description}
                onChange={(e) => setAlbumForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="album_public"
                checked={albumForm.is_public}
                onChange={(e) => setAlbumForm((f) => ({ ...f, is_public: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="album_public">Public (visible to all visitors)</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-rotary-blue hover:bg-rotary-blue/90" onClick={handleSaveAlbum} disabled={savingAlbum}>
                {savingAlbum ? "Saving..." : (editingAlbum ? "Save Changes" : "Create Album")}
              </Button>
              <Button variant="outline" onClick={() => setAlbumDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Album media dialog */}
      <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAlbum?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Upload Images</Label>
              <div className="mt-2 flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUploadImages}
                  disabled={uploadingMedia}
                  className="max-w-xs"
                />
                {uploadingMedia && <span className="text-sm text-pewter">Uploading...</span>}
              </div>
            </div>
            {albumMedia.length === 0 ? (
              <div className="text-center py-8">
                <ImageIcon className="h-8 w-8 text-pewter mx-auto mb-2" />
                <p className="text-sm text-pewter">No images yet. Upload some above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {albumMedia.map((media) => (
                  <div key={media.id} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={media.media_url}
                      alt={media.caption || "Gallery image"}
                      className="w-full h-24 object-cover rounded-lg border border-border"
                    />
                    <button
                      onClick={() => handleDeleteMedia(media.id)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
