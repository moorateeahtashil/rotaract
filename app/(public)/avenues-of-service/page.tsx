import { getAvenues } from "@/lib/db/queries";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Briefcase, Globe, GraduationCap, Leaf, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Avenues of Service",
  description: "Explore the six pathways through which Rotaractors serve their communities and grow as leaders.",
};

const AVENUE_ICONS: Record<string, React.ElementType> = {
  "club-development": Users,
  "community-service": Heart,
  "vocational-service": Briefcase,
  "international-service": Globe,
  "professional-development": GraduationCap,
  environment: Leaf,
};

export default async function AvenuesPage() {
  const avenues = await getAvenues();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Avenues of Service</h1>
          <p className="text-lg text-white/80 max-w-3xl">
            The six pathways through which Rotaractors serve their communities, develop professionally, 
            and connect globally to create lasting impact.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl font-bold text-charcoal mb-4">Six Pathways to Impact</h2>
            <p className="text-pewter leading-relaxed">
              Each avenue represents a unique way for Rotaractors to make a difference — from strengthening 
              our own club to serving communities locally and internationally, developing professionally, 
              and protecting our environment.
            </p>
          </div>

          {/* Avenues Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {avenues.map((avenue: any) => {
              const IconComponent = AVENUE_ICONS[avenue.slug] || Heart;
              return (
                <Link key={avenue.id} href={`/avenues-of-service/${avenue.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow group border-t-4" style={{ borderTopColor: avenue.color_hex || "#17458f" }}>
                    <CardHeader>
                      <div
                        className="h-14 w-14 rounded-lg flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${avenue.color_hex || "#17458f"}15` }}
                      >
                        <IconComponent className="h-7 w-7" style={{ color: avenue.color_hex || "#17458f" }} />
                      </div>
                      <h3 className="text-lg font-semibold text-charcoal group-hover:text-rotary-blue transition-colors">
                        {avenue.name}
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-pewter line-clamp-3">{avenue.description}</p>
                      <span className="inline-flex items-center gap-1 text-sm text-rotary-blue mt-4 group-hover:gap-2 transition-all">
                        Learn more <ArrowRight className="h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-charcoal mb-4">Get Involved</h2>
          <p className="text-pewter mb-6 max-w-xl mx-auto">
            Find an avenue that resonates with you and join our projects to make a real difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-rotary-gold text-black hover:bg-rotary-gold/90">
              <Link href="/projects">
                View Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/join">Join Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
