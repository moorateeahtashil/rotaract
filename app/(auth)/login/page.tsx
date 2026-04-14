"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validators";
import { createClient } from "@/lib/db/browser-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import type { z } from "zod";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const redirectTo = searchParams.get("redirectTo");

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });

      // Determine redirect based on role
      if (redirectTo) {
        router.push(redirectTo);
      } else if (authData.user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", authData.user.id)
          .eq("is_active", true);

        const ROLE_HIERARCHY: Record<string, number> = {
          super_admin: 0, admin: 1, president: 2, secretary: 3,
          public_image_director: 4, membership_director: 5,
          project_director: 6, event_manager: 7, board_member: 8,
          member: 9, applicant: 10, public: 11,
        };

        const highestRole = roles?.length
          ? roles.reduce((min: string, r: { role: string }) =>
              ROLE_HIERARCHY[r.role] < ROLE_HIERARCHY[min] ? r.role : min, "public")
          : "public";

        const isAdmin = ROLE_HIERARCHY[highestRole] <= ROLE_HIERARCHY["board_member"];
        router.push(isAdmin ? "/admin" : "/member");
      } else {
        router.push("/member");
      }
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-rotary-blue flex items-center justify-center">
          <span className="text-white font-bold text-lg">R</span>
        </div>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Link
          href="/forgot-password"
          className="text-sm text-azure hover:underline"
        >
          Forgot your password?
        </Link>
        <p className="text-sm text-pewter">
          Don't have an account?{" "}
          <Link href="/signup" className="text-rotary-blue hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
