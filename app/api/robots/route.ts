// ============================================================
// ROBOTS.TXT API ROUTE
// ============================================================

import { getBaseUrl } from "@/lib/utils";

export const revalidate = 3600;

export async function GET() {
  const baseUrl = getBaseUrl();

  const robots = `User-agent: *
Allow: /

# Disallow admin and member areas
Disallow: /admin
Disallow: /member
Disallow: /api
Disallow: /login
Disallow: /signup
Disallow: /forgot-password
Disallow: /reset-password

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
