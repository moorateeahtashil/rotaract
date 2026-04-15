import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Users, Briefcase, Globe, GraduationCap, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Five Avenues of Service",
  description: "Explore the Five Avenues of Service — Rotary International's philosophical cornerstone for service and mission objectives.",
};

// The Five Avenues of Service — Rotary International's philosophical cornerstone
const AVENUES = [
  {
    slug: "club-service",
    name: "Club Service",
    avenue: "First Avenue of Service",
    description:
      "Club Service works to strengthen fellowship of members through training and hospitality. Clubs have serious topics to work toward, so having various social events that bring members and their guests informally and for fun, contributes to genuine fellowship.",
    icon: Users,
    color: "#17458f",
    details:
      "Club Service encompasses everything we do to keep our club vibrant and effective. From welcoming new members and organizing meetings to planning social events and developing club leadership, this avenue ensures Rotaractors have the community and skills to serve others.",
  },
  {
    slug: "vocational-service",
    name: "Vocational Service",
    avenue: "Second Avenue of Service",
    description:
      "Vocational Service encourages members to serve other people through their vocations, education, skillsets, which encourages high ethical standards. October is Vocational Service Month when the many club service projects are celebrated.",
    icon: Briefcase,
    color: "#f7a81b",
    details:
      "Vocational Service recognizes that great service comes from skilled, confident people. Through workshops, mentoring, networking events, and opportunities to apply professional skills in club projects, this avenue helps Rotaractors become the leaders their communities need.",
  },
  {
    slug: "community-service",
    name: "Community Service",
    avenue: "Third Avenue of Service",
    description:
      "Community Service is exactly what the name implies — projects and activities each club undertakes to improve community life. Projects may include park improvements, senior center support, scholarships, and many more initiatives that directly benefit local communities.",
    icon: Heart,
    color: "#c50e2e",
    details:
      "Community Service is at the heart of what Rotaractors do. Through hands-on projects, fundraising, and partnerships with local organisations, we tackle real problems affecting real people in our community. This avenue turns compassion into action.",
  },
  {
    slug: "international-service",
    name: "International Service",
    avenue: "Fourth Avenue of Service",
    description:
      "International Service volunteers work to expand the Rotarians' humanitarian work around the world. This important service promotes understanding and peace, sponsors projects in other countries and works with international partners to support projects in their communities.",
    icon: Globe,
    color: "#009edb",
    details:
      "International Service reflects Rotary's belief that peace is built through friendship and understanding. We partner with clubs worldwide, support international projects, and explore global cultures and challenges — because the problems of one community are often the challenges of all communities.",
  },
  {
    slug: "new-generations-service",
    name: "New Generations Service",
    avenue: "Fifth Avenue of Service",
    description:
      "New Generations Service works to engage youths and young adults in leadership roles. Rotary Youth Leadership Awards (RYLA) is a training program for young people, ages 14 to 30. Rotaract is for ages 18 to 30 while Interact focuses on international service for youths 12 to 18.",
    icon: GraduationCap,
    color: "#2e7d32",
    details:
      "New Generations Service was approved as the Fifth Avenue of Service in April 2010 at the Council on Legislation in Chicago. This decision created impetus in synergy between Rotarians and Rotaractors, engaging youth in leadership and citizenship programs worldwide.",
  },
];

export default function AvenuesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Five Avenues of Service</h1>
          <p className="text-lg text-white/80 max-w-3xl">
            Rotary&apos;s ideal of service is based on the Five Avenues of Service — Club, Vocational, Community, International and New Generations — that comprise Rotary International&apos;s philosophical cornerstone. Rotary clubs carry out efforts along each avenue in support of the Object of Rotary.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl font-bold text-charcoal mb-4">The Object of Rotary</h2>
            <p className="text-pewter leading-relaxed mb-4">
              The mission of Rotary International is to provide service to others, promote integrity, and advance world understanding, goodwill, and peace through its fellowship of business, professional, and community leaders.
            </p>
            <p className="text-pewter leading-relaxed">
              Rotary Club guiding principles include the Four-way Test (Truth, Fairness, Goodwill, and Friendship). Other principles involve Rotary&apos;s commitment to Service above Self, Rotary&apos;s motto, which is channeled through the Five Avenues of Service: Club, Vocational, Community, International, and New Generations.
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
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="h-14 w-14 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${avenue.color}18` }}
                        >
                          <IconComponent className="h-7 w-7" style={{ color: avenue.color }} />
                        </div>
                        <Badge variant="outline" className="text-xs" style={{ borderColor: avenue.color, color: avenue.color }}>
                          {avenue.avenue}
                        </Badge>
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
