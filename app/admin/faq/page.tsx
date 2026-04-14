"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";

export default function AdminFAQPage() {
  const [activeTab, setActiveTab] = useState("faqs");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (slug: string) => {
    setExpandedCategories(prev => ({ ...prev, [slug]: !prev[slug] }));
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="faqs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Frequently Asked Questions</CardTitle>
              <Button size="sm" className="bg-rotary-blue hover:bg-rotary-blue/90">
                <Plus className="mr-2 h-4 w-4" /> Add FAQ
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { question: "What is Rotaract?", category: "General", published: true },
                  { question: "How can I join the club?", category: "Membership", published: true },
                  { question: "When do you meet?", category: "General", published: false },
                ].map((faq, i) => (
                  <div key={i} className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{faq.category}</Badge>
                        {faq.published ? (
                          <Badge variant="secondary">Published</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-charcoal">{faq.question}</h3>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>FAQ Categories</CardTitle>
              <Button size="sm" className="bg-rotary-blue hover:bg-rotary-blue/90">
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "General", slug: "general", count: 5, active: true },
                  { name: "Membership", slug: "membership", count: 8, active: true },
                  { name: "Events", slug: "events", count: 3, active: true },
                ].map((cat) => (
                  <div key={cat.slug} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleCategory(cat.slug)} className="hover:text-rotary-blue">
                        {expandedCategories[cat.slug] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      <div>
                        <h3 className="font-medium text-charcoal">{cat.name}</h3>
                        <p className="text-xs text-pewter">{cat.count} FAQs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {cat.active ? <Badge variant="secondary">Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                      <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
