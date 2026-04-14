/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  rewrites: async () => [
    { source: "/sitemap.xml", destination: "/api/sitemap" },
    { source: "/robots.txt", destination: "/api/robots" },
  ],
};

export default nextConfig;
