"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import {
  CTA_ROUTE_IDS,
  CTA_ROUTE_LOOKUP,
  type FeedStatus,
  type RouteId,
  type RouteMeta,
  type TrainPosition,
  type UserPreferences
} from "@tracker/shared";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { MapShell } from "@/components/MapShell";

function replaceTrain(trains: TrainPosition[], next: TrainPosition) {
  const index = trains.findIndex((train) => train.id === next.id);
  if (index === -1) {
    return [next, ...trains];
  }

  const copy = [...trains];
  copy[index] = next;
  return copy;
}

function formatFreshness(feedStatus: FeedStatus | null) {
  if (!feedStatus?.last_success_at) {
    return "No successful poll yet";
  }

  const ageMs = Date.now() - new Date(feedStatus.last_success_at).getTime();
  const seconds = Math.max(0, Math.round(ageMs / 1000));

  if (seconds < 60) {
    return `Updated ${seconds}s ago`;
  }

  return `Updated ${Math.round(seconds / 60)}m ago`;
}

export function Dashboard({
  initialFeedStatus,
  initialPositions,
  initialPreferences,
  routes,
  userEmail,
  userId
}: {
  initialFeedStatus: FeedStatus | null;
  initialPositions: TrainPosition[];
  initialPreferences: UserPreferences | null;
  routes: RouteMeta[];
  userEmail: string;
  userId: string;
}) {
  const supabase = getSupabaseBrowserClient();
  const [positions, setPositions] = useState(initialPositions);
  const [feedStatus, setFeedStatus] = useState<FeedStatus | null>(initialFeedStatus);
  const [preferences, setPreferences] = useState<UserPreferences | null>(initialPreferences);
  const [visibleRoutes, setVisibleRoutes] = useState<RouteId[]>(
    initialPreferences?.default_visible_routes?.length
      ? initialPreferences.default_visible_routes
      : CTA_ROUTE_IDS
  );
  const viewportTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trainChannel = supabase
      .channel("train-positions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "train_positions" },
        (payload: RealtimePostgresChangesPayload<TrainPosition>) => {
          if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id as string;
            setPositions((current) => current.filter((train) => train.id !== deletedId));
            return;
          }

          const next = payload.new as TrainPosition;
          setPositions((current) => replaceTrain(current, next));
        }
      )
      .subscribe();

    const feedChannel = supabase
      .channel("feed-status")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feed_statuses", filter: "feed_name=eq.cta_train_positions" },
        (payload: RealtimePostgresChangesPayload<FeedStatus>) =>
          setFeedStatus(payload.new as FeedStatus)
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(trainChannel);
      void supabase.removeChannel(feedChannel);
    };
  }, [supabase]);

  async function savePreferences(next: Partial<UserPreferences>) {
    const payload: UserPreferences = {
      user_id: userId,
      favorite_routes: preferences?.favorite_routes ?? [],
      default_visible_routes: preferences?.default_visible_routes ?? CTA_ROUTE_IDS,
      show_delayed_only: preferences?.show_delayed_only ?? false,
      map_center_lng: preferences?.map_center_lng ?? -87.6298,
      map_center_lat: preferences?.map_center_lat ?? 41.8781,
      map_zoom: preferences?.map_zoom ?? 11,
      ...next
    };

    setPreferences(payload);
    await supabase
      .from("user_preferences")
      .upsert(payload as never, { onConflict: "user_id" });
  }

  const filteredPositions = useMemo(() => {
    return positions
      .filter((train) => visibleRoutes.includes(train.route_id))
      .filter((train) => (preferences?.show_delayed_only ? train.is_delayed : true))
      .sort((a, b) => a.route_id.localeCompare(b.route_id));
  }, [positions, preferences?.show_delayed_only, visibleRoutes]);

  const favoriteRoutes = preferences?.favorite_routes ?? [];
  const viewport = {
    lng: preferences?.map_center_lng ?? -87.6298,
    lat: preferences?.map_center_lat ?? 41.8781,
    zoom: preferences?.map_zoom ?? 11
  };

  return (
    <main className="app-shell">
      <section className="dashboard-grid">
        <aside className="dashboard-panel">
          <div className="stack-md">
            <div className="eyebrow">Signed in</div>
            <h1 className="section-title" style={{ fontSize: "2.35rem" }}>CTA Train Tracker</h1>
            <p className="muted">{userEmail}</p>
          </div>

          <div className="panel-section">
            <div className="row-between">
              <h2 className="eyebrow">Feed</h2>
              <span>{filteredPositions.length} visible trains</span>
            </div>
            <p style={{ marginTop: 14, fontSize: "1.15rem" }}>{formatFreshness(feedStatus)}</p>
            <p style={{ marginTop: 6, color: "#b42318" }}>{feedStatus?.last_error ?? ""}</p>
          </div>

          <div className="panel-section">
            <div className="row-between">
              <h2 className="eyebrow">Preferences</h2>
              <button
                className="signout-button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                type="button"
              >
                Sign out
              </button>
            </div>
            <label className="checkbox-row">
              <span>Show delayed trains only</span>
              <input
                checked={preferences?.show_delayed_only ?? false}
                onChange={(event) =>
                  void savePreferences({ show_delayed_only: event.target.checked })
                }
                type="checkbox"
              />
            </label>
            <div style={{ marginTop: 18 }}>
              <h3 className="eyebrow">Visible routes</h3>
              <div className="route-grid">
                {routes.map((route) => {
                  const active = visibleRoutes.includes(route.id);
                  const favorite = favoriteRoutes.includes(route.id);
                  return (
                    <div key={route.id} className="route-chip">
                      <button
                        className={clsx(
                          "pill-button",
                          active && "active"
                        )}
                        style={{ backgroundColor: active ? route.color : "transparent" }}
                        type="button"
                        onClick={() => {
                          const next = active
                            ? visibleRoutes.filter((id) => id !== route.id)
                            : [...visibleRoutes, route.id];
                          setVisibleRoutes(next);
                          void savePreferences({ default_visible_routes: next });
                        }}
                      >
                        {route.shortName}
                      </button>
                      <button
                        className={clsx(
                          "fav-button",
                          favorite && "active"
                        )}
                        type="button"
                        onClick={() => {
                          const next = favorite
                            ? favoriteRoutes.filter((id) => id !== route.id)
                            : [...favoriteRoutes, route.id];
                          void savePreferences({ favorite_routes: next });
                        }}
                      >
                        Fav
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <section className="dashboard-main">
          <div className="dashboard-card" style={{ marginBottom: 18 }}>
            <div className="section-header">
              <div>
                <h2 className="section-title">Live train map</h2>
                <p className="muted">
                  Markers update through Supabase Realtime. No refresh required.
                </p>
              </div>
            </div>

            <MapShell
              onViewportChange={(nextViewport: { lng: number; lat: number; zoom: number }) => {
                if (viewportTimeout.current) {
                  clearTimeout(viewportTimeout.current);
                }

                viewportTimeout.current = setTimeout(() => {
                  void savePreferences({
                    map_center_lng: nextViewport.lng,
                    map_center_lat: nextViewport.lat,
                    map_zoom: nextViewport.zoom
                  });
                }, 600);
              }}
              positions={filteredPositions}
              routes={routes}
              viewport={viewport}
            />
          </div>

          <div className="dashboard-card">
            <div className="section-header">
              <h2 className="section-title">Live roster</h2>
              <span className="muted">Realtime rows from Supabase</span>
            </div>
            <div className="roster-grid">
              {filteredPositions.map((train) => {
                const route = CTA_ROUTE_LOOKUP[train.route_id];
                return (
                  <article key={train.id} className="train-card">
                    <div className="row-between">
                      <div>
                        <p className="muted" style={{ margin: 0 }}>{route?.longName}</p>
                        <h3 style={{ margin: "4px 0 0", fontSize: "1.35rem" }}>Run {train.run_number}</h3>
                      </div>
                      <span
                        className="route-badge"
                        style={{ backgroundColor: route?.color }}
                      >
                        {route?.shortName}
                      </span>
                    </div>
                    <p style={{ marginTop: 14 }}>
                      To <strong>{train.destination_name ?? "Unknown destination"}</strong>
                    </p>
                    <p className="muted" style={{ marginTop: 6 }}>
                      Next stop: {train.next_stop_name ?? "Unavailable"}
                    </p>
                    <p style={{ marginTop: 14 }}>
                      {train.is_delayed ? "Delayed" : "On the move"} · {train.latitude.toFixed(4)},
                      {" "}
                      {train.longitude.toFixed(4)}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
