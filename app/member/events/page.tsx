import { requireMember } from "@/lib/auth/guards";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUpcomingEvents, getEvents } from "@/lib/db/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "My Events" };

export default async function MemberEventsPage() {
  const guard = await requireMember();
  if ("redirectTo" in guard) return redirect(guard.redirectTo);

  const events = await getUpcomingEvents(20);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">My Events</h1>
        <p className="text-pewter mt-1">Upcoming events you can attend</p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-10 w-10 text-pewter mx-auto mb-4" />
            <h3 className="font-semibold text-charcoal mb-1">No upcoming events</h3>
            <p className="text-sm text-pewter">Check back later for new events.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {events.map((event: any) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    <Link href={`/events/${event.slug}`} className="hover:text-rotary-blue transition-colors">
                      {event.title}
                    </Link>
                  </CardTitle>
                  {event.is_featured && <Badge className="bg-rotary-gold text-black text-xs">Featured</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-pewter line-clamp-2">{event.description}</p>
                <div className="flex items-center gap-4 text-xs text-pewter">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(event.date)}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.location}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  {event.registration_open && (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                      Registration Open
                    </Badge>
                  )}
                  <Button asChild variant="ghost" size="sm" className="ml-auto">
                    <Link href={`/events/${event.slug}`}>
                      Details <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
