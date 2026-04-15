"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { Save, FileText, Eye } from "lucide-react";
import { createClient } from "@/lib/db/browser-client";
import Link from "next/link";

const DEFAULT_TERMS_HTML = `<h2>1. Acceptance of Terms</h2><p>By accessing and using this website, you accept and agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to these terms, please discontinue use of this site.</p><h2>2. Use of Website</h2><p>This website is provided for informational and community purposes by our Rotaract club. You agree to use this website only for lawful purposes and not to misrepresent your identity or affiliation.</p><h2>3. Member Accounts</h2><p>Members are responsible for maintaining the confidentiality of their account credentials and for all activities under their account.</p><h2>4. Contact</h2><p>Questions about these terms should be directed to our club administration through the contact page.</p>`;

const DEFAULT_PRIVACY_HTML = `<h2>1. Introduction</h2><p>This Privacy Policy explains how our Rotaract club collects, uses, stores, and protects your personal information.</p><h2>2. Information We Collect</h2><p>We collect information you provide directly, including name, email, phone number, and membership details.</p><h2>3. How We Use Your Information</h2><p>We use the information to manage membership, communicate with members, organize events, and comply with Rotary reporting requirements.</p><h2>4. Data Security</h2><p>We implement appropriate technical and organizational measures to protect your personal information.</p><h2>5. Your Rights</h2><p>You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.</p>`;

type PageContent = {
  id?: string;
  title: string;
  slug: string;
  content: string;
};

export default function AdminContentPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [termsContent, setTermsContent] = useState<PageContent>({
    title: "Terms of Use",
    slug: "terms-of-use",
    content: DEFAULT_TERMS_HTML,
  });
  const [privacyContent, setPrivacyContent] = useState<PageContent>({
    title: "Privacy Policy",
    slug: "privacy-policy",
    content: DEFAULT_PRIVACY_HTML,
  });

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    const supabase = createClient();

    const { data: pages } = await (supabase as any)
      .from("pages")
      .select("*, page_blocks(*)")
      .in("slug", ["terms-of-use", "privacy-policy"]);

    if (pages) {
      const termsPage = (pages as any[]).find((p: any) => p.slug === "terms-of-use");
      const privacyPage = (pages as any[]).find((p: any) => p.slug === "privacy-policy");

      if (termsPage) {
        const block = (termsPage as any).page_blocks?.find((b: any) => b.block_type === "text");
        setTermsContent({
          id: termsPage.id,
          title: termsPage.title,
          slug: termsPage.slug,
          content: block?.content || DEFAULT_TERMS_HTML,
        });
      }
      if (privacyPage) {
        const block = (privacyPage as any).page_blocks?.find((b: any) => b.block_type === "text");
        setPrivacyContent({
          id: privacyPage.id,
          title: privacyPage.title,
          slug: privacyPage.slug,
          content: block?.content || DEFAULT_PRIVACY_HTML,
        });
      }
    }
  }

  async function saveContent(pageData: PageContent) {
    setSaving(true);
    const supabase = createClient();

    try {
      let pageId = pageData.id;

      if (!pageId) {
        const { data: newPage, error: pageError } = await (supabase as any)
          .from("pages")
          .insert({
            title: pageData.title,
            slug: pageData.slug,
            is_published: true,
            is_public: true,
          })
          .select()
          .single();

        if (pageError) throw pageError;
        pageId = newPage.id;
      } else {
        await (supabase as any)
          .from("pages")
          .update({ title: pageData.title, updated_at: new Date().toISOString() })
          .eq("id", pageId);
      }

      const { data: existingBlock } = await (supabase as any)
        .from("page_blocks")
        .select("id")
        .eq("page_id", pageId)
        .eq("block_type", "text")
        .single();

      if (existingBlock) {
        await (supabase as any)
          .from("page_blocks")
          .update({ content: pageData.content })
          .eq("id", existingBlock.id);
      } else {
        await (supabase as any)
          .from("page_blocks")
          .insert({
            page_id: pageId,
            block_type: "text",
            content: pageData.content,
            sort_order: 0,
          });
      }

      toast({ variant: "success", title: "Saved", description: `${pageData.title} has been updated.` });
      await loadContent();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save content",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Legal Pages</h1>
        <p className="text-sm text-pewter">Edit Terms of Use and Privacy Policy using the rich text editor below.</p>
      </div>

      <Tabs defaultValue="terms">
        <TabsList>
          <TabsTrigger value="terms" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Terms of Use
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Privacy Policy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Terms of Use</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/terms" target="_blank">
                      <Eye className="mr-1 h-4 w-4" /> Preview
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-rotary-blue hover:bg-rotary-blue/90"
                    onClick={() => saveContent(termsContent)}
                    disabled={saving}
                  >
                    <Save className="mr-1 h-4 w-4" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Page Title</Label>
                <Input
                  value={termsContent.title}
                  onChange={(e) => setTermsContent({ ...termsContent, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="mb-2 block">Content</Label>
                <RichTextEditor
                  value={termsContent.content}
                  onChange={(html) => setTermsContent({ ...termsContent, content: html })}
                  placeholder="Enter the Terms of Use content..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Privacy Policy</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/privacy" target="_blank">
                      <Eye className="mr-1 h-4 w-4" /> Preview
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-rotary-blue hover:bg-rotary-blue/90"
                    onClick={() => saveContent(privacyContent)}
                    disabled={saving}
                  >
                    <Save className="mr-1 h-4 w-4" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Page Title</Label>
                <Input
                  value={privacyContent.title}
                  onChange={(e) => setPrivacyContent({ ...privacyContent, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="mb-2 block">Content</Label>
                <RichTextEditor
                  value={privacyContent.content}
                  onChange={(html) => setPrivacyContent({ ...privacyContent, content: html })}
                  placeholder="Enter the Privacy Policy content..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
