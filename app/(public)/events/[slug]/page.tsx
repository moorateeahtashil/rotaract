import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventBySlug, getUpcomingEvents } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  ArrowRight,
  Users,
  Link2,
  DollarSign,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) return { title: "Event Not Found" };

  return {
    title: event.seo_title || event.title,
    description: event.seo_description || event.description,
    openGraph: {
      title: event.seo_title || event.title,
      description: event.seo_description || event.description,
      images: event.og_image_url ? [{ url: event.og_image_url }] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug);
  if (!event) notFound();

  const related = await getUpcomingEvents(3);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] bg-charcoal overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-rotary-blue to-azure" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-end pb-12">
          <div className="text-white">
            <Link href="/events" className="inline-flex items-center text-white/80 hover:text-white mb-4 text-sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Events
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-rotary-gold text-black">{event.status}</Badge>
              {event.event_type && (
                <Badge variant="outline" className="border-white/30 text-white">
                  {event.event_type}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              <p className="text-lg text-charcoal/80 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              {event.long_description && (
                <div className="text-charcoal/70 leading-relaxed whitespace-pre-wrap">
                  {event.long_description}
                </div>
              )}

              {/* Map */}
              {event.map_embed_url && (
                <div className="rounded-lg overflow-hidden border border-border">
                  <iframe
                    src={event.map_embed_url}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Event Location"
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Details */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-rotary-blue mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-charcoal">Date & Time</p>
                      <p className="text-sm text-pewter">{formatDateTime(event.date)}</p>
                      {event.end_date && (
                        <p className="text-sm text-pewter">Ends: {formatDateTime(event.end_date)}</p>
                      )}
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-rotary-blue mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-charcoal">Location</p>
                        <p className="text-sm text-pewter">{event.location}</p>
                      </div>
                    </div>
                  )}

                  {event.location_url && (
                    <div className="flex items-start gap-3">
                      <Link2 className="h-5 w-5 text-rotary-blue mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-charcoal">Link</p>
                        <a
                          href={event.location_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-rotary-blue hover:underline break-all"
                        >
                          {event.location_url}
                        </a>
                      </div>
                    </div>
                  )}

                  {event.capacity && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-rotary-blue mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-charcoal">Capacity</p>
                        <p className="text-sm text-pewter">{event.capacity} attendees</p>
                      </div>
                    </div>
                  )}

                  {event.registration_fee && event.registration_fee > 0 && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-rotary-blue mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-charcoal">Registration Fee</p>
                        <p className="text-sm text-pewter">₹{event.registration_fee}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Registration CTA */}
              {event.registration_open && (
                <Card className="bg-rotary-blue text-white">
                  <CardContent className="pt-6 text-center">
                    <h3 className="font-semibold mb-2">Registration Open</h3>
                    <p className="text-sm text-white/80 mb-4">
                      {event.registration_deadline
                        ? `Register by ${formatDate(event.registration_deadline)}`
                        : "Register now to secure your spot"}
                    </p>
                    <Button className="bg-rotary-gold text-black hover:bg-rotary-gold/90 w-full">
                      Register Now
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Add to Calendar */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-charcoal mb-3">Add to Calendar</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      .ics
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Google
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Related Events */}
      {related.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-charcoal">More Events</h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/events">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {related
                .filter((e: any) => e.id !== event.id)
                .slice(0, 3)
                .map((e: any) => (
                  <Link
                    key={e.id}
                    href={`/events/${e.slug}`}
                    className="block p-4 bg-white rounded-lg border border-border hover:border-rotary-blue/30 transition-colors"
                  >
                    <p className="text-xs text-pewter mb-1">{formatDate(e.date)}</p>
                    <h3 className="font-medium text-charcoal line-clamp-1">{e.title}</h3>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
