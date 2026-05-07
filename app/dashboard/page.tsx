import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/auth-config";

export default async function DashboardPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="grid-fade min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto w-full max-w-3xl rounded-[1.6rem] border border-border-soft bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            Dashboard
          </p>
          <h1 className="mt-3 font-serif text-4xl text-slate-950">
            Auth is scaffolded but not configured yet.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Add your Clerk publishable key and secret key to enable sign-in and
            protect this page.
          </p>
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-6 text-slate-700">
            Required env vars: <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
            and <code>CLERK_SECRET_KEY</code>.
          </div>
          <Link
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-900"
            href="/"
          >
            Back to planner
          </Link>
        </section>
      </main>
    );
  }

  const { userId } = await auth();

  return (
    <main className="grid-fade min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <div className="rounded-[1.6rem] border border-border-soft bg-white/92 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            Saved trips
          </p>
          <h1 className="mt-3 font-serif text-4xl text-slate-950">
            Your dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Signed in as <span className="font-medium text-slate-900">{userId}</span>.
            Saved itineraries are the next step after auth.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.25rem] border border-border-soft bg-slate-50/85 p-5">
              <p className="text-sm font-semibold text-slate-900">Next implementation step</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Connect this page to Supabase and persist saved trip snapshots
                with link-status metadata.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border-soft bg-slate-50/85 p-5">
              <p className="text-sm font-semibold text-slate-900">Current auth status</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Clerk is protecting the dashboard route and exposing the signed-in
                session on the server.
              </p>
            </div>
          </div>
          <Link
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-900"
            href="/"
          >
            Back to planner
          </Link>
        </div>
      </section>
    </main>
  );
}
