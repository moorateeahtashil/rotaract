"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, FileText, Eye } from "lucide-react";
import { createClient } from "@/lib/db/browser-client";
import Link from "next/link";

const DEFAULT_TERMS_CONTENT = `## 1. Acceptance of Terms

By accessing and using this website, you accept and agree to be bound by these Terms of Use and our Privacy Policy.

## 2. Use of Website

This website is provided for informational and community purposes. You may not use this website for any unlawful purpose.

## 3. Content

Content on this website is provided by our club members and administrators. While we strive for accuracy, we make no guarantees about completeness.

## 4. User Accounts

Members are responsible for maintaining the confidentiality of their account credentials and for all activities under their account.

## 5. Contact

Questions about these terms should be directed to our club administration through the contact page.`;

const DEFAULT_PRIVACY_CONTENT = `## 1. Introduction

This Privacy Policy explains how our Rotaract club collects, uses, stores, and protects your personal information.

## 2. Information We Collect

We collect information you provide directly, including name, email, phone number, and membership details.

## 3. How We Use Your Information

We use the information to manage membership, communicate with members, organize events, and comply with Rotary reporting requirements.

## 4. Data Security

We implement appropriate technical and organizational measures to protect your personal information.

## 5. Your Rights

You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.

## 6. Contact

For privacy inquiries, please contact us through the contact page.`;

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
    content: DEFAULT_TERMS_CONTENT,
  });
  const [privacyContent, setPrivacyContent] = useState<PageContent>({
    title: "Privacy Policy",
    slug: "privacy-policy",
    content: DEFAULT_PRIVACY_CONTENT,
  });

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    const supabase = createClient();

    const { data: pages } = await supabase
      .from("pages")
      .select("*, page_blocks(*)")
      .in("slug", ["terms-of-use", "privacy-policy"]);

    if (pages) {
      const termsPage = pages.find((p: any) => p.slug === "terms-of-use");
      const privacyPage = pages.find((p: any) => p.slug === "privacy-policy");

      if (termsPage) {
        const block = termsPage.page_blocks?.find((b: any) => b.block_type === "text");
        setTermsContent({
          id: termsPage.id,
          title: termsPage.title,
          slug: termsPage.slug,
          content: block?.content || DEFAULT_TERMS_CONTENT,
        });
      }
      if (privacyPage) {
        const block = privacyPage.page_blocks?.find((b: any) => b.block_type === "text");
        setPrivacyContent({
          id: privacyPage.id,
          title: privacyPage.title,
          slug: privacyPage.slug,
          content: block?.content || DEFAULT_PRIVACY_CONTENT,
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
        // Create the page
        const { data: newPage, error: pageError } = await supabase
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
        // Update the page
        await supabase
          .from("pages")
          .update({ title: pageData.title, updated_at: new Date().toISOString() })
          .eq("id", pageId);
      }

      // Upsert the text block
      const { data: existingBlock } = await supabase
        .from("page_blocks")
        .select("id")
        .eq("page_id", pageId)
        .eq("block_type", "text")
        .single();

      if (existingBlock) {
        await supabase
          .from("page_blocks")
          .update({ content: pageData.content })
          .eq("id", existingBlock.id);
      } else {
        await supabase
          .from("page_blocks")
          .insert({
            page_id: pageId,
            block_type: "text",
            content: pageData.content,
            sort_order: 0,
          });
      }

      toast({ title: "Saved", description: `${pageData.title} has been updated.` });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Legal Pages</h1>
          <p className="text-sm text-pewter">Edit Terms of Use and Privacy Policy content</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>Markdown formatting:</strong> Use <code>## Heading</code> for sections, <code>**bold**</code> for emphasis, and <code>- item</code> for bullet lists.
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
                <Label>Content (Markdown)</Label>
                <Textarea
                  value={termsContent.content}
                  onChange={(e) => setTermsContent({ ...termsContent, content: e.target.value })}
                  rows={30}
                  className="mt-1 font-mono text-sm"
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
                <Label>Content (Markdown)</Label>
                <Textarea
                  value={privacyContent.content}
                  onChange={(e) => setPrivacyContent({ ...privacyContent, content: e.target.value })}
                  rows={30}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
