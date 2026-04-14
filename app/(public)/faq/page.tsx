import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export const metadata = {
  title: "Frequently Asked Questions",
  description: "Find answers to common questions about our Rotaract club, membership, events, and more.",
};

const FAQ_CATEGORIES = [
  {
    category: "About Rotaract",
    faqs: [
      { q: "What is Rotaract?", a: "Rotaract is a global service organization for young leaders ages 18-30, sponsored by Rotary International. Members engage in community service, professional development, and fellowship." },
      { q: "How is Rotaract different from Rotary?", a: "Rotaract is specifically for young adults (18-30) while Rotary includes professionals of all ages. Rotaract clubs are sponsored by Rotary clubs and share the same mission of 'Service Above Self'." },
      { q: "Is Rotaract part of Rotary International?", a: "Yes! Rotaract is an official program of Rotary International, connecting young leaders to the global Rotary network of 1.4 million members." },
    ],
  },
  {
    category: "Membership",
    faqs: [
      { q: "Who can join?", a: "Anyone between ages 18-30 who is passionate about community service, leadership development, and making a positive impact." },
      { q: "Is there a membership fee?", a: "Most clubs have a nominal annual fee that covers Rotary International dues and club operations. Contact us for specific amounts." },
      { q: "What is the time commitment?", a: "We recommend attending at least one meeting per month and participating in several projects per year. You can be as involved as your schedule allows." },
      { q: "Do I need to attend a meeting before joining?", a: "While not required, attending a meeting or event is a great way to learn about our club and meet members before applying." },
      { q: "Can I be a member of both Rotaract and Rotary?", a: "Yes! Many Rotaractors transition to Rotary after age 30, and some hold dual membership." },
    ],
  },
  {
    category: "Events & Projects",
    faqs: [
      { q: "Do I need to attend every event?", a: "No — participate in the events and projects that interest you and fit your schedule." },
      { q: "Can non-members attend events?", a: "Many of our events are open to the public. Check individual event pages for details." },
      { q: "How can I volunteer for a project?", a: "Sign up through our website or contact our project director. We welcome both members and non-member volunteers." },
      { q: "Do you host social events?", a: "Yes! We organize fellowship events, dinners, and recreational activities to build camaraderie among members." },
    ],
  },
  {
    category: "Leadership",
    faqs: [
      { q: "How can I take on a leadership role?", a: "Active members can run for board positions or lead committees. Leadership elections typically happen annually." },
      { q: "What board positions are available?", a: "Common positions include President, Vice President, Secretary, Treasurer, and various directors (Membership, Projects, Public Image, etc.)." },
    ],
  },
];

export default function FAQPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Find answers to common questions about our club, membership, and activities.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {FAQ_CATEGORIES.map((cat) => (
              <div key={cat.category}>
                <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-rotary-blue" />
                  {cat.category}
                </h2>
                <div className="space-y-2">
                  {cat.faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="group border border-border rounded-lg bg-white [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-charcoal font-medium hover:bg-gray-50 rounded-lg">
                        <span>{faq.q}</span>
                        <span className="shrink-0 text-pewter transition duration-300 group-open:-rotate-180">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </summary>
                      <div className="px-4 pb-4 text-sm text-pewter leading-relaxed">{faq.a}</div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-charcoal mb-4">Still Have Questions?</h2>
          <p className="text-pewter mb-6 max-w-xl mx-auto">
            Don't hesitate to reach out. We're always happy to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rotary-blue text-white font-semibold rounded-lg hover:bg-rotary-blue/90 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
