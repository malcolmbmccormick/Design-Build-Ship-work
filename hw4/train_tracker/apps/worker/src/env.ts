import { CTA_ROUTE_IDS, type RouteId } from "../../../packages/shared/dist/index.js";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parseRouteIds(value: string): RouteId[] {
  const parsed = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!parsed.length) {
    return CTA_ROUTE_IDS;
  }

  return parsed.filter((route): route is RouteId => CTA_ROUTE_IDS.includes(route as RouteId));
}

export function getWorkerEnv() {
  return {
    ctaApiBaseUrl: process.env.CTA_API_BASE_URL ?? "http://lapi.transitchicago.com/api/1.0/ttpositions.aspx",
    ctaApiKey: requireEnv("CTA_API_KEY"),
    pollIntervalMs: Number(process.env.POLL_INTERVAL_MS ?? "20000"),
    routeIds: parseRouteIds(process.env.CTA_ROUTE_IDS ?? CTA_ROUTE_IDS.join(",")),
    supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    supabaseUrl: requireEnv("SUPABASE_URL")
  };
}
