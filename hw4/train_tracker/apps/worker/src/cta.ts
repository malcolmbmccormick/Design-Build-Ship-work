import { XMLParser } from "fast-xml-parser";
import {
  CTA_ROUTE_LOOKUP,
  type RouteId,
  type TrainPosition
} from "../../../packages/shared/dist/index.js";

type XmlTrain = {
  rn?: string;
  destSt?: string;
  destNm?: string;
  nextStaId?: string;
  nextStpId?: string;
  nextStaNm?: string;
  trDr?: string;
  prdt?: string;
  arrT?: string;
  isDly?: string;
  lat?: string;
  lon?: string;
  heading?: string;
};

type XmlRoute = {
  name?: string;
  train?: XmlTrain | XmlTrain[];
};

type XmlResponse = {
  ctatt?: {
    tmst?: string;
    errCd?: string;
    errNm?: string;
    route?: XmlRoute | XmlRoute[];
  };
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  parseTagValue: false,
  trimValues: true
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function toIsoTimestamp(value?: string) {
  if (!value) {
    return null;
  }

  const [datePart, timePart] = value.split(" ");
  if (!datePart || !timePart || datePart.length !== 8) {
    return null;
  }

  const normalized = `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}T${timePart}-05:00`;
  return new Date(normalized).toISOString();
}

export async function fetchTrainPositions(input: {
  apiBaseUrl: string;
  apiKey: string;
  routeIds: RouteId[];
}) {
  const url = new URL(input.apiBaseUrl);
  url.searchParams.set("key", input.apiKey);
  url.searchParams.set("rt", input.routeIds.join(","));

  const response = await fetch(url, {
    headers: { accept: "text/xml, application/xml" }
  });

  if (!response.ok) {
    throw new Error(`CTA request failed with ${response.status}`);
  }

  const body = await response.text();
  const parsed = parser.parse(body) as XmlResponse;
  const root = parsed.ctatt;

  if (!root) {
    throw new Error("CTA response did not include ctatt root");
  }

  if (root.errCd && root.errCd !== "0") {
    throw new Error(root.errNm ?? `CTA returned error code ${root.errCd}`);
  }

  const positions: TrainPosition[] = [];
  const feedTimestamp = toIsoTimestamp(root.tmst) ?? new Date().toISOString();

  for (const route of asArray(root.route)) {
    const routeId = route.name as RouteId | undefined;
    if (!routeId || !(routeId in CTA_ROUTE_LOOKUP)) {
      continue;
    }

    const routeMeta = CTA_ROUTE_LOOKUP[routeId];

    for (const train of asArray(route.train)) {
      const latitude = Number(train.lat);
      const longitude = Number(train.lon);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !train.rn) {
        continue;
      }

      positions.push({
        id: `${routeId}:${train.rn}`,
        route_id: routeId,
        route_name: routeMeta.longName,
        run_number: train.rn,
        destination_stop_id: train.destSt ?? null,
        destination_name: train.destNm ?? null,
        next_stop_id: train.nextStpId ?? train.nextStaId ?? null,
        next_stop_name: train.nextStaNm ?? null,
        heading_degrees: train.heading ? Number(train.heading) : null,
        latitude,
        longitude,
        is_delayed: train.isDly === "1",
        prediction_generated_at: toIsoTimestamp(train.prdt),
        source_updated_at: toIsoTimestamp(train.arrT) ?? feedTimestamp,
        last_seen_at: new Date().toISOString()
      });
    }
  }

  return {
    feedTimestamp,
    positions
  };
}
