"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "@/lib/validators";
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
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { submitContactInquiry } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

const INQUIRY_TYPES = [
  { value: "general", label: "General Inquiry" },
  { value: "partnership", label: "Partnership" },
  { value: "volunteer", label: "Volunteer" },
  { value: "sponsor", label: "Sponsor" },
  { value: "membership", label: "Membership" },
];

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [inquiryType, setInquiryType] = useState("general");
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(data: any) {
    startTransition(async () => {
      const result = await submitContactInquiry({ ...data, inquiry_type: inquiryType });
      if (result.success) {
        setSubmitted(true);
        form.reset();
        toast({ title: "Message sent!", description: "We'll get back to you as soon as possible." });
      } else {
        toast({ title: "Error", description: result.error || "Something went wrong.", variant: "destructive" });
      }
    });
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-charcoal mb-2">Message Sent!</h3>
        <p className="text-sm text-pewter mb-4">Thank you for reaching out. We'll respond within a few days.</p>
        <Button onClick={() => setSubmitted(false)} variant="outline">Send Another Message</Button>
      </div>
    );
  }

  return (
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

            <div className="grid sm:grid-cols-2 gap-4">
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
            </div>

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message *</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="Tell us how we can help..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="w-full bg-rotary-blue hover:bg-rotary-blue/90">
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> Send Message</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
