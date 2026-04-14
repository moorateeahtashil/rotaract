import { getSponsorClub } from "@/lib/db/queries";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Globe, ArrowRight, Users } from "lucide-react";

export const metadata = {
  title: "Sponsor Rotary Clubs",
  description: "Our club is proudly sponsored by established Rotary clubs that mentor and guide us.",
};

export default async function SponsorsPage() {
  const sponsors = await getSponsorClub();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Sponsor Rotary Clubs</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Our club is proudly mentored and sponsored by established Rotary clubs committed to developing young leaders.
          </p>
        </div>
      </section>

      {/* About Sponsorship */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl font-bold text-charcoal mb-4">The Power of Sponsorship</h2>
            <p className="text-pewter leading-relaxed">
              Every Rotaract club is sponsored by one or more Rotary clubs. Our sponsors provide invaluable 
              mentorship, resources, and guidance as we develop as leaders. They help us navigate the Rotary 
              family and connect with the global network of service.
            </p>
          </div>

          {/* Sponsors Grid */}
          {sponsors.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {sponsors.map((sponsor: any) => (
                <Card key={sponsor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="h-16 w-16 rounded-lg bg-rotary-blue/10 flex items-center justify-center mb-4">
                      {sponsor.logo_url ? (
                        <img src={sponsor.logo_url} alt={sponsor.name} className="h-full w-full object-contain rounded-lg" />
                      ) : (
                        <Building2 className="h-8 w-8 text-rotary-blue" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-charcoal">{sponsor.name}</h3>
                    {sponsor.description && (
                      <p className="text-sm text-pewter">{sponsor.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sponsor.website && (
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-rotary-blue hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Visit Website
                      </a>
                    )}
                    {sponsor.meeting_info && (
                      <div className="text-sm text-pewter">
                        <strong>Meetings:</strong> {sponsor.meeting_info}
                      </div>
                    )}
                    {sponsor.message && (
                      <blockquote className="text-sm italic text-charcoal/70 border-l-2 border-rotary-gold pl-3">
                        "{sponsor.message}"
                      </blockquote>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-pewter mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">Sponsor information coming soon</h3>
              <p className="text-pewter">We'll share our sponsor club details shortly.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-charcoal mb-4">Interested in Partnership?</h2>
          <p className="text-pewter mb-6 max-w-xl mx-auto">
            Rotary clubs and organizations interested in collaboration or sponsorship are welcome to reach out.
          </p>
          <Button asChild size="lg" className="bg-rotary-blue hover:bg-rotary-blue/90">
            <Link href="/contact">
              Get in Touch <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
