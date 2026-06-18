// ============================================================
// SITEMAP API ROUTE
// ============================================================

import { getProjects, getEvents, getPosts, getAvenues } from "@/lib/db/queries";
import { getBaseUrl } from "@/lib/utils";

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const baseUrl = getBaseUrl();

  // Static pages
  const staticPages = [
    "",
    "/about",
    "/about/rotary",
    "/about/our-club",
    "/leadership",
    "/members",
    "/avenues-of-service",
    "/projects",
    "/events",
    "/news",
    "/join",
    "/contact",
    "/sponsors",
    "/gallery",
    "/faq",
    "/privacy",
    "/terms",
  ];

  // Dynamic pages
  const [projects, events, posts, avenues] = await Promise.all([
    getProjects({ limit: 100 }),
    getEvents({ limit: 100 }),
    getPosts({ limit: 100 }),
    getAvenues(),
  ]);

  const urls = [
    ...staticPages.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date().toISOString(),
      changeFrequency: path === "" ? "daily" : path === "/projects" || path === "/events" ? "weekly" : "monthly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...projects.map((p: any) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: p.updated_at || new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...events.map((e: any) => ({
      url: `${baseUrl}/events/${e.slug}`,
      lastModified: e.updated_at || new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...posts.map((p: any) => ({
      url: `${baseUrl}/news/${p.slug}`,
      lastModified: p.updated_at || new Date().toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...avenues.map((a: any) => ({
      url: `${baseUrl}/avenues-of-service/${a.slug}`,
      lastModified: a.updated_at || new Date().toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
