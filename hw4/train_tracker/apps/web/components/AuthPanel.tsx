"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const supabase = getSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });

    setLoading(false);
    setStatus(error ? error.message : "Magic link sent. Open it on this device to start tracking.");
  }

  return (
    <main className="app-shell auth-shell">
      <section className="auth-card">
        <div className="stack-lg">
          <div className="eyebrow">Live Chicago Rail</div>
          <h1 className="hero-title">CTA trains, routed through Supabase in real time.</h1>
          <p className="hero-copy">
            Pick your lines, follow active trains on a live map, and keep your own route
            preferences synced across sessions.
          </p>
        </div>

        <div className="auth-form-card">
          <h2 className="form-title">Sign in with email</h2>
          <p className="muted" style={{ marginTop: 8 }}>
            This app uses Supabase Auth passwordless sign-in and only shows live data to
            authenticated users.
          </p>
          <form className="stack-md" onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            <label>
              <span className="field-label">Email</span>
              <input
                className="text-input"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <button
              className="primary-button"
              disabled={loading}
              type="submit"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
          {status ? <p className="muted" style={{ marginTop: 16 }}>{status}</p> : null}
        </div>
      </section>
    </main>
  );
}
