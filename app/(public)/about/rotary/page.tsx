import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Calendar,
  Users,
  Globe,
  Heart,
  Award,
  Target,
  ArrowRight,
  CheckCircle2,
  Quote,
  Shield,
  Scale,
  HandHeart,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "About Rotary International — History & Legacy",
  description: "Discover the rich 120+ year history of Rotary International and its global impact.",
};

const TIMELINE = [
  { year: "1905", title: "Rotary Founded", description: "Paul P. Harris founded the first Rotary club in Chicago, Illinois, USA with four businessmen." },
  { year: "1910", title: "National Association", description: "National Association of Rotary Clubs formed in the United States." },
  { year: "1912", title: "Royal Charter", description: "King George V grants Royal Charter to Rotary, establishing it in Great Britain and Ireland." },
  { year: "1917", title: "The Rotary Foundation", description: "Arch C. Klumphann establishes the Rotary Foundation to 'do good in the world.'" },
  { year: "1922", title: "Rotary International", description: "The organization adopts the name 'Rotary International' as clubs expand globally." },
  { year: "1947", title: "PolioPlus Vision", description: "After Paul Harris's death, Rotary launches what becomes its most ambitious program — PolioPlus." },
  { year: "1968", title: "Rotaract Established", description: "Rotaract is established, providing young adults (18-30) opportunities for service and leadership." },
  { year: "1985", title: "PolioEnd", description: "Rotary launches its mission to eradicate polio worldwide through PolioPlus initiative." },
  { year: "1989", title: "Women Members", description: "Rotary Council of Legislation admits women to membership for the first time." },
  { year: "2010", title: "New Generations Service", description: "New Generations approved as the Fifth Avenue of Service at Council on Legislation in Chicago." },
  { year: "2019", title: "1.4 Million Strong", description: "Rotary reaches 1.4 million members across 46,000+ clubs in 200+ countries and geographical areas." },
  { year: "2025", title: "Continuing the Mission", description: "Rotary continues to lead global efforts in polio eradication, peace building, and community development." },
];

