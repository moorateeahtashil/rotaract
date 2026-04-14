import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { getSiteSettings } from "@/lib/db/queries";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const getSetting = (key: string) => (settings as any[])?.find((s) => s.key === key)?.value || "";
  const clubName = getSetting("club_name") || "Rotaract Club";
  const logoUrl = getSetting("site_logo_url") || "";
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader clubName={clubName} logoUrl={logoUrl || undefined} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
