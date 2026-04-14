import { requireMember } from "@/lib/auth/guards";
import { createServerClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "My Bookings" };

export default async function MemberBookingsPage() {
  const guard = await requireMember();
  if ("redirectTo" in guard) return redirect(guard.redirectTo);

  const supabase = await createServerClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `
      *,
      booking_type:booking_types(name, slug, description),
      slot:booking_slots(start_time, end_time)
    `,
    )
    .eq("member_id", guard.userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const { data: bookingTypes } = await supabase
    .from("booking_types")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-700",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">My Bookings</h1>
        <p className="text-pewter mt-1">Manage your bookings and reservations</p>
      </div>

      {/* Available Booking Types */}
      {bookingTypes && bookingTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Booking Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookingTypes.map((type: any) => (
                <Card key={type.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-charcoal">{type.name}</h3>
                    {type.description && (
                      <p className="text-sm text-pewter mt-1 line-clamp-2">{type.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-pewter">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {type.duration_minutes} min
                      </span>
                      {type.requires_approval && (
                        <Badge variant="outline" className="text-xs">Requires Approval</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings List */}
      {!bookings || bookings.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-10 w-10 text-pewter mx-auto mb-4" />
            <h3 className="font-semibold text-charcoal mb-1">No bookings yet</h3>
            <p className="text-sm text-pewter">You haven't made any bookings. Check back after you create one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-charcoal">
                      {booking.booking_type?.name || "Booking"}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-pewter">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(booking.start_time)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(booking.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {" - "}
                        {new Date(booking.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {booking.notes && (
                      <p className="text-sm text-pewter mt-2 line-clamp-2">{booking.notes}</p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={statusColors[booking.status] || "bg-gray-100 text-gray-700"}
                  >
                    {booking.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
