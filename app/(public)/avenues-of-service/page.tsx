import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Briefcase, Globe, Handshake, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Avenues of Service",
  description: "Explore the five pathways through which Rotaractors serve their communities and grow as leaders.",
};

// The five standard Rotaract Avenues of Service — hardcoded per Rotary International guidelines
const AVENUES = [
  {
    slug: "club-service",
    name: "Club Service",
    description:
      "Activities that strengthen and grow the Rotaract club itself — member development, fellowship, and building a cohesive team committed to service.",
    icon: Users,
    color: "#17458f",
    details:
      "Club Service encompasses everything we do to keep our club vibrant and effective. From welcoming new members and organizing meetings to planning social events and developing club leadership, this avenue ensures Rotaractors have the community and skills to serve others.",
  },
  {
    slug: "community-service",
    name: "Community Service",
    description:
      "Projects that directly address the needs of people in our local area — from education and health to environment and economic development.",
    icon: Heart,
    color: "#c50e2e",
    details:
      "Community Service is at the heart of what Rotaractors do. Through hands-on projects, fundraising, and partnerships with local organisations, we tackle real problems affecting real people in our community. This avenue turns compassion into action.",
  },
  {
    slug: "international-service",
    name: "International Service",
    description:
      "Activities that foster international understanding, peace, and goodwill — connecting Rotaractors across borders and supporting global humanitarian efforts.",
    icon: Globe,
    color: "#009edb",
    details:
      "International Service reflects Rotary's belief that peace is built through friendship and understanding. We partner with clubs worldwide, support international projects, and explore global cultures and challenges — because the problems of one community are often the challenges of all communities.",
  },
  {
    slug: "professional-development",
    name: "Professional Development",
    description:
      "Programmes that help members grow their careers, develop leadership skills, and apply their professional expertise in service to others.",
    icon: Briefcase,
    color: "#f7a81b",
    details:
      "Professional Development recognises that great service comes from skilled, confident people. Through workshops, mentoring, networking events, and opportunities to apply professional skills in club projects, this avenue helps Rotaractors become the leaders their communities need.",
  },
  {
    slug: "service-to-clubs",
    name: "Service to Clubs",
    description:
      "Efforts to strengthen relationships with our parent Rotary club, sponsor clubs, and other Rotaract clubs — building a broader network of service.",
    icon: Handshake,
    color: "#2e7d32",
    details:
      "Service to Clubs strengthens the bonds between Rotaractors and the wider Rotary family. By collaborating with our parent Rotary club, participating in District events, and supporting fellow Rotaract clubs, we amplify our collective impact and grow the movement of young service leaders.",
  },
];

export default function AvenuesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Avenues of Service</h1>
          <p className="text-lg text-white/80 max-w-3xl">
            The five pathways through which Rotaractors serve their communities, develop professionally,
            and connect globally to create lasting impact.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl font-bold text-charcoal mb-4">Five Pathways to Impact</h2>
            <p className="text-pewter leading-relaxed">
              Each avenue represents a unique way for Rotaractors to make a difference — from strengthening
              our own club to serving communities locally and internationally, developing professionally,
              and strengthening our ties with the global Rotary family.
            </p>
          </div>

          {/* Avenues Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVENUES.map((avenue) => {
              const IconComponent = avenue.icon;
              return (
                <Link key={avenue.slug} href={`/avenues-of-service/${avenue.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow group border-t-4" style={{ borderTopColor: avenue.color }}>
                    <CardHeader>
                      <div
                        className="h-14 w-14 rounded-lg flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${avenue.color}18` }}
                      >
                        <IconComponent className="h-7 w-7" style={{ color: avenue.color }} />
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
