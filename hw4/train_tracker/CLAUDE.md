# CTA Train Tracker Architecture

## Overview

This repo implements the pattern:

External Data Source -> Background Worker (Railway) -> Supabase Postgres + Realtime -> Next.js Frontend (Vercel)

The external source is CTA Train Tracker's Locations API:

- Endpoint: `http://lapi.transitchicago.com/api/1.0/ttpositions.aspx`
- Polling target: all 8 CTA rail route IDs in a single request: `red,blue,brn,g,org,p,pink,y`
- Auth model: free CTA API key after agreeing to CTA's developer terms
- Update cadence: the API is near-real-time and suited to short polling; this app polls every 20 seconds by default

## Data Flow

1. Railway runs `apps/worker` continuously.
2. The worker calls CTA's train positions endpoint with the configured route IDs and API key.
3. The worker normalizes each train into a stable row keyed by `route_id:run_number`.
4. The worker upserts those rows into `public.train_positions`.
5. The worker updates `public.feed_statuses` with success/error metadata.
6. Supabase Realtime publishes changes from `train_positions` and `feed_statuses`.
7. The Next.js app reads the current snapshot from Supabase and subscribes to live updates through Realtime.
8. Authenticated users store personalization in `public.user_preferences`.

## Tables

### `public.train_positions`

Live state table containing the latest known position for every active train run.

Important columns:

- `id`: text primary key (`route_id:run_number`)
- `route_id`, `route_name`
- `run_number`
- `destination_stop_id`, `destination_name`
- `next_stop_id`, `next_stop_name`
- `heading_degrees`
- `latitude`, `longitude`
- `is_delayed`
- `prediction_generated_at`
- `source_updated_at`
- `last_seen_at`

This is the main Realtime table for the map.

### `public.feed_statuses`

One row per feed, used to show freshness and worker health on the frontend.

Important columns:

- `feed_name`
- `last_polled_at`
- `last_success_at`
- `last_error`
- `train_count`
- `route_count`

### `public.user_preferences`

One row per authenticated user.

Important columns:

- `user_id`
- `favorite_routes`
- `default_visible_routes`
- `show_delayed_only`
- `map_center_lng`
- `map_center_lat`
- `map_zoom`

## Security

- Supabase Auth handles sign-in.
- `train_positions` and `feed_statuses` are readable only by authenticated users.
- `user_preferences` is only selectable/updatable by the owning `auth.uid()`.
- A trigger creates a default `user_preferences` row when a new auth user is created.
- The worker writes with the Supabase service role key and bypasses RLS as intended for server-side ingestion.

## Realtime

Enable Realtime for:

- `public.train_positions`
- `public.feed_statuses`

Recommended SQL:

```sql
alter publication supabase_realtime add table public.train_positions;
alter publication supabase_realtime add table public.feed_statuses;
```

## Frontend

The web app is a Next.js App Router project with Tailwind CSS and Supabase Auth.

Primary UX:

- Email magic-link sign-in
- Route filters
- Favorite routes persisted per user
- Delayed-only toggle persisted per user
- Live map of train markers
- Feed freshness badge

## Worker

The worker is a long-running Node.js process designed for Railway.

Loop:

1. Fetch CTA positions XML.
2. Parse into typed train rows.
3. Upsert rows into Supabase.
4. Delete stale trains not seen recently.
5. Update `feed_statuses`.
6. Sleep for `POLL_INTERVAL_MS`.

## Deployment

### Railway

- Service root: repo root
- Start command: `pnpm --filter worker start`
- Required env vars:
  - `CTA_API_KEY`
  - `CTA_API_BASE_URL`
  - `CTA_ROUTE_IDS`
  - `POLL_INTERVAL_MS`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Vercel

- Framework: Next.js
- Root directory: `apps/web`
- Required env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL`

## Supabase MCP Note

This coding session does not currently expose a configured Supabase MCP server, so the repo includes SQL migration files under `supabase/migrations/` for manual execution in Supabase SQL Editor or via Supabase CLI.
