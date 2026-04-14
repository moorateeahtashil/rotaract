import { createServerClient } from "@/lib/db/server";
import Link from "next/link";

export const metadata = { title: "Terms of Use" };

const DEFAULT_TERMS = `## 1. Acceptance of Terms

By accessing and using this website, you accept and agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to these terms, please discontinue use of this site.

## 2. Use of Website

This website is provided for informational and community purposes by our Rotaract club. You agree to:

- Use this website only for lawful purposes
- Not misrepresent your identity or affiliation
- Not use the site to harass, harm, or defame any person
- Not attempt to gain unauthorized access to any part of the website

## 3. Content and Intellectual Property

Content on this website — including text, images, logos, and event information — is the property of our Rotaract club or its content suppliers. The **Rotaract** and **Rotary** names and logos are trademarks of Rotary International and may not be used without permission.

You may share links to our public pages, but you may not reproduce or republish content without prior written consent.

## 4. Member Accounts

Members are responsible for:

- Maintaining the confidentiality of their account credentials
- All activity that occurs under their account
- Notifying us promptly of any unauthorized use
- Keeping their profile information accurate and up to date

## 5. Event Registration and Attendance

When registering for club events:

- Registrations are subject to availability and may have deadlines
- Some events may require payment; refund policies will be stated per event
- Attendance is tracked using our QR code system — your data is handled per our Privacy Policy
- We reserve the right to remove attendees who violate our Code of Conduct

## 6. Code of Conduct

All members and visitors are expected to uphold Rotary's core values of **Service**, **Fellowship**, **Diversity**, **Integrity**, and **Leadership**. Conduct that violates these values may result in removal from the platform.

## 7. Limitation of Liability

Our Rotaract club, its officers, directors, and members shall not be liable for any indirect, incidental, or consequential damages arising from:

- Use of or inability to use this website
- Participation in club activities
- Content posted by other members

## 8. External Links

This website may contain links to third-party websites. We do not endorse or control those sites and are not responsible for their content.

## 9. Changes to Terms

We reserve the right to update these Terms at any time. Continued use of the website after changes constitutes acceptance of the updated terms. We will notify members of significant changes via announcement.

## 10. Governing Law

These Terms are governed by the laws of the jurisdiction in which our club operates.

## 11. Contact

Questions about these terms should be directed to our club administration through the [Contact page](/contact).`;

export default async function TermsPage() {
  const supabase = await createServerClient();

  // Try to load from DB (admin-editable content)
  const { data: page } = await supabase
    .from("pages")
    .select("*, page_blocks(*)")
    .eq("slug", "terms-of-use")
    .eq("is_published", true)
    .single();

  const contentBlock = (page as any)?.page_blocks?.find((b: any) => b.block_type === "text");
  const content = contentBlock?.content || DEFAULT_TERMS;
  const lastUpdated = (page as any)?.updated_at
    ? new Date((page as any).updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  // Parse sections for sidebar TOC
  const sections = content
    .split("\n")
    .filter((line: string) => line.startsWith("## "))
    .map((line: string) => {
      const title = line.replace("## ", "");
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return { title, id };
    });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-rotary-gold uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Terms of Use</h1>
            <p className="text-white/70 text-sm">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-12">
            {/* Sidebar TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-xs font-semibold text-pewter uppercase tracking-widest mb-4">
                  On this page
                </p>
                <nav className="space-y-2">
                  {sections.map((s: any) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="block text-sm text-pewter hover:text-rotary-blue transition-colors py-0.5"
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-xs text-pewter mb-2">Related</p>
                  <Link href="/privacy" className="block text-sm text-rotary-blue hover:underline mb-1">
                    Privacy Policy
                  </Link>
                  <Link href="/contact" className="block text-sm text-rotary-blue hover:underline">
                    Contact Us
                  </Link>
                </div>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-border p-8 sm:p-10">
                <TermsContent content={content} />
              </div>

              {/* Mobile related links */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 lg:hidden">
                <Link href="/privacy" className="text-sm text-rotary-blue hover:underline">
                  → Privacy Policy
                </Link>
                <Link href="/contact" className="text-sm text-rotary-blue hover:underline">
                  → Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TermsContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="prose-rotary">
      {lines.map((line: string, i: number) => {
        if (line.startsWith("## ")) {
          const title = line.replace("## ", "");
          const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          return (
            <h2 key={i} id={id} className="text-xl font-bold text-charcoal mt-8 mb-3 first:mt-0 pt-6 border-t border-border first:border-0 first:pt-0 scroll-mt-24">
              {title}
            </h2>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <li key={i} className="text-pewter leading-relaxed ml-4 list-disc">
              <FormattedText text={line.replace("- ", "")} />
            </li>
          );
        }
        if (line.trim() === "") {
          return <div key={i} className="h-2" />;
        }
        return (
          <p key={i} className="text-pewter leading-relaxed">
            <FormattedText text={line} />
          </p>
        );
      })}
    </div>
  );
}

function FormattedText({ text }: { text: string }) {
  // Handle **bold** and [link](href) patterns
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-charcoal">{part.slice(2, -2)}</strong>;
        }
        const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          return <Link key={i} href={linkMatch[2]} className="text-rotary-blue hover:underline">{linkMatch[1]}</Link>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
