"use client";

import { useEffect, useState } from "react";
import { CTA_ROUTES, type FeedStatus, type TrainPosition, type UserPreferences } from "@tracker/shared";
import { AuthPanel } from "@/components/AuthPanel";
import { Dashboard } from "@/components/Dashboard";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type AuthState =
  | { status: "loading" }
  | {
      status: "authenticated";
      user: { id: string; email: string };
      positions: TrainPosition[];
      feedStatus: FeedStatus | null;
      preferences: UserPreferences | null;
    }
  | { status: "anonymous" };

export function ClientHome() {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function load() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        setState({ status: "anonymous" });
        return;
      }

      const [{ data: positions }, { data: feedStatus }, { data: preferences }] = await Promise.all([
        supabase.from("train_positions").select("*").order("last_seen_at", { ascending: false }),
        supabase.from("feed_statuses").select("*").eq("feed_name", "cta_train_positions").maybeSingle(),
        supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle()
      ]);

      setState({
        status: "authenticated",
        user: { id: user.id, email: user.email ?? "Signed in user" },
        positions: positions ?? [],
        feedStatus: feedStatus ?? null,
        preferences: preferences ?? null
      });
    }

    void load();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (state.status === "loading") {
    return <main className="loading-shell">Loading live CTA data...</main>;
  }

  if (state.status === "anonymous") {
    return <AuthPanel />;
  }

  return (
    <Dashboard
      initialFeedStatus={state.feedStatus}
      initialPositions={state.positions}
      initialPreferences={state.preferences}
      routes={CTA_ROUTES}
      userEmail={state.user.email}
      userId={state.user.id}
    />
  );
}
