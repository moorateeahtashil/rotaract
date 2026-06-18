import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/toaster";
import { getBaseUrl } from "@/lib/utils";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const faviconUrl = supabaseUrl
  ? `${supabaseUrl}/storage/v1/object/public/logos/favicon.png`
  : "/favicon.ico";

export const metadata: Metadata = {
  title: {
    default: "Rotaract Club — Service Above Self",
    template: "%s | Rotaract Club",
  },
  description:
    "Rotaract Club platform — connecting young leaders through service, fellowship, and professional development.",
  metadataBase: new URL(getBaseUrl()),
  icons: {
    icon: faviconUrl,
    shortcut: faviconUrl,
    apple: faviconUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Rotaract Club",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${openSans.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
