import { createServerClient } from "@/lib/db/server";
import Link from "next/link";

export const metadata = { title: "Privacy Policy" };

const DEFAULT_PRIVACY = `## 1. Introduction

This Privacy Policy explains how our Rotaract club ("we", "us", or "our") collects, uses, stores, and protects your personal information when you use our website, register for events, or participate in club activities.

We are committed to protecting your privacy in accordance with applicable data protection laws.

## 2. Information We Collect

We collect information you provide directly to us, including:

- **Identity data:** Full name, date of birth, photo
- **Contact data:** Email address, phone number, mailing address
- **Profile data:** Occupation, social media handles, bio
- **Membership data:** Join date, member number, committee participation, service hours
- **Event data:** Registration details, attendance records, QR scan logs
- **Communications:** Messages sent to us through the contact form or email

We also automatically collect certain technical information when you use our website, such as IP address, browser type, and pages visited (for security and analytics purposes only).

## 3. How We Use Your Information

We use the information we collect to:

- Manage your membership and club participation
- Communicate with members about events, projects, and announcements
- Track attendance and service hours for your member record
- Organize and manage events and projects
- Send newsletters and important updates
- Improve our website and services
- Comply with Rotary International's reporting requirements
- Comply with applicable legal obligations

## 4. Legal Basis for Processing

We process your personal data on the following bases:

- **Contractual necessity** — to fulfill our obligations as your Rotaract club
- **Legitimate interests** — for internal club administration and communication
- **Consent** — for optional communications such as newsletters
- **Legal obligation** — when required by law or Rotary International guidelines

## 5. Data Sharing

We do not sell your personal information to third parties. We may share your information with:

- **Rotary International and the District** — as required for club reporting and membership records
- **Our Sponsor Rotary Club** — for coordination of joint activities
- **Service providers** — such as email services, used to operate our platform
- **Law enforcement** — when required by legal process or to protect safety

## 6. Data Security

We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encrypted data storage, secure login, and access controls.

However, no internet transmission is completely secure, and we cannot guarantee absolute security.

## 7. Data Retention

We retain your personal information for as long as your membership is active and for a reasonable period afterward. Upon request, we will delete your data in accordance with applicable law.

## 8. Your Rights

Depending on your location, you may have the right to:

- **Access** your personal data
- **Correct** inaccurate data
- **Delete** your data ("right to be forgotten")
- **Restrict** processing of your data
- **Object** to processing for certain purposes
- **Data portability** — receive your data in a structured format

To exercise any of these rights, please contact us through our [Contact page](/contact).

## 9. Cookies

Our website uses essential cookies for authentication and session management. We do not use third-party advertising or tracking cookies. You may disable cookies in your browser settings, but this may affect site functionality.

## 10. Children's Privacy

Our platform is intended for members aged 18–30 (or as defined by Rotary International). We do not knowingly collect personal information from children under the age of 18 without parental consent.

## 11. Changes to This Policy

We may update this Privacy Policy periodically. We will notify members of significant changes via announcement. Continued use of the website after changes constitutes acceptance of the updated policy.

## 12. Contact

For privacy-related inquiries, complaints, or to exercise your rights, please contact us through the [Contact page](/contact).`;

export default async function PrivacyPage() {
  const supabase = await createServerClient();

  const { data: page } = await supabase
    .from("pages")
    .select("*, page_blocks(*)")
    .eq("slug", "privacy-policy")
    .eq("is_published", true)
    .single();

  const contentBlock = page?.page_blocks?.find((b: any) => b.block_type === "text");
  const content = contentBlock?.content || DEFAULT_PRIVACY;
  const lastUpdated = page?.updated_at
    ? new Date(page.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

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
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-rotary-gold uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Privacy Policy</h1>
            <p className="text-white/70 text-sm">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-12">
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
                  <Link href="/terms" className="block text-sm text-rotary-blue hover:underline mb-1">
                    Terms of Use
                  </Link>
                  <Link href="/contact" className="block text-sm text-rotary-blue hover:underline">
                    Contact Us
                  </Link>
                </div>
              </div>
            </aside>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-border p-8 sm:p-10">
                <PrivacyContent content={content} />
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 lg:hidden">
                <Link href="/terms" className="text-sm text-rotary-blue hover:underline">
                  → Terms of Use
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

function PrivacyContent({ content }: { content: string }) {
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
