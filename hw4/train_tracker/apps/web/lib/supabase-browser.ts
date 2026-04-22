"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database";
import { getPublicEnv } from "@/lib/env";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (client) {
    return client;
  }

  const { url, anonKey } = getPublicEnv();
  client = createBrowserClient<Database>(url, anonKey);
  return client;
}
