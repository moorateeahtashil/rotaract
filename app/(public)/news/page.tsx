import { Suspense } from "react";
import Link from "next/link";
import { getPosts, getPostCategories } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Newspaper, Search, ArrowRight, Calendar, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "News & Updates",
  description: "Stay informed with the latest news, stories, and updates from our Rotaract club.",
};

async function NewsContent({ searchParams }: { searchParams: { category?: string; q?: string } }) {
  const categoryId = searchParams.category;
  const search = searchParams.q;
  const posts = await getPosts({ categoryId, search, limit: 12 });
  const categories = await getPostCategories();
  const featuredPost = posts.find((p: any) => p.is_featured) || posts[0];
  const regularPosts = posts.filter((p: any) => p.id !== featuredPost?.id);

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <Newspaper className="h-12 w-12 text-pewter mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-charcoal mb-2">No news yet</h3>
        <p className="text-pewter">Check back soon for updates from our club.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/news"
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              !categoryId
                ? "bg-rotary-blue text-white border-rotary-blue"
                : "border-border text-charcoal hover:border-rotary-blue"
            }`}
          >
            All
          </Link>
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/news?category=${cat.id}`}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                categoryId === cat.id
                  ? "bg-rotary-blue text-white border-rotary-blue"
                  : "border-border text-charcoal hover:border-rotary-blue"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
        <form className="relative ml-auto" role="search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pewter" />
          <input
            type="search"
            name="q"
            placeholder="Search news..."
            defaultValue={search}
            className="pl-9 pr-4 py-2 w-full sm:w-64 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30 focus:border-rotary-blue"
          />
        </form>
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <Card className="mb-8 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="bg-gradient-to-br from-rotary-blue/10 to-azure/10 flex items-center justify-center min-h-48 md:min-h-full">
              {featuredPost.featured_image ? (
                <img
                  loading="lazy"
                  decoding="async"
                  src={featuredPost.featured_image}
                  alt={featuredPost.title}
                  className="w-full aspect-video md:h-full md:aspect-auto object-contain"
                />
              ) : (
                <Newspaper className="h-16 w-16 text-rotary-blue/20" />
              )}
            </div>
            <div className="p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                {featuredPost.is_featured && <Badge className="bg-rotary-gold text-black">Featured</Badge>}
                {featuredPost.category && (
                  <Badge variant="outline">{featuredPost.category.name}</Badge>
                )}
              </div>
              <h2 className="text-2xl font-bold text-charcoal mb-3">
                <Link href={`/news/${featuredPost.slug}`} className="hover:text-rotary-blue transition-colors">
                  {featuredPost.title}
                </Link>
              </h2>
              <div className="flex items-center gap-4 text-sm text-pewter mb-4">
                {featuredPost.author && (
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {featuredPost.author.first_name} {featuredPost.author.last_name}
                  </span>
                )}
                {featuredPost.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(featuredPost.published_at)}
                  </span>
                )}
              </div>
              <p className="text-pewter line-clamp-3 mb-4">{featuredPost.excerpt || featuredPost.content?.substring(0, 200)}</p>
              <Button asChild className="self-start">
                <Link href={`/news/${featuredPost.slug}`}>
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Posts Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {regularPosts.map((post: any) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="bg-gradient-to-br from-rotary-blue/10 to-azure/10 relative">
              {post.featured_image ? (
                <img
                  loading="lazy"
                  decoding="async"
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full aspect-video object-contain"
                />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center">
                  <Newspaper className="h-10 w-10 text-rotary-blue/20" />
                </div>
              )}
              {post.is_featured && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-rotary-gold text-black text-xs">Featured</Badge>
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                {post.category && (
                  <Badge variant="outline" className="text-xs">{post.category.name}</Badge>
                )}
              </div>
              <h3 className="font-semibold text-charcoal group-hover:text-rotary-blue transition-colors line-clamp-2">
                <Link href={`/news/${post.slug}`}>{post.title}</Link>
              </h3>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm text-pewter line-clamp-2">{post.excerpt || post.content?.substring(0, 150)}</p>
            </CardContent>
            <CardFooter className="flex items-center justify-between text-xs text-pewter">
              <div className="flex items-center gap-3">
                {post.author && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {post.author.first_name} {post.author.last_name}
                  </span>
                )}
                {post.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(post.published_at)}
                  </span>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const resolvedParams = await searchParams;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">News & Updates</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Stories, achievements, and updates from our Rotaract community.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            }
          >
            <NewsContent searchParams={resolvedParams} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
