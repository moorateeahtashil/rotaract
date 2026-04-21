"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validators";
import { createClient } from "@/lib/db/browser-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import type { z } from "zod";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [done, setDone] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm_password: "" },
  });

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Invite flow fires SIGNED_IN; password-reset flow fires PASSWORD_RECOVERY
      if ((event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") && session) {
        setSessionReady(true);
        setChecking(false);
      }
    });

    // Fallback: stop the spinner after 4s regardless
    const timeout = setTimeout(() => setChecking(false), 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) throw error;

      // Sign out the invite/recovery session so the user logs in fresh with their new password
      await supabase.auth.signOut();

      setDone(true);

      // Redirect to login after a short delay
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to set password",
        description: err.message || "The link may have expired. Please contact your admin.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (checking) {
    return (
      <Card className="w-full shadow-xl">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-rotary-blue" />
          <p className="text-sm text-pewter">Verifying your invitation...</p>
        </CardContent>
      </Card>
    );
  }

  if (done) {
    return (
      <Card className="w-full shadow-xl">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <p className="text-lg font-semibold text-charcoal">Password set!</p>
          <p className="text-sm text-pewter">Redirecting you to login...</p>
        </CardContent>
      </Card>
    );
  }

  if (!sessionReady) {
    return (
      <Card className="w-full shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-destructive">Invalid or Expired Link</CardTitle>
          <CardDescription>
            This invitation link is no longer valid. Please ask your admin to send a new invitation.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-rotary-blue/10">
          <KeyRound className="h-6 w-6 text-rotary-blue" />
        </div>
        <CardTitle className="text-2xl">Set Your Password</CardTitle>
        <CardDescription>Choose a password to activate your account</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-rotary-blue hover:bg-rotary-blue/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting password...</>
              ) : (
                "Activate Account"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