export default function AboutRotaryPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">Since 1905</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">About Rotary International</h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Rotary International is a global network of 1.4 million neighbors, friends, leaders, and problem-solvers
            who see a world where people unite and take action to create lasting change.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button asChild size="lg" className="bg-rotary-gold text-black hover:bg-rotary-gold/90 font-semibold px-8">
              <Link href="https://www.rotary.org/en" target="_blank" rel="noopener noreferrer">
                Visit Rotary.org <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-white/10 text-white hover:bg-white/20 font-semibold px-8 border border-white/20">
              <Link href="/about">Learn About Rotaract</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "1.4M+", label: "Members Worldwide", icon: Users },
              { value: "46,000+", label: "Clubs Globally", icon: Globe },
              { value: "200+", label: "Countries & Areas", icon: Calendar },
              { value: "120+", label: "Years of Service", icon: Award },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 text-rotary-blue mx-auto mb-3" />
                <div className="text-3xl font-bold text-charcoal mb-1">{stat.value}</div>
                <div className="text-sm text-pewter">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-3">Our History</h2>
            <p className="text-pewter max-w-2xl mx-auto">
              Over 120 years of service, fellowship, and creating positive change in communities worldwide
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-rotary-blue/20 to-rotary-gold/20 hidden lg:block" />

            <div className="space-y-12 lg:space-y-16">
              {TIMELINE.map((item, index) => (
                <div key={item.year} className={`relative flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  {/* Year Badge - Center */}
                  <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-br from-rotary-blue to-azure text-white rounded-full h-14 w-14 flex items-center justify-center font-bold text-sm shadow-lg border-4 border-white">
                      {item.year.slice(-2)}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-16 lg:text-right' : 'lg:pl-16'}`}>
                    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-border group">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-rotary-gold text-black font-semibold">{item.year}</Badge>
                        <div className="h-1 flex-1 bg-gradient-to-r from-rotary-blue/20 to-rotary-gold/20 rounded-full" />
                      </div>
                      <h3 className="text-lg font-bold text-charcoal mb-2">{item.title}</h3>
                      <p className="text-sm text-pewter leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <div className="hidden lg:block lg:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seven Areas of Focus */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-3">Seven Areas of Focus</h2>
          </div>

          {/* Seven Areas of Focus Image */}
          <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg border border-border">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/avenue.png`}
              alt="Seven Areas of Focus - Rotary International"
              className="w-full"
            />
          </div>

          <div className="text-center mt-10">
            <Button asChild className="bg-rotary-blue hover:bg-rotary-blue/90 font-semibold px-6">
              <Link href="https://www.rotary.org/en/what-we-do" target="_blank" rel="noopener noreferrer">
                Explore All Rotary Initiatives <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* The Rotary Foundation */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-rotary-blue/5 to-azure/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-4">The Rotary Foundation</h2>
              <p className="text-pewter leading-relaxed mb-6">
                The Rotary Foundation transforms your gifts into service projects that change lives and build communities
                around the world. Established in 1917, the Foundation has grown into one of the world&apos;s leading
                non-profit foundations.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Supports PolioPlus — the effort to eradicate polio worldwide",
                  "Funds Rotary Peace Centers at leading universities",
                  "Provides grants for humanitarian service projects",
                  "Offers scholarships and educational programs",
                  "Invests in future leaders through youth programs",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-rotary-blue flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-charcoal">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="bg-rotary-blue hover:bg-rotary-blue/90">
                <Link href="https://www.rotary.org/en/ways-give/rotary-foundation" target="_blank" rel="noopener noreferrer">
                  Learn About The Foundation <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="bg-white rounded-lg p-8 border border-border shadow-sm">
              <Quote className="h-8 w-8 text-rotary-gold mb-4" />
              <blockquote className="text-lg text-charcoal italic leading-relaxed mb-4">
                &ldquo;The Rotary Foundation is the best vehicle for promoting world understanding and goodwill
                through humanitarian service.&rdquo;
              </blockquote>
              <p className="text-sm text-pewter font-medium">— Arch C. Klumphann, Founder of The Rotary Foundation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rotary Motto */}
      <section className="py-20 bg-gradient-to-r from-rotary-blue to-azure text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">&ldquo;Service Above Self&rdquo;</h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            Rotary&apos;s principal motto drives everything we do — putting the needs of others first
            and working together to create positive, lasting change in our communities and around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-rotary-gold text-black hover:bg-rotary-gold/90">
              <Link href="/join">Join Our Club</Link>
            </Button>
            <Button asChild size="lg" className="bg-white/10 text-white hover:bg-white/20 border border-white/30">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Four-Way Test - Modern UI/UX */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-rotary-blue/10 rounded-full px-4 py-2 mb-4">
              <Shield className="h-4 w-4 text-rotary-blue" />
              <span className="text-sm font-medium text-rotary-blue">Guiding Principles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-3">The Four-Way Test</h2>
            <p className="text-pewter max-w-2xl mx-auto">
              A guiding principle for ethical decision-making in Rotary, adopted in 1942
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                num: "1",
                text: "Of the things we think, say or do, is it the TRUTH?",
                keyword: "TRUTH",
                icon: Shield,
                gradient: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-50",
                borderColor: "border-blue-200",
                textColor: "text-blue-900",
              },
              {
                num: "2",
                text: "Is it FAIR to all concerned?",
                keyword: "FAIR",
                icon: Scale,
                gradient: "from-purple-500 to-purple-600",
                bgColor: "bg-purple-50",
                borderColor: "border-purple-200",
                textColor: "text-purple-900",
              },
              {
                num: "3",
                text: "Will it build GOODWILL and better friendships?",
                keyword: "GOODWILL",
                icon: HandHeart,
                gradient: "from-green-500 to-green-600",
                bgColor: "bg-green-50",
                borderColor: "border-green-200",
                textColor: "text-green-900",
              },
              {
                num: "4",
                text: "Will it be BENEFICIAL to all concerned?",
                keyword: "BENEFICIAL",
                icon: Sparkles,
                gradient: "from-amber-500 to-amber-600",
                bgColor: "bg-amber-50",
                borderColor: "border-amber-200",
                textColor: "text-amber-900",
              },
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.num}
                  className={`group ${item.bgColor} rounded-2xl border ${item.borderColor} p-6 hover:shadow-xl transition-all hover:-translate-y-1`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className={`text-4xl font-bold ${item.textColor}/10 group-hover:${item.textColor}/20 transition-colors`}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${item.gradient} text-white mb-3`}>
                    {item.keyword}
                  </div>
                  <p className={`text-sm ${item.textColor} leading-relaxed font-medium`}>{item.text}</p>
                </div>
              );
            })}
          </div>

          {/* Attribution */}
          <div className="text-center mt-8 text-sm text-pewter">
            <p>The Four-Way Test was created by Rotarian Herbert J. Taylor in 1932</p>
          </div>
        </div>
      </section>
    </div>
  );
}
