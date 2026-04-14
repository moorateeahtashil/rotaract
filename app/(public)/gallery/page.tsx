import { getAlbums } from "@/lib/db/queries";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Images } from "lucide-react";

export const metadata = {
  title: "Photo Gallery",
  description: "Browse photos from our events, projects, meetings, and fellowship activities.",
};

export default async function GalleryPage() {
  const albums = await getAlbums();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Photo Gallery</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Capturing moments of impact, fellowship, and service from our Rotaract journey.
          </p>
        </div>
      </section>

      {/* Albums */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {albums.length === 0 ? (
            <div className="text-center py-16">
              <Images className="h-12 w-12 text-pewter mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">Gallery coming soon</h3>
              <p className="text-pewter">We're uploading photos from our recent events and projects.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album: any) => (
                <Link key={album.id} href={`/gallery/${album.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
                    <div className="h-48 bg-gradient-to-br from-rotary-blue/10 to-azure/10 flex items-center justify-center relative">
                      {album.cover_image_url ? (
                        <img
                          src={album.cover_image_url}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Camera className="h-10 w-10 text-rotary-blue/30" />
                      )}
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-charcoal mb-1 group-hover:text-rotary-blue transition-colors">
                        {album.title}
                      </h3>
                      {album.description && (
                        <p className="text-sm text-pewter line-clamp-2">{album.description}</p>
                      )}
                      <p className="text-xs text-pewter mt-2">
                        {album.media_count || 0} photos
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
