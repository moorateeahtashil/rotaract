import { Suspense } from "react";
import Link from "next/link";
import { getEvents, getAvenues } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Events & Calendar",
  description: "Stay updated with our upcoming events, meetings, and service activities.",
};

async function EventsContent({ searchParams }: { searchParams: Promise<{ tab?: string; type?: string }> }) {
  const resolvedParams = await searchParams;
  const tab = resolvedParams.tab || "upcoming";
  const upcoming = tab === "upcoming";
  const events = await getEvents({ upcoming, eventType: resolvedParams.type || undefined });
  const avenues = await getAvenues();

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <Calendar className="h-12 w-12 text-pewter mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-charcoal mb-2">No events found</h3>
        <p className="text-pewter">Check back later for upcoming events.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex gap-2">
          <Link
            href="/events?tab=upcoming"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === "upcoming"
                ? "bg-rotary-blue text-white"
                : "bg-gray-100 text-charcoal hover:bg-gray-200"
            }`}
          >
            Upcoming
          </Link>
          <Link
            href="/events?tab=all"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === "all"
                ? "bg-rotary-blue text-white"
                : "bg-gray-100 text-charcoal hover:bg-gray-200"
            }`}
          >
            All Events
          </Link>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="h-40 bg-gradient-to-br from-rotary-blue/10 to-azure/10 flex items-center justify-center relative">
              {event.image_url ? (
                <img
                  loading="lazy"
                  decoding="async"
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <Calendar className="h-10 w-10 text-rotary-blue/30" />
              )}
              {event.is_featured && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-rotary-gold text-black text-xs">Featured</Badge>
                </div>
              )}
              <div className="absolute top-3 right-3">
                <Badge
                  variant={event.status === "published" ? "default" : event.status === "ongoing" ? "secondary" : "outline"}
                >
                  {event.status}
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <h3 className="font-semibold text-charcoal group-hover:text-rotary-blue transition-colors line-clamp-1">
                <Link href={`/events/${event.slug}`}>{event.title}</Link>
              </h3>
              {event.event_type && (
                <Badge variant="outline" className="text-xs">
                  {event.event_type}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm text-pewter line-clamp-2">{event.description}</p>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 text-xs text-pewter">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(event.date)}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
              {event.registration_open && (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                  Registration Open
                </Badge>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function EventsPage({ searchParams }: { searchParams: Promise<{ tab?: string; type?: string }> }) {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Events & Calendar</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Stay connected with our club activities — from service projects and meetings to fellowship and training events.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            }
          >
            <EventsContent searchParams={searchParams} />
          </Suspense>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-charcoal mb-4">Book a Meeting</h2>
          <p className="text-pewter mb-6 max-w-xl mx-auto">
            Want to learn more about our club? Book an orientation meeting with us.
          </p>
          <Button asChild size="lg" className="bg-rotary-gold text-black hover:bg-rotary-gold/90">
            <Link href="/contact">
              Get in Touch <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
