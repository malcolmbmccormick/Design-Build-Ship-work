export type TravelPreference =
  | "balanced"
  | "culture"
  | "nightlife"
  | "nature";

export type GenerateTripRequest = {
  originCity: string;
  departureDate: string;
  returnDate: string;
  budgetEuros: number;
  preference: TravelPreference;
};

export type TripOption = {
  destinationCity: string;
  destinationCountry: string;
  summary: string;
  whyVisit: string;
  travelTimeText: string;
  estimatedCostMin: number;
  estimatedCostMax: number;
  transportMode: string;
  transportLink: string;
  stayProvider: string;
  stayLink: string;
  disclaimer: string;
  vibeLabel: string;
};

export type GenerateTripResponse = {
  options: TripOption[];
  meta: {
    generatedAt: string;
    source: "rules";
  };
};

type TripSeed = {
  destinationCity: string;
  destinationCountry: string;
  travelTimeText: string;
  transportMode: string;
  stayProvider: string;
  vibeLabel: string;
  tags: TravelPreference[];
  baseMin: number;
  baseMax: number;
  summaryTemplate: (originCity: string) => string;
  whyVisitTemplate: (budgetEuros: number) => string;
};

const TRIP_SEEDS: TripSeed[] = [
  {
    destinationCity: "Ljubljana",
    destinationCountry: "Slovenia",
    travelTimeText: "5h 45m by train",
    transportMode: "Train",
    stayProvider: "Booking.com",
    vibeLabel: "Culture + relaxed nightlife",
    tags: ["balanced", "culture", "nightlife"],
    baseMin: 140,
    baseMax: 190,
    summaryTemplate: (originCity) =>
      `A compact cross-border weekend from ${originCity} with a walkable center, riverfront cafes, and enough energy to feel like a real escape without becoming a logistics project.`,
    whyVisitTemplate: (budgetEuros) =>
      `This works best when you want a polished first-time weekend abroad and a budget around EUR ${Math.max(120, budgetEuros - 20)} to ${budgetEuros + 25}.`,
  },
  {
    destinationCity: "Brno",
    destinationCountry: "Czech Republic",
    travelTimeText: "1h 45m by rail",
    transportMode: "Train",
    stayProvider: "Hostelworld",
    vibeLabel: "Budget + food scene",
    tags: ["balanced", "culture", "nightlife"],
    baseMin: 90,
    baseMax: 140,
    summaryTemplate: (originCity) =>
      `A fast, lower-cost option from ${originCity} with strong cafe culture, modernist architecture, and enough nightlife for a two-night trip.`,
    whyVisitTemplate: (budgetEuros) =>
      `Brno is a strong fit when you want to stay well under EUR ${budgetEuros + 10} without ending up somewhere that feels like a backup choice.`,
  },
  {
    destinationCity: "Salzburg",
    destinationCountry: "Austria",
    travelTimeText: "2h 30m by train",
    transportMode: "Train",
    stayProvider: "Booking.com",
    vibeLabel: "Scenic + culture",
    tags: ["balanced", "culture", "nature"],
    baseMin: 160,
    baseMax: 220,
    summaryTemplate: (originCity) =>
      `A scenic weekend from ${originCity} built around old-town walks, museum stops, and easy access to mountain views without needing a car.`,
    whyVisitTemplate: (budgetEuros) =>
      `Choose Salzburg when you want a more cinematic weekend and can tolerate a slightly higher spend than the bare-budget options.`,
  },
  {
    destinationCity: "Budapest",
    destinationCountry: "Hungary",
    travelTimeText: "2h 40m by train",
    transportMode: "Train",
    stayProvider: "Booking.com",
    vibeLabel: "Nightlife + thermal baths",
    tags: ["balanced", "nightlife", "culture"],
    baseMin: 110,
    baseMax: 170,
    summaryTemplate: (originCity) =>
      `A high-energy capital weekend from ${originCity} with thermal baths, late-night food, and neighborhoods that are easy to cover in two days.`,
    whyVisitTemplate: (budgetEuros) =>
      `Budapest is strongest when you want more nightlife density and enough budget flexibility to mix inexpensive eats with one or two flagship experiences.`,
  },
  {
    destinationCity: "Innsbruck",
    destinationCountry: "Austria",
    travelTimeText: "4h 20m by train",
    transportMode: "Train",
    stayProvider: "Hostelworld",
    vibeLabel: "Alpine + outdoors",
    tags: ["nature", "balanced"],
    baseMin: 145,
    baseMax: 210,
    summaryTemplate: (originCity) =>
      `A mountain-forward weekend from ${originCity} with a clean city center, strong rail access, and a trip rhythm that favors walking, views, and day hikes.`,
    whyVisitTemplate: (budgetEuros) =>
      `This is the right kind of weekend when the goal is scenery first and you are comfortable allocating a bit more of the budget to transit.`,
  },
  {
    destinationCity: "Graz",
    destinationCountry: "Austria",
    travelTimeText: "2h 35m by train",
    transportMode: "Train",
    stayProvider: "Booking.com",
    vibeLabel: "Design + slower pace",
    tags: ["balanced", "culture"],
    baseMin: 95,
    baseMax: 150,
    summaryTemplate: (originCity) =>
      `A lower-friction domestic weekend from ${originCity} with strong food, design-forward public spaces, and enough to feel restorative rather than rushed.`,
    whyVisitTemplate: (budgetEuros) =>
      `Graz is useful when you want a cheaper or simpler rail weekend but still want the itinerary to feel intentional.`,
  },
];

