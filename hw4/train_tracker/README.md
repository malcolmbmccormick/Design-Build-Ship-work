# CTA Train Tracker

Realtime CTA train map built as:

External Data Source -> Railway Worker -> Supabase Postgres + Realtime -> Next.js Frontend

## Stack

- `apps/web`: Next.js App Router + Tailwind CSS + Supabase Auth + Realtime
- `apps/worker`: Node.js poller for CTA Train Tracker locations
- `packages/shared`: shared route metadata and types
- `supabase/migrations`: SQL to create tables, RLS, triggers, and Realtime publication

## Data Source

This project polls CTA Train Tracker's Locations API:

- Docs: https://www.transitchicago.com/developers/ttdocs/default.aspx
- Endpoint: `http://lapi.transitchicago.com/api/1.0/ttpositions.aspx`
- Free with CTA API key approval
- Route IDs: `red,blue,brn,g,org,p,pink,y`

Sample test request after you receive a key:

```bash
curl "http://lapi.transitchicago.com/api/1.0/ttpositions.aspx?key=$CTA_API_KEY&rt=red,blue"
```

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy env vars:

```bash
cp .env.example .env.local
```

3. In Supabase SQL Editor, run:

```sql
-- contents of supabase/migrations/202604220900_init.sql
```

4. In Supabase Auth, enable email magic links.

5. Set your app URL and redirect URL:

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/callback`

6. Start the web app:

```bash
pnpm dev:web
```

7. Run one worker poll:

```bash
pnpm --filter worker once
```

8. Or run the loop locally:

```bash
pnpm dev:worker
```

## Required Env Vars

Frontend:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

Worker:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CTA_API_KEY`
- `CTA_API_BASE_URL`
- `CTA_ROUTE_IDS`
- `POLL_INTERVAL_MS`

## Deployment

### Vercel

- Root Directory: `apps/web`
- Build Command: default Next.js build
- Add the frontend env vars in the Vercel dashboard

### Railway

- Deploy from the repo root
- Start Command: `pnpm --filter worker start`
- Add the worker env vars in the Railway dashboard

## Supabase MCP

This session did not expose a working Supabase MCP server, so the schema is included as SQL migration files instead of being applied directly through MCP.
