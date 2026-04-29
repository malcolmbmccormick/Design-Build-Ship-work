"use client";

import { useState, useTransition } from "react";
import type {
  GenerateTripRequest,
  GenerateTripResponse,
  TravelPreference,
  TripOption,
} from "@/lib/trips";

type GenerateTripMeta = GenerateTripResponse["meta"];

type PlannerExperienceProps = {
  initialRequest: GenerateTripRequest;
  initialMeta: GenerateTripMeta;
  initialOptions: TripOption[];
};

const preferenceOptions: Array<{
  label: string;
  value: TravelPreference;
}> = [
  { label: "Balanced", value: "balanced" },
  { label: "Culture", value: "culture" },
  { label: "Nightlife", value: "nightlife" },
  { label: "Nature", value: "nature" },
];

export function PlannerExperience({
  initialRequest,
  initialMeta,
  initialOptions,
}: PlannerExperienceProps) {
  const [formData, setFormData] = useState<GenerateTripRequest>(initialRequest);
  const [results, setResults] = useState<TripOption[]>(initialOptions);
  const [resultMeta, setResultMeta] = useState<GenerateTripMeta>(initialMeta);
  const [lastSubmittedRequest, setLastSubmittedRequest] =
    useState<GenerateTripRequest>(initialRequest);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFieldChange<K extends keyof GenerateTripRequest>(
    field: K,
    value: GenerateTripRequest[K],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedOrigin = formData.originCity.trim();

    if (!trimmedOrigin) {
      setError("Enter a starting city.");
      return;
    }

    if (formData.departureDate > formData.returnDate) {
      setError("Return date must be after departure date.");
      return;
    }

    if (!Number.isFinite(formData.budgetEuros) || formData.budgetEuros < 50) {
      setError("Budget must be at least EUR 50.");
      return;
    }

    const requestPayload: GenerateTripRequest = {
      ...formData,
      originCity: trimmedOrigin,
      budgetEuros: Math.round(formData.budgetEuros),
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/generate-trip-options", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
        });

        const payload = (await response.json()) as
          | GenerateTripResponse
          | { error?: string };

        if (!response.ok || !("options" in payload)) {
          throw new Error(
            "error" in payload && payload.error
              ? payload.error
              : "Unable to generate trip options.",
          );
        }

        setResults(payload.options);
        setResultMeta(payload.meta);
        setLastSubmittedRequest(requestPayload);
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Unable to generate trip options.",
        );
      }
    });
  }

  return (
    <main className="grid-fade min-h-screen">
      <section className="mx-auto flex w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="glass-panel mb-5 flex items-center justify-between rounded-[1.4rem] border border-border-soft px-4 py-3">
          <div>
            <p className="font-serif text-[2rem] leading-none text-slate-950">
              WeekendWanderer
            </p>
            <p className="compact-label mt-1 text-[var(--color-ink-muted)]">
              Europe weekend planner
            </p>
          </div>
          <nav className="flex items-center gap-2 text-sm text-slate-600">
            <a
              className="rounded-xl px-3 py-2 hover:bg-white/80"
              href="#planner"
            >
              Plan a trip
            </a>
            <span className="rounded-xl border border-border-soft bg-white/75 px-3 py-2">
              Saved trips soon
            </span>
          </nav>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <section className="flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <span className="inline-flex w-fit rounded-xl border border-accent/15 bg-accent-soft px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                Rules-based v1
              </span>
              <div className="max-w-3xl space-y-3">
                <h1 className="max-w-4xl font-serif text-5xl leading-[0.92] text-slate-950 sm:text-6xl">
                  Weekend trips without the Europe travel learning curve.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[var(--color-ink-muted)] sm:text-lg">
                  Enter your city, dates, and rough budget. WeekendWanderer
                  turns that into a short list of realistic rail-and-hostel
                  options built for students and young professionals living in
                  Europe.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <FeatureCard
                title="Fast inputs"
                description="One form, no tab-hopping across rail sites, hostels, and map tools."
              />
              <FeatureCard
                title="Budget aware"
                description="Itineraries stay grounded in rough total trip cost, not vague travel inspiration."
              />
              <FeatureCard
                title="Actionable handoff"
                description="Each result is structured to hand users off to transport and stay booking flows."
              />
            </div>
          </section>

          <section
            id="planner"
            className="glass-panel rounded-[1.6rem] border border-border-soft p-5 sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="compact-label text-[var(--color-ink-muted)]">
                  Planner
                </p>
                <h2 className="mt-2 text-[1.6rem] font-semibold text-slate-950">
                  Build a weekend in under a minute
                </h2>
              </div>
              <span className="rounded-xl bg-slate-950 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                Curated engine
              </span>
            </div>

            <form className="space-y-3.5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-800">
                  Current city
                </span>
                <input
                  className="w-full rounded-xl border border-border-soft bg-white px-3.5 py-3 text-base text-slate-950 outline-none placeholder:text-slate-400 focus:border-accent focus:ring-4 focus:ring-accent/10"
                  placeholder="Vienna"
                  value={formData.originCity}
                  onChange={(event) =>
                    handleFieldChange("originCity", event.target.value)
                  }
                />
                <span className="mt-1.5 block text-xs text-[var(--color-ink-muted)]">
                  Where are you starting from?
                </span>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-800">
                    Departure date
                  </span>
                  <input
                    className="w-full rounded-xl border border-border-soft bg-white px-3.5 py-3 text-base text-slate-950 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
                    type="date"
                    value={formData.departureDate}
                    onChange={(event) =>
                      handleFieldChange("departureDate", event.target.value)
                    }
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-800">
                    Return date
                  </span>
                  <input
                    className="w-full rounded-xl border border-border-soft bg-white px-3.5 py-3 text-base text-slate-950 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
                    type="date"
                    value={formData.returnDate}
                    onChange={(event) =>
                      handleFieldChange("returnDate", event.target.value)
                    }
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-800">
                  Budget in euros
                </span>
                <input
                  className="w-full rounded-xl border border-border-soft bg-white px-3.5 py-3 text-base text-slate-950 outline-none placeholder:text-slate-400 focus:border-accent focus:ring-4 focus:ring-accent/10"
                  min="50"
                  step="10"
                  type="number"
                  value={formData.budgetEuros}
                  onChange={(event) =>
                    handleFieldChange(
                      "budgetEuros",
                      Number(event.target.value || 0),
                    )
                  }
                />
                <span className="mt-1.5 block text-xs text-[var(--color-ink-muted)]">
                  Total target budget for transport and stay.
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-800">
                  Travel vibe
                </span>
                <select
                  className="w-full rounded-xl border border-border-soft bg-white px-3.5 py-3 text-base text-slate-950 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
                  value={formData.preference}
                  onChange={(event) =>
                    handleFieldChange(
                      "preference",
                      event.target.value as TravelPreference,
                    )
                  }
                >
                  {preferenceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-sm leading-6 text-slate-700">
                Prices are estimated ranges generated by the app&apos;s
                recommendation engine. V1 does not use live inventory or
                guaranteed booking fares.
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm leading-6 text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                className="w-full rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:-translate-y-0.5 hover:bg-slate-900 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Generating..." : "Generate weekend ideas"}
              </button>
            </form>
          </section>
        </div>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="compact-label text-[var(--color-ink-muted)]">
                Trip options
              </p>
              <h2 className="mt-2 font-serif text-[2.4rem] text-slate-950">
                Curated itinerary cards, not a chat transcript
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--color-ink-muted)]">
              These recommendations come from a rules-based trip engine tuned
              for budget-friendly European weekend travel.
            </p>
          </div>

          <div className="glass-panel mb-4 rounded-[1.3rem] border border-border-soft px-4 py-3.5 text-sm text-slate-600">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {results.length} options for {lastSubmittedRequest.originCity}
                </p>
                <p className="mt-1 leading-6 text-[var(--color-ink-muted)]">
                  {formatDateLabel(lastSubmittedRequest.departureDate)} to{" "}
                  {formatDateLabel(lastSubmittedRequest.returnDate)} • budget
                  target EUR {lastSubmittedRequest.budgetEuros} •{" "}
                  {labelForPreference(lastSubmittedRequest.preference)}
                </p>
              </div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
                Rules-based engine • updated{" "}
                {formatGeneratedAt(resultMeta)}
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--color-ink-muted)]">
              Ranked using destination tags, budget fit, and weekend-friendly
              transit assumptions.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {isPending
              ? Array.from({ length: 3 }).map((_, index) => (
                  <LoadingCard key={`loading-${index}`} />
                ))
              : results.map((trip) => (
                  <TripCard
                    key={`${trip.destinationCity}-${trip.destinationCountry}`}
                    trip={trip}
                  />
                ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function TripCard({ trip }: { trip: TripOption }) {
  return (
    <article className="glass-panel rounded-[1.4rem] border border-border-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
            {trip.vibeLabel}
          </p>
          <h3 className="mt-1.5 text-[1.45rem] font-semibold leading-tight text-slate-950">
            {trip.destinationCity}, {trip.destinationCountry}
          </h3>
        </div>
        <span className="rounded-lg bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">
          Weekend fit
        </span>
      </div>

      <p className="mt-3 text-[15px] leading-6 text-slate-800">{trip.summary}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">{trip.whyVisit}</p>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
          Weekend shape
        </p>
        <p className="mt-1.5 text-sm leading-6 text-slate-700">
          {trip.samplePlan}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {trip.highlights.map((highlight) => (
          <span
            key={highlight}
            className="rounded-md border border-border-soft bg-white/85 px-2.5 py-1 text-[11px] font-medium text-slate-600"
          >
            {highlight}
          </span>
        ))}
      </div>

      <dl className="mt-4 space-y-2.5 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-3 border-b border-border-soft pb-2.5">
          <dt>Transit</dt>
          <dd className="font-medium text-slate-800">{trip.travelTimeText}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-border-soft pb-2.5">
          <dt>Estimated cost</dt>
          <dd className="font-medium text-slate-800">
            EUR {trip.estimatedCostMin}-{trip.estimatedCostMax}
          </dd>
        </div>
        <div className="space-y-1 pt-1">
          <dt>Stay source</dt>
          <dd className="font-medium text-slate-800">{trip.stayProvider}</dd>
        </div>
      </dl>

      <p className="mt-3 text-xs leading-5 text-[var(--color-ink-muted)]">{trip.disclaimer}</p>

      <div className="mt-4 flex gap-2.5">
        <a
          className="flex-1 rounded-xl bg-slate-950 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-slate-900"
          href={trip.transportLink}
          rel="noreferrer noopener"
          target="_blank"
        >
          View trains
        </a>
        <a
          className="flex-1 rounded-xl border border-border-soft bg-white px-3 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50"
          href={trip.stayLink}
          rel="noreferrer noopener"
          target="_blank"
        >
          View stays
        </a>
      </div>
    </article>
  );
}

function LoadingCard() {
  return (
    <article className="glass-panel animate-pulse rounded-[1.4rem] border border-border-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="w-full">
          <div className="h-3 w-24 rounded-full bg-slate-200" />
          <div className="mt-2.5 h-7 w-2/3 rounded-full bg-slate-200" />
        </div>
        <div className="h-6 w-20 rounded-full bg-slate-200" />
      </div>

      <div className="mt-4 h-4 w-full rounded-full bg-slate-200" />
      <div className="mt-2 h-4 w-5/6 rounded-full bg-slate-200" />
      <div className="mt-4 h-3 w-full rounded-full bg-slate-200" />
      <div className="mt-2 h-3 w-4/5 rounded-full bg-slate-200" />
      <div className="mt-4 h-3 w-24 rounded-full bg-slate-200" />
      <div className="mt-2 h-4 w-full rounded-full bg-slate-200" />
      <div className="mt-2 h-4 w-3/4 rounded-full bg-slate-200" />

      <div className="mt-4 flex gap-2">
        <div className="h-7 w-24 rounded-md bg-slate-200" />
        <div className="h-7 w-28 rounded-md bg-slate-200" />
      </div>

      <div className="mt-4 space-y-3">
        <div className="h-10 rounded-2xl bg-slate-200" />
        <div className="h-10 rounded-2xl bg-slate-200" />
      </div>

      <div className="mt-4 flex gap-2.5">
        <div className="h-11 flex-1 rounded-full bg-slate-200" />
        <div className="h-11 flex-1 rounded-full bg-slate-200" />
      </div>
    </article>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="glass-panel rounded-[1.2rem] border border-border-soft p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>
    </div>
  );
}

function formatDateLabel(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatGeneratedAt(meta: GenerateTripMeta): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(meta.generatedAt));
}

function labelForPreference(preference: TravelPreference): string {
  return preferenceOptions.find((option) => option.value === preference)?.label ?? preference;
}
