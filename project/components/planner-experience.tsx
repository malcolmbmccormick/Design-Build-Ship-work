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
      <section className="mx-auto flex w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="glass-panel mb-8 flex items-center justify-between rounded-full border border-border-soft px-5 py-3 shadow-[0_10px_30px_rgba(54,69,79,0.08)]">
          <div>
            <p className="font-serif text-3xl leading-none text-accent">
              WeekendWanderer
            </p>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
              Europe weekend planner
            </p>
          </div>
          <nav className="flex items-center gap-3 text-sm text-slate-600">
            <a
              className="rounded-full px-4 py-2 hover:bg-white/70"
              href="#planner"
            >
              Plan a trip
            </a>
            <span className="rounded-full border border-border-soft bg-white/60 px-4 py-2">
              Saved trips soon
            </span>
          </nav>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <span className="inline-flex w-fit rounded-full border border-accent/15 bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Rules-based v1
              </span>
              <div className="max-w-3xl space-y-5">
                <h1 className="font-serif text-6xl leading-[0.92] text-slate-900 sm:text-7xl">
                  Weekend trips without the Europe travel learning curve.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                  Enter your city, dates, and rough budget. WeekendWanderer
                  turns that into a short list of realistic rail-and-hostel
                  options built for students and young professionals living in
                  Europe.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
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
            className="glass-panel rounded-[2rem] border border-border-soft p-6 shadow-[0_18px_48px_rgba(31,41,55,0.08)] sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                  Planner
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Build a weekend in under a minute
                </h2>
              </div>
              <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-slate-500">
                Curated engine
              </span>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Current city
                </span>
                <input
                  className="w-full rounded-2xl border border-border-soft bg-white/90 px-4 py-3.5 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-accent focus:ring-4 focus:ring-accent/10"
                  placeholder="Vienna"
                  value={formData.originCity}
                  onChange={(event) =>
                    handleFieldChange("originCity", event.target.value)
                  }
                />
                <span className="mt-2 block text-sm text-slate-500">
                  Where are you starting from?
                </span>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Departure date
                  </span>
                  <input
                    className="w-full rounded-2xl border border-border-soft bg-white/90 px-4 py-3.5 text-base text-slate-900 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
                    type="date"
                    value={formData.departureDate}
                    onChange={(event) =>
                      handleFieldChange("departureDate", event.target.value)
                    }
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Return date
                  </span>
                  <input
                    className="w-full rounded-2xl border border-border-soft bg-white/90 px-4 py-3.5 text-base text-slate-900 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
                    type="date"
                    value={formData.returnDate}
                    onChange={(event) =>
                      handleFieldChange("returnDate", event.target.value)
                    }
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Budget in euros
                </span>
                <input
                  className="w-full rounded-2xl border border-border-soft bg-white/90 px-4 py-3.5 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-accent focus:ring-4 focus:ring-accent/10"
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
                <span className="mt-2 block text-sm text-slate-500">
                  Total target budget for transport and stay.
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Travel vibe
                </span>
                <select
                  className="w-full rounded-2xl border border-border-soft bg-white/90 px-4 py-3.5 text-base text-slate-900 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
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

              <div className="rounded-[1.6rem] border border-warm/45 bg-[#fff5ed] p-4 text-sm leading-6 text-slate-700">
                Prices are estimated ranges generated by the app&apos;s
                recommendation engine. V1 does not use live inventory or
                guaranteed booking fares.
              </div>

              {error ? (
                <div className="rounded-[1.6rem] border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                className="w-full rounded-full bg-accent px-5 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-white hover:-translate-y-0.5 hover:bg-[#175961] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Generating..." : "Generate weekend ideas"}
              </button>
            </form>
          </section>
        </div>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                Trip options
              </p>
              <h2 className="mt-2 font-serif text-4xl text-slate-900">
                Curated itinerary cards, not a chat transcript
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-500">
              These recommendations come from a rules-based trip engine tuned
              for budget-friendly European weekend travel.
            </p>
          </div>

          <div className="glass-panel mb-5 rounded-[1.8rem] border border-border-soft px-5 py-4 text-sm text-slate-600 shadow-[0_10px_30px_rgba(31,41,55,0.06)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-slate-800">
                  {results.length} options for {lastSubmittedRequest.originCity}
                </p>
                <p className="mt-1 leading-6">
                  {formatDateLabel(lastSubmittedRequest.departureDate)} to{" "}
                  {formatDateLabel(lastSubmittedRequest.returnDate)} • budget
                  target EUR {lastSubmittedRequest.budgetEuros} •{" "}
                  {labelForPreference(lastSubmittedRequest.preference)}
                </p>
              </div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Rules-based engine • updated{" "}
                {formatGeneratedAt(resultMeta)}
              </p>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Ranked using destination tags, budget fit, and weekend-friendly
              transit assumptions.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
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
    <article className="glass-panel rounded-[2rem] border border-border-soft p-6 shadow-[0_16px_42px_rgba(31,41,55,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            {trip.vibeLabel}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            {trip.destinationCity}, {trip.destinationCountry}
          </h3>
        </div>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-accent">
          Weekend fit
        </span>
      </div>

      <p className="mt-4 text-base leading-7 text-slate-700">{trip.summary}</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{trip.whyVisit}</p>

      <dl className="mt-6 space-y-3 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-3 border-b border-border-soft pb-3">
          <dt>Transit</dt>
          <dd className="font-medium text-slate-800">{trip.travelTimeText}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-border-soft pb-3">
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

      <p className="mt-4 text-xs leading-5 text-slate-500">{trip.disclaimer}</p>

      <div className="mt-6 flex gap-3">
        <a
          className="flex-1 rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
          href={trip.transportLink}
          rel="noreferrer noopener"
          target="_blank"
        >
          View trains
        </a>
        <a
          className="flex-1 rounded-full border border-border-soft bg-white/90 px-4 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-white"
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
    <article className="glass-panel animate-pulse rounded-[2rem] border border-border-soft p-6 shadow-[0_16px_42px_rgba(31,41,55,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="w-full">
          <div className="h-3 w-28 rounded-full bg-slate-200" />
          <div className="mt-3 h-7 w-2/3 rounded-full bg-slate-200" />
        </div>
        <div className="h-6 w-20 rounded-full bg-slate-200" />
      </div>

      <div className="mt-5 h-4 w-full rounded-full bg-slate-200" />
      <div className="mt-2 h-4 w-5/6 rounded-full bg-slate-200" />
      <div className="mt-4 h-3 w-full rounded-full bg-slate-200" />
      <div className="mt-2 h-3 w-4/5 rounded-full bg-slate-200" />

      <div className="mt-6 space-y-3">
        <div className="h-10 rounded-2xl bg-slate-200" />
        <div className="h-10 rounded-2xl bg-slate-200" />
      </div>

      <div className="mt-6 flex gap-3">
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
    <div className="glass-panel rounded-[2rem] border border-border-soft p-5 shadow-[0_12px_32px_rgba(31,41,55,0.06)]">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
        {title}
      </p>
      <p className="mt-3 text-base leading-7 text-slate-700">{description}</p>
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
