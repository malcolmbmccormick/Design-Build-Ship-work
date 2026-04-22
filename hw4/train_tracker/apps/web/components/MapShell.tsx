"use client";

import dynamic from "next/dynamic";
import type { RouteMeta, TrainPosition } from "@tracker/shared";
import type { TransitMapProps } from "@/components/TransitMap";

const TransitMap = dynamic<TransitMapProps>(
  () => import("@/components/TransitMap").then((module) => module.TransitMap),
  {
  ssr: false,
  loading: () => <div className="tracker-map-frame" />
  }
);

export function MapShell(props: {
  onViewportChange: (viewport: { lng: number; lat: number; zoom: number }) => void;
  positions: TrainPosition[];
  routes: RouteMeta[];
  viewport: { lng: number; lat: number; zoom: number };
}) {
  return <TransitMap {...props} />;
}
