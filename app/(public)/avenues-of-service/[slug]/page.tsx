import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjects, getEvents } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, FolderKanban, Calendar, Heart, Users, Briefcase, Globe, Handshake } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

// Hardcoded Five Avenues of Service
const AVENUES = [
  {
    slug: "club-service",
    name: "Club Service",
    description: "Activities that strengthen and grow the Rotaract club itself — member development, fellowship, and building a cohesive team committed to service.",
    long_description: "Club Service encompasses everything we do to keep our club vibrant and effective. From welcoming new members and organizing meetings to planning social events and developing club leadership, this avenue ensures Rotaractors have the community and skills to serve others.\n\nWe invest in our own club so that we can better invest in the communities around us. Strong clubs produce strong service.",
    icon: Users,
    color: "#17458f",
  },
  {
    slug: "community-service",
    name: "Community Service",
    description: "Projects that directly address the needs of people in our local area — from education and health to environment and economic development.",
    long_description: "Community Service is at the heart of what Rotaractors do. Through hands-on projects, fundraising, and partnerships with local organisations, we tackle real problems affecting real people in our community. This avenue turns compassion into action.\n\nWhether it's a health camp, a literacy drive, or an environmental clean-up, Community Service brings our values to life in the places we call home.",
    icon: Heart,
    color: "#c50e2e",
  },
  {
    slug: "international-service",
    name: "International Service",
    description: "Activities that foster international understanding, peace, and goodwill — connecting Rotaractors across borders and supporting global humanitarian efforts.",
    long_description: "International Service reflects Rotary's belief that peace is built through friendship and understanding. We partner with clubs worldwide, support international projects, and explore global cultures and challenges — because the problems of one community are often the challenges of all communities.\n\nThrough international exchanges, joint projects, and global campaigns like End Polio Now, we become citizens of the world.",
    icon: Globe,
    color: "#009edb",
  },
  {
    slug: "professional-development",
    name: "Professional Development",
    description: "Programmes that help members grow their careers, develop leadership skills, and apply their professional expertise in service to others.",
    long_description: "Professional Development recognises that great service comes from skilled, confident people. Through workshops, mentoring, networking events, and opportunities to apply professional skills in club projects, this avenue helps Rotaractors become the leaders their communities need.\n\nWe believe in growing ourselves so we can grow others. Professional Development is where service and personal ambition unite.",
    icon: Briefcase,
    color: "#f7a81b",
  },
  {
    slug: "service-to-clubs",
    name: "Service to Clubs",
    description: "Efforts to strengthen relationships with our parent Rotary club, sponsor clubs, and other Rotaract clubs — building a broader network of service.",
    long_description: "Service to Clubs strengthens the bonds between Rotaractors and the wider Rotary family. By collaborating with our parent Rotary club, participating in District events, and supporting fellow Rotaract clubs, we amplify our collective impact and grow the movement of young service leaders.\n\nNo club succeeds alone. Service to Clubs is how we stay connected to the global network that makes our local work possible.",
    icon: Handshake,
    color: "#2e7d32",
  },
];

export async function generateStaticParams() {
  return AVENUES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const avenue = AVENUES.find((a) => a.slug === slug);
  if (!avenue) return { title: "Avenue Not Found" };
  return {
    title: avenue.name,
    description: avenue.description,
  };
}

export default async function AvenueDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const avenue = AVENUES.find((a) => a.slug === slug);
  if (!avenue) notFound();

  const IconComponent = avenue.icon;
  const otherAvenues = AVENUES.filter((a) => a.slug !== slug);

  return (
    <div>
      {/* Hero */}
      <section
        className="relative h-[40vh] min-h-[300px] overflow-hidden"
        style={{ backgroundColor: avenue.color }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-end pb-12">
          <div className="text-white">
            <Link href="/avenues-of-service" className="inline-flex items-center text-white/80 hover:text-white mb-4 text-sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Avenues
            </Link>
            <div className="flex items-center gap-4 mb-3">
              <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                <IconComponent className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">{avenue.name}</h1>
            <p className="text-lg text-white/80 max-w-2xl">{avenue.description}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              {avenue.long_description && (
                <div className="prose max-w-none">
                  {avenue.long_description.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="text-charcoal leading-relaxed mb-4">{paragraph}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Other Avenues */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-charcoal">Other Avenues</h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  {otherAvenues.map((a) => {
                    const OtherIcon = a.icon;
                    return (
                      <Link
                        key={a.slug}
                        href={`/avenues-of-service/${a.slug}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${a.color}18` }}
                        >
                          <OtherIcon className="h-4 w-4" style={{ color: a.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-charcoal">{a.name}</p>
                          <p className="text-xs text-pewter line-clamp-1">{a.description.split(" — ")[0]}</p>
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>

              {/* CTA */}
              <Card style={{ backgroundColor: avenue.color }} className="text-white border-0">
                <CardContent className="pt-6 text-center">
                  <h3 className="font-semibold mb-2">Get Involved</h3>
                  <p className="text-sm text-white/80 mb-4">
                    Join us in making an impact through this avenue.
                  </p>
                  <Button asChild className="bg-rotary-gold text-black hover:bg-rotary-gold/90 w-full">
                    <Link href="/join">
                      Join Us <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
