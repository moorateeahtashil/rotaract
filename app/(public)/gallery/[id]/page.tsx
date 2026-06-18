import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/db/server";
import { ArrowLeft, Images } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient() as any;
  const { data: album } = await supabase
    .from("albums").select("title, description").eq("id", id).maybeSingle();
  return {
    title: album?.title || "Album",
    description: album?.description || "Photo album",
  };
}

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient() as any;

  const { data: album } = await supabase
    .from("albums")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (!album) notFound();

  const { data: media } = await supabase
    .from("album_media")
    .select("id, media_url, sort_order")
    .eq("album_id", id)
    .order("sort_order", { ascending: true });

  const photos = (media || []).filter((m: any) => m.media_url);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/gallery" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> All Albums
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{album.title}</h1>
          {album.description && <p className="text-lg text-white/80 max-w-2xl">{album.description}</p>}
          <p className="text-sm text-white/70 mt-2">{photos.length} photo{photos.length === 1 ? "" : "s"}</p>
        </div>
      </section>

      {/* Photos */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {photos.length === 0 ? (
            <div className="text-center py-16">
              <Images className="h-12 w-12 text-pewter mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">No photos yet</h3>
              <p className="text-pewter">Photos for this album are coming soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((m: any) => (
                <a
                  key={m.id}
                  href={m.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-square overflow-hidden rounded-lg border border-border bg-gray-50 group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.media_url}
                    alt={album.title}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
