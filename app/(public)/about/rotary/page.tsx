import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Calendar, 
  Users, 
  Globe, 
  Heart, 
  Award, 
  BookOpen, 
  Target, 
  ArrowRight,
  CheckCircle2,
  Quote
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
  { year: "2019", title: "1.4 Million Strong", description: "Rotary reaches 1.4 million members across 46,000+ clubs in 200+ countries and geographical areas." },
  { year: "2025", title: "Continuing the Mission", description: "Rotary continues to lead global efforts in polio eradication, peace building, and community development." },
];

const SEVEN_AREAS = [
  { icon: "🕊️", title: "Peace", description: "Supporting conflict prevention and peacebuilding through Rotary Peace Centers and fellowship programs.", color: "from-blue-500 to-blue-600" },
  { icon: "🚫", title: "Disease Prevention & Treatment", description: "Fighting polio, malaria, HIV/AIDS, and other preventable diseases through vaccination and education.", color: "from-red-500 to-red-600" },
  { icon: "💧", title: "Water & Sanitation", description: "Providing clean water, sanitation, and hygiene to communities in need worldwide.", color: "from-cyan-500 to-cyan-600" },
  { icon: "👩‍⚕️", title: "Maternal & Child Health", description: "Reducing mortality rates and improving healthcare for mothers and children.", color: "from-pink-500 to-pink-600" },
  { icon: "📚", title: "Education", description: "Expanding literacy and access to quality education for all ages.", color: "from-amber-500 to-amber-600" },
  { icon: "💼", title: "Economic Development", description: "Supporting local entrepreneurs and community economic growth.", color: "from-green-500 to-green-600" },
  { icon: "🌍", title: "Environment", description: "Protecting natural resources and promoting sustainability for future generations.", color: "from-emerald-500 to-emerald-600" },
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
            <Button asChild size="lg" className="bg-white text-rotary-blue hover:bg-white/90 font-semibold px-8">
              <Link href="/about">Learn About Rotaract</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
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
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-rotary-blue/20 hidden lg:block" />
            
            <div className="space-y-8 lg:space-y-12">
              {TIMELINE.map((item, index) => (
                <div key={item.year} className={`relative flex flex-col lg:flex-row items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  {/* Year Badge */}
                  <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-rotary-blue text-white rounded-full h-12 w-12 flex items-center justify-center font-bold text-sm shadow-lg">
                      {item.year.slice(-2)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}`}>
                    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-border">
                      <Badge className="bg-rotary-gold text-black mb-3">{item.year}</Badge>
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
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-3">Seven Areas of Focus</h2>
            <p className="text-pewter max-w-3xl mx-auto">
              Rotary focuses on seven critical areas to address the most pressing humanitarian needs of our time
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SEVEN_AREAS.map((area) => (
              <div key={area.title} className="group bg-white rounded-lg border border-border hover:border-rotary-blue/30 hover:shadow-lg transition-all p-6">
                <div className="text-4xl mb-4">{area.icon}</div>
                <h3 className="text-lg font-bold text-charcoal mb-2 group-hover:text-rotary-blue transition-colors">
                  {area.title}
                </h3>
                <p className="text-sm text-pewter leading-relaxed">{area.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
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
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Four-Way Test */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-3">The Four-Way Test</h2>
            <p className="text-pewter max-w-2xl mx-auto">
              A guiding principle for ethical decision-making in Rotary
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { num: "1", text: "Of the things we think, say or do, is it the TRUTH?" },
              { num: "2", text: "Is it FAIR to all concerned?" },
              { num: "3", text: "Will it build GOODWILL and better friendships?" },
              { num: "4", text: "Will it be BENEFICIAL to all concerned?" },
            ].map((item) => (
              <div key={item.num} className="bg-gray-50 rounded-lg p-6 border border-border text-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rotary-blue text-white font-bold mb-4">
                  {item.num}
                </div>
                <p className="text-sm text-charcoal leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
