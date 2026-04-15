import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { getSiteSettings } from "@/lib/db/queries";

async function getSettings() {
  const settings = await getSiteSettings();
  const get = (key: string) => (settings as any[])?.find((s: any) => s.key === key)?.value || "";
  return {
    clubName: get("club_name") || "Rotaract Club",
    tagline: get("site_tagline") || "Service Above Self",
    logoUrl: get("site_logo_url") || "",
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { clubName, tagline } = await getSettings();
  return {
    title: {
      default: `${clubName} — ${tagline}`,
      template: `%s | ${clubName}`,
    },
    description: `${clubName} — ${tagline}`,
    openGraph: {
      siteName: clubName,
    },
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { clubName, logoUrl } = await getSettings();
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader clubName={clubName} logoUrl={logoUrl || undefined} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
