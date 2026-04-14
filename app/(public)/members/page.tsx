import { Suspense } from "react";
import Link from "next/link";
import { getMembers } from "@/lib/db/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Briefcase } from "lucide-react";
import { getInitials } from "@/lib/utils";

export const metadata = {
  title: "Our Members",
  description: "Meet the passionate members of our Rotaract club who drive change in the community.",
};

async function MembersGrid({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.q;
  const members = await getMembers({ status: "active", showInDirectory: true, limit: 50 });

  const filtered = search
    ? members.filter((m: any) => {
        const name = `${m.profile?.first_name || ""} ${m.profile?.last_name || ""}`.toLowerCase();
        const classification = (m.classification || "").toLowerCase();
        const q = search.toLowerCase();
        return name.includes(q) || classification.includes(q);
      })
    : members;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="h-12 w-12 text-pewter mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-charcoal mb-2">No members found</h3>
        <p className="text-pewter">Try adjusting your search.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      <form className="mb-8" role="search">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pewter" />
          <input
            type="search"
            name="q"
            placeholder="Search members..."
            defaultValue={search}
            className="pl-9 pr-4 py-2 w-full border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30 focus:border-rotary-blue"
          />
        </div>
      </form>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((member: any) => {
          const profile = member.profile;
          const name = profile ? `${profile.first_name} ${profile.last_name}` : "Unknown Member";
          return (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center">
                <Avatar className="h-16 w-16 mx-auto mb-3">
                  <AvatarImage src={profile?.avatar_url || ""} alt={name} />
                  <AvatarFallback className="bg-rotary-blue/10 text-rotary-blue font-semibold">
                    {profile ? getInitials(profile.first_name, profile.last_name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-charcoal">{name}</h3>
                {member.classification && (
                  <p className="text-xs text-pewter mt-1">{member.classification}</p>
                )}
                {profile?.occupation && (
                  <div className="flex items-center justify-center gap-1 mt-2 text-xs text-pewter">
                    <Briefcase className="h-3 w-3" />
                    {profile.occupation}
                  </div>
                )}
                {member.join_date && (
                  <Badge variant="outline" className="text-xs mt-2">
                    Member since {new Date(member.join_date).getFullYear()}
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function MembersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Our Members</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            The passionate individuals who make up our Rotaract family and drive meaningful change.
          </p>
        </div>
      </section>

      {/* Section nav */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <Link
              href="/members"
              className="py-4 text-sm font-medium text-rotary-blue border-b-2 border-rotary-blue"
            >
              All Members
            </Link>
            <Link
              href="/leadership"
              className="py-4 text-sm font-medium text-pewter hover:text-charcoal transition-colors"
            >
              Board Members
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            }
          >
            <MembersGrid searchParams={searchParams} />
          </Suspense>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-charcoal mb-4">Join Our Community</h2>
          <p className="text-pewter mb-6 max-w-xl mx-auto">
            Become part of a global network of young leaders committed to making a difference.
          </p>
          <Link
            href="/join"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rotary-gold text-black font-semibold rounded-lg hover:bg-rotary-gold/90 transition-colors"
          >
            Apply for Membership
          </Link>
        </div>
      </section>
    </div>
  );
}
