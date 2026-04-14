"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { membershipApplicationSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Users, Heart, Globe, GraduationCap, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { submitMembershipApplication } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

const BENEFITS = [
  { icon: Users, title: "Leadership Development", desc: "Build leadership skills through hands-on experience and mentorship." },
  { icon: Heart, title: "Community Impact", desc: "Make a real difference through service projects and initiatives." },
  { icon: Globe, title: "Global Network", desc: "Connect with 200,000+ Rotaractors across 109 countries." },
  { icon: GraduationCap, title: "Professional Growth", desc: "Develop skills, attend workshops, and advance your career." },
];

const STEPS = [
  { step: 1, title: "Submit Inquiry", desc: "Fill out the form below or attend a meeting." },
  { step: 2, title: "Orientation Meeting", desc: "Meet with our membership director to learn more." },
  { step: 3, title: "Application Review", desc: "Your application is reviewed by our board." },
  { step: 4, title: "Welcome & Induction", desc: "Join the club and start making an impact!" },
];

const FAQS = [
  { q: "Who can join Rotaract?", a: "Rotaract is open to young people ages 18-30 who are interested in community service and leadership development." },
  { q: "Is there a membership fee?", a: "Most clubs have a nominal fee that covers Rotary International dues and club activities. Contact us for specific details." },
  { q: "How often do you meet?", a: "We typically meet bi-weekly, with additional project meetings and social events throughout the month." },
  { q: "Do I need to be a student?", a: "No, Rotaract is open to both students and young professionals." },
  { q: "What is the time commitment?", a: "We recommend attending at least one meeting per month and participating in a few projects per year. The more you give, the more you get!" },
];

export default function JoinPage() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(membershipApplicationSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      why_join: "",
      how_heard: "",
      occupation: "",
      company: "",
      education: "",
    },
  });

  function onSubmit(data: any) {
    startTransition(async () => {
      const result = await submitMembershipApplication(data);
      if (result.success) {
        setSubmitted(true);
        form.reset();
        toast({ title: "Application submitted!", description: "We'll review your application and get back to you soon." });
      } else {
        toast({ title: "Error", description: result.error || "Something went wrong. Please try again.", variant: "destructive" });
      }
    });
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-charcoal mb-2">Thank You!</h2>
        <p className="text-pewter mb-6 max-w-md mx-auto">
          Your membership inquiry has been received. Our membership director will contact you within a few days.
        </p>
        <Button onClick={() => setSubmitted(false)} variant="outline">
          Submit Another Inquiry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input type="tel" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="why_join"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why do you want to join Rotaract? *</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Tell us about your motivation and what you hope to contribute..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="how_heard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you hear about us?</FormLabel>
                    <FormControl><Input {...field} placeholder="Friend, social media, event, etc." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending} className="w-full bg-rotary-gold text-black hover:bg-rotary-gold/90">
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <>Submit Inquiry <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
