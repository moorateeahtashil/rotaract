import { cache } from "react";
import { createServerClient } from "@/lib/db/server";

export type SiteConfig = Record<string, string>;

export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  const supabase = await createServerClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("key, value")
    .eq("is_public", true);

  const config: SiteConfig = {};
  settings?.forEach((s) => {
    config[s.key] = s.value;
  });

  return config;
});

export const getSiteSetting = cache(
  async (key: string, fallback?: string): Promise<string | undefined> => {
    const config = await getSiteConfig();
    return config[key] ?? fallback;
  }
);
