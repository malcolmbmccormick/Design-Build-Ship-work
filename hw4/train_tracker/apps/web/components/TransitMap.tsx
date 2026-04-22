"use client";

import { CircleMarker, MapContainer, TileLayer, Tooltip, useMapEvents } from "react-leaflet";
import { CTA_ROUTE_LOOKUP, type RouteMeta, type TrainPosition } from "@tracker/shared";

export type TransitMapProps = {
  onViewportChange: (viewport: { lng: number; lat: number; zoom: number }) => void;
  positions: TrainPosition[];
  routes: RouteMeta[];
  viewport: { lng: number; lat: number; zoom: number };
};

function ViewportListener({
  onViewportChange
}: {
  onViewportChange: (viewport: { lng: number; lat: number; zoom: number }) => void;
}) {
  useMapEvents({
    moveend(event) {
      const center = event.target.getCenter();
      onViewportChange({
        lng: center.lng,
        lat: center.lat,
        zoom: event.target.getZoom()
      });
    },
    zoomend(event) {
      const center = event.target.getCenter();
      onViewportChange({
        lng: center.lng,
        lat: center.lat,
        zoom: event.target.getZoom()
      });
    }
  });

  return null;
}

export function TransitMap({
  onViewportChange,
  positions,
  viewport
}: TransitMapProps) {
  return (
    <div className="tracker-map-frame">
      <MapContainer center={[viewport.lat, viewport.lng]} zoom={viewport.zoom} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ViewportListener onViewportChange={onViewportChange} />
        {positions.map((train) => {
          const route = CTA_ROUTE_LOOKUP[train.route_id];
          return (
            <CircleMarker
              key={train.id}
              center={[train.latitude, train.longitude]}
              color={route?.color ?? "#111827"}
              fillColor={route?.color ?? "#111827"}
              fillOpacity={0.9}
              radius={train.is_delayed ? 9 : 7}
              stroke={false}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1} permanent={false}>
                <div className="tooltip-stack">
                  <div style={{ fontWeight: 700 }}>{route?.longName ?? train.route_name}</div>
                  <div>Run {train.run_number}</div>
                  <div>{train.destination_name ?? "Destination unavailable"}</div>
                  <div>{train.is_delayed ? "Delayed" : "Moving normally"}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
