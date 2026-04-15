"use client";

import { createClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";

export function useSupabaseClient() {
  const { session } = useSession();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => {
        return (await session?.getToken()) ?? null;
      },
    }
  );
}
