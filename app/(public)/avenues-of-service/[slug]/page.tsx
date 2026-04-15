import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjects, getEvents } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Heart, Users, Briefcase, Globe, GraduationCap } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

// The Five Avenues of Service — Rotary International's philosophical cornerstone
const AVENUES = [
  {
    slug: "club-service",
    name: "Club Service",
    avenue: "First Avenue of Service",
    description: "Club Service works to strengthen fellowship of members through training and hospitality.",
    long_description: "Club Service works to strengthen fellowship of members through training and hospitality. Clubs have serious topics to work toward, so having various social events that bring members and their guests informally and for fun, contributes to genuine fellowship.\n\nClub Service encompasses everything we do to keep our club vibrant and effective. From welcoming new members and organizing meetings to planning social events and developing club leadership, this avenue ensures Rotaractors have the community and skills to serve others.\n\nWe invest in our own club so that we can better invest in the communities around us. Strong clubs produce strong service.",
    icon: Users,
    color: "#17458f",
  },
  {
    slug: "vocational-service",
    name: "Vocational Service",
    avenue: "Second Avenue of Service",
    description: "Vocational Service encourages members to serve other people through their vocations, education, skillsets, which encourages high ethical standards.",
    long_description: "Vocational Service encourages members to serve other people through their vocations, education, skillsets, which encourages high ethical standards. October is Vocational Service Month when the many club service projects are celebrated.\n\nVocational Service recognizes that great service comes from skilled, confident people. Through workshops, mentoring, networking events, and opportunities to apply professional skills in club projects, this avenue helps Rotaractors become the leaders their communities need.\n\nWe believe in growing ourselves so we can grow others. Professional Development is where service and personal ambition unite.",
    icon: Briefcase,
    color: "#f7a81b",
  },
  {
    slug: "community-service",
    name: "Community Service",
    avenue: "Third Avenue of Service",
    description: "Community Service is projects and activities each club undertakes to improve community life.",
    long_description: "Community Service is exactly what the name implies — projects and activities each club undertakes to improve community life. There are many projects in which Rotaractors have been involved: park improvements, senior center support, scholarships, and more.\n\nCommunity Service is at the heart of what Rotaractors do. Through hands-on projects, fundraising, and partnerships with local organisations, we tackle real problems affecting real people in our community. This avenue turns compassion into action.\n\nWhether it's a health camp, a literacy drive, or an environmental clean-up, Community Service brings our values to life in the places we call home.",
    icon: Heart,
    color: "#c50e2e",
  },
  {
    slug: "international-service",
    name: "International Service",
    avenue: "Fourth Avenue of Service",
    description: "International Service volunteers work to expand humanitarian work around the world.",
    long_description: "International Service volunteers work to expand the Rotarians' humanitarian work around the world. This important service promotes understanding and peace, sponsors projects in other countries and works with international partners to support projects in their communities.\n\nInternational Service reflects Rotary's belief that peace is built through friendship and understanding. We partner with clubs worldwide, support international projects, and explore global cultures and challenges — because the problems of one community are often the challenges of all communities.\n\nThrough international exchanges, joint projects, and global campaigns like End Polio Now, we become citizens of the world.",
    icon: Globe,
    color: "#009edb",
  },
  {
    slug: "new-generations-service",
    name: "New Generations Service",
    avenue: "Fifth Avenue of Service",
    description: "New Generations Service works to engage youths and young adults in leadership roles.",
    long_description: "New Generations Service works to engage youths and young adults in leadership roles. Rotary Youth Leadership Awards (RYLA) is a training program for young people, ages 14 to 30. The award emphasizes leadership and citizenship.\n\nRotaract is an International Youth Program is for ages 18 to 30 while Interact focuses on international service for youths 12 to 18.\n\nIn April 2010, representatives at the Council on Legislation met in Chicago, USA and approved New Generations as the Fifth Avenue of Service in Rotary. The news of the Council's decision was welcomed with excitement and enthusiasm by Rotarians across the globe since this would create impetus in synergy between Rotarians and Rotaractors.",
    icon: GraduationCap,
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
              <Badge className="bg-white/20 text-white border-white/30">
                {avenue.avenue}
              </Badge>
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
