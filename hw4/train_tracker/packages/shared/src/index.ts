export type RouteId = "red" | "blue" | "brn" | "g" | "org" | "p" | "pink" | "y";

export type RouteMeta = {
  id: RouteId;
  shortName: string;
  longName: string;
  color: string;
};

export const CTA_ROUTES: RouteMeta[] = [
  { id: "red", shortName: "Red", longName: "Red Line", color: "#c4262e" },
  { id: "blue", shortName: "Blue", longName: "Blue Line", color: "#0f6bbd" },
  { id: "brn", shortName: "Brown", longName: "Brown Line", color: "#62361b" },
  { id: "g", shortName: "Green", longName: "Green Line", color: "#109f58" },
  { id: "org", shortName: "Orange", longName: "Orange Line", color: "#f26b21" },
  { id: "p", shortName: "Purple", longName: "Purple Line", color: "#53297e" },
  { id: "pink", shortName: "Pink", longName: "Pink Line", color: "#e27ea6" },
  { id: "y", shortName: "Yellow", longName: "Yellow Line", color: "#f3c216" }
];

export const CTA_ROUTE_IDS = CTA_ROUTES.map((route) => route.id);

export const CTA_ROUTE_LOOKUP = Object.fromEntries(
  CTA_ROUTES.map((route) => [route.id, route])
) as Record<RouteId, RouteMeta>;

export type TrainPosition = {
  id: string;
  route_id: RouteId;
  route_name: string;
  run_number: string;
  destination_stop_id: string | null;
  destination_name: string | null;
  next_stop_id: string | null;
  next_stop_name: string | null;
  heading_degrees: number | null;
  latitude: number;
  longitude: number;
  is_delayed: boolean;
  prediction_generated_at: string | null;
  source_updated_at: string | null;
  last_seen_at: string;
};

export type FeedStatus = {
  feed_name: string;
  last_polled_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
  train_count: number;
  route_count: number;
  updated_at: string;
};

export type UserPreferences = {
  user_id: string;
  favorite_routes: RouteId[];
  default_visible_routes: RouteId[];
  show_delayed_only: boolean;
  map_center_lng: number;
  map_center_lat: number;
  map_zoom: number;
};
