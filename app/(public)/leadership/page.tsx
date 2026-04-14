import { getBoardMembers, getBoardPositions } from "@/lib/db/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Briefcase } from "lucide-react";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "Leadership & Board Members",
  description: "Meet the dedicated leaders guiding our Rotaract club in service to the community.",
};

export default async function LeadershipPage() {
  const boardMembers = await getBoardMembers({ current: true });
  const positions = await getBoardPositions();

  // Group board members by position
  const boardByPosition = positions.map((position) => ({
    ...position,
    members: boardMembers.filter((bm: any) => bm.position_id === position.id),
  }));

  const currentBoard = boardByPosition.filter((p) => p.members.length > 0);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Our Leadership</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Meet the dedicated board members who lead our club with vision, passion, and commitment to service.
          </p>
        </div>
      </section>

      {/* Section nav */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <Link
              href="/members"
              className="py-4 text-sm font-medium text-pewter hover:text-charcoal transition-colors"
            >
              All Members
            </Link>
            <Link
              href="/leadership"
              className="py-4 text-sm font-medium text-rotary-blue border-b-2 border-rotary-blue"
            >
              Board Members
            </Link>
          </div>
        </div>
      </div>

      {/* Board Members */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {currentBoard.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-pewter mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">Board information coming soon</h3>
              <p className="text-pewter">Our new board will be announced shortly.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {currentBoard.map((position) => (
                <div key={position.id}>
                  <h2 className="text-2xl font-bold text-charcoal mb-6 flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-rotary-blue" />
                    {position.title}
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {position.members.map((bm: any) => {
                      const profile = bm.member?.profile;
                      return (
                        <Card key={bm.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="pt-6 text-center">
                            <Avatar className="h-24 w-24 mx-auto mb-4">
                              <AvatarImage src={bm.photo_url || profile?.avatar_url || ""} alt={profile ? `${profile.first_name} ${profile.last_name}` : ""} />
                              <AvatarFallback className="text-lg bg-rotary-blue text-white">
                                {profile ? getInitials(profile.first_name, profile.last_name) : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold text-lg text-charcoal">
                              {profile ? `${profile.first_name} ${profile.last_name}` : "Unknown"}
                            </h3>
                            <p className="text-sm text-rotary-blue font-medium mb-1">
                              {bm.custom_title || position.title}
                            </p>
                            {profile?.occupation && (
                              <p className="text-xs text-pewter mb-2">{profile.occupation}</p>
                            )}
                            {bm.term_start && (
                              <Badge variant="outline" className="text-xs">
                                Term: {new Date(bm.term_start).getFullYear()}
                                {bm.term_end ? ` – ${new Date(bm.term_end).getFullYear()}` : " – Present"}
                              </Badge>
                            )}
                            {profile?.email && (
                              <a
                                href={`mailto:${profile.email}`}
                                className="inline-flex items-center gap-1 text-sm text-rotary-blue hover:underline mt-3"
                              >
                                <Mail className="h-3.5 w-3.5" />
                                Contact
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-charcoal mb-4">Interested in Leading?</h2>
          <p className="text-pewter mb-6 max-w-xl mx-auto">
            Leadership opportunities are available for active members. Get involved and grow as a leader.
          </p>
        </div>
      </section>
    </div>
  );
}
