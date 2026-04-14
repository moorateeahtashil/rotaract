import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getPosts } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || post.content?.substring(0, 160),
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || post.content?.substring(0, 160),
      images: post.og_image_url || post.featured_image ? [{ url: post.og_image_url || post.featured_image }] : undefined,
    },
  };
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getPosts({ categoryId: post.category_id || undefined, limit: 3 });

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/news/${post.slug}`;
  const shareTitle = post.title;

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] bg-charcoal overflow-hidden">
        {post.featured_image ? (
          <img src={post.featured_image} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-rotary-blue to-azure" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 h-full flex items-end pb-12">
          <div className="text-white">
            <Link href="/news" className="inline-flex items-center text-white/80 hover:text-white mb-4 text-sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to News
            </Link>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {post.is_featured && <Badge className="bg-rotary-gold text-black">Featured</Badge>}
              {post.category && <Badge variant="outline" className="border-white/30 text-white">{post.category.name}</Badge>}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              {post.author && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {post.author.first_name} {post.author.last_name}
                </span>
              )}
              {post.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.published_at)}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {post.excerpt && (
            <p className="text-xl text-charcoal/70 leading-relaxed mb-8 italic border-l-4 border-rotary-blue pl-4">
              {post.excerpt}
            </p>
          )}

          <div className="prose prose-lg max-w-none text-charcoal leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Share */}
          <div className="mt-10 pt-6 border-t border-border">
            <div className="flex items-center gap-3">
              <Share2 className="h-5 w-5 text-pewter" />
              <span className="text-sm font-medium text-charcoal">Share this article</span>
              <div className="flex gap-2 ml-auto">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full border border-border hover:border-rotary-blue hover:text-rotary-blue transition-colors"
                  aria-label="Share on Twitter"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full border border-border hover:border-rotary-blue hover:text-rotary-blue transition-colors"
                  aria-label="Share on Facebook"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full border border-border hover:border-rotary-blue hover:text-rotary-blue transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-charcoal">Related Articles</h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/news">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {related
                .filter((p: any) => p.id !== post.id)
                .slice(0, 3)
                .map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/news/${p.slug}`}
                    className="block p-4 bg-white rounded-lg border border-border hover:border-rotary-blue/30 transition-colors"
                  >
                    <p className="text-xs text-pewter mb-1">
                      {p.published_at ? formatDate(p.published_at) : ""}
                    </p>
                    <h3 className="font-medium text-charcoal line-clamp-1">{p.title}</h3>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