const DEFAULT_DISCLAIMER =
  "Estimated costs are rough ranges, not live fares or guaranteed booking prices.";

const DEFAULT_REQUEST: GenerateTripRequest = {
  originCity: "Vienna",
  departureDate: "2026-05-08",
  returnDate: "2026-05-10",
  budgetEuros: 180,
  preference: "balanced",
};

export function getDefaultTripRequest(): GenerateTripRequest {
  return DEFAULT_REQUEST;
}

export function generateTripOptions(
  input: GenerateTripRequest,
): GenerateTripResponse {
  const ranked = [...TRIP_SEEDS]
    .sort((a, b) => scoreSeed(b, input) - scoreSeed(a, input))
    .slice(0, 3);

  return {
    options: ranked.map((seed) => buildTripOption(seed, input)),
    meta: {
      generatedAt: new Date().toISOString(),
      source: "rules",
    },
  };
}

export function validateGenerateTripRequest(
  payload: unknown,
): GenerateTripRequest {
  if (!payload || typeof payload !== "object") {
    throw new Error("Request body must be a JSON object.");
  }

  const candidate = payload as Partial<GenerateTripRequest>;
  const originCity = candidate.originCity?.trim();

  if (!originCity) {
    throw new Error("Origin city is required.");
  }

  if (!candidate.departureDate || !isDateString(candidate.departureDate)) {
    throw new Error("Departure date must be a valid date.");
  }

  if (!candidate.returnDate || !isDateString(candidate.returnDate)) {
    throw new Error("Return date must be a valid date.");
  }

  if (candidate.departureDate > candidate.returnDate) {
    throw new Error("Return date must be after departure date.");
  }

  if (
    typeof candidate.budgetEuros !== "number" ||
    !Number.isFinite(candidate.budgetEuros) ||
    candidate.budgetEuros < 50
  ) {
    throw new Error("Budget must be at least EUR 50.");
  }

  const preference = candidate.preference ?? "balanced";

  if (!isPreference(preference)) {
    throw new Error("Preference must be balanced, culture, nightlife, or nature.");
  }

  return {
    originCity,
    departureDate: candidate.departureDate,
    returnDate: candidate.returnDate,
    budgetEuros: Math.round(candidate.budgetEuros),
    preference,
  };
}

function buildTripOption(
  seed: TripSeed,
  input: GenerateTripRequest,
): TripOption {
  const offset = Math.max(-25, Math.min(35, Math.round((input.budgetEuros - 160) / 3)));
  const estimatedCostMin = Math.max(70, seed.baseMin + offset);
  const estimatedCostMax = Math.max(
    estimatedCostMin + 25,
    seed.baseMax + offset,
  );
  const locationLabel = `${seed.destinationCity}, ${seed.destinationCountry}`;
  const stayProvider = normalizeStayProvider(seed.stayProvider);

  return {
    destinationCity: seed.destinationCity,
    destinationCountry: seed.destinationCountry,
    summary: seed.summaryTemplate(input.originCity),
    whyVisit: seed.whyVisitTemplate(input.budgetEuros),
    travelTimeText: seed.travelTimeText,
    estimatedCostMin,
    estimatedCostMax,
    transportMode: seed.transportMode,
    transportLink: buildOmioLink(
      input.originCity,
      seed.destinationCity,
      input.departureDate,
      input.returnDate,
    ),
    stayProvider,
    stayLink: buildStayLink(
      locationLabel,
      input.departureDate,
      input.returnDate,
      stayProvider,
    ),
    disclaimer: DEFAULT_DISCLAIMER,
    vibeLabel: seed.vibeLabel,
  };
}

function scoreSeed(seed: TripSeed, input: GenerateTripRequest): number {
  const preferenceScore = seed.tags.includes(input.preference) ? 3 : 0;
  const budgetMidpoint = (seed.baseMin + seed.baseMax) / 2;
  const budgetDistance = Math.abs(input.budgetEuros - budgetMidpoint);
  const budgetScore = Math.max(0, 5 - budgetDistance / 25);

  return preferenceScore + budgetScore;
}

function buildOmioLink(
  originCity: string,
  destinationCity: string,
  departureDate: string,
  returnDate: string,
): string {
  const params = new URLSearchParams({
    locale: "en",
    from: originCity,
    to: destinationCity,
    outboundDate: departureDate,
    inboundDate: returnDate,
  });

  return `https://www.omio.com/search-frontend/results?${params.toString()}`;
}

function buildStayLink(
  locationLabel: string,
  departureDate: string,
  returnDate: string,
  provider: string,
): string {
  const params = new URLSearchParams({
    ss: locationLabel,
    checkin: departureDate,
    checkout: returnDate,
    group_adults: "1",
    no_rooms: "1",
    group_children: "0",
  });

  if (provider === "Hostelworld") {
    return `https://www.hostelworld.com/st/hostels/europe/?${params.toString()}`;
  }

  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

function normalizeStayProvider(provider: string): string {
  return provider.toLowerCase().includes("hostel")
    ? "Hostelworld"
    : "Booking.com";
}

function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function isPreference(value: string): value is TravelPreference {
  return (
    value === "balanced" ||
    value === "culture" ||
    value === "nightlife" ||
    value === "nature"
  );
}
