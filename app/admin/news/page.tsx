"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/db/browser-client";
import { compressImage } from "@/lib/utils/image";
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
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Newspaper } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  is_published: false,
};

export default function AdminNewsPage() {
  const supabase = createClient() as any;
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select("id, title, slug, excerpt, content, featured_image, is_published, published_at, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    setPosts(data || []);
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

  function openEdit(p: Post) {
    setEditing(p);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || "",
      content: p.content || "",
      is_published: p.is_published,
    });
    setImagePreview(p.featured_image || "");
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
    const path = `post-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("posts").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("posts").getPublicUrl(path);
    return data.publicUrl as string;
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast({ variant: "destructive", title: "Title is required." });
      return;
    }
    setSaving(true);
    try {
      const slug = form.slug.trim() || slugify(form.title);
      let featured_image = editing?.featured_image || null;
      if (imageFile) {
        featured_image = await uploadImage(imageFile);
      }

      const payload: any = {
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim() || null,
        content: form.content.trim() || null,
        featured_image,
        is_published: form.is_published,
        published_at: form.is_published && !editing?.is_published ? new Date().toISOString() : (editing?.published_at ?? null),
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        const { error } = await supabase.from("posts").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast({ variant: "success", title: "Updated", description: "Article updated." });
      } else {
        const { error } = await supabase.from("posts").insert(payload);
        if (error) throw error;
        toast({ variant: "success", title: "Published", description: "Article created." });
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
    if (!confirm(`Delete article "${title}"?`)) return;
    const { error } = await supabase
      .from("posts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
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
          <h1 className="text-2xl font-bold text-charcoal">News & Blog</h1>
          <p className="text-sm text-pewter mt-1">Write and publish news articles for the club.</p>
        </div>
        <Button onClick={openAdd} className="bg-rotary-blue hover:bg-rotary-blue/90">
          <Plus className="mr-2 h-4 w-4" /> New Article
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="pt-10 pb-10 text-center">
            <Newspaper className="h-10 w-10 text-pewter mx-auto mb-3" />
            <p className="text-pewter text-sm">No articles yet. Write the first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-rotary-blue/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {p.featured_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.featured_image} alt={p.title} className="h-full w-full object-cover" />
                    ) : (
                      <Newspaper className="h-5 w-5 text-rotary-blue/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-charcoal truncate">{p.title}</p>
                        {p.excerpt && (
                          <p className="text-sm text-pewter mt-0.5 line-clamp-1">{p.excerpt}</p>
                        )}
                        <p className="text-xs text-pewter mt-1">
                          {p.published_at
                            ? `Published ${new Date(p.published_at).toLocaleDateString()}`
                            : `Created ${new Date(p.created_at).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {p.is_published ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Published</span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Draft</span>
                        )}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Article" : "New Article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Title *</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))}
                placeholder="Article title"
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
              <Label>Excerpt / Summary</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="Brief summary shown on the news listing page..."
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                className="mt-1"
                rows={8}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Full article content..."
              />
            </div>
            <div>
              <Label>Featured Image</Label>
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
                id="post_published"
                checked={form.is_published}
                onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="post_published">Publish immediately</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-rotary-blue hover:bg-rotary-blue/90" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : (editing ? "Save Changes" : "Create Article")}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
