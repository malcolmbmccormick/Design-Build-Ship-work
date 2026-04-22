create extension if not exists "pgcrypto";

create table if not exists public.train_positions (
  id text primary key,
  route_id text not null,
  route_name text not null,
  run_number text not null,
  destination_stop_id text,
  destination_name text,
  next_stop_id text,
  next_stop_name text,
  heading_degrees integer,
  latitude double precision not null,
  longitude double precision not null,
  is_delayed boolean not null default false,
  prediction_generated_at timestamptz,
  source_updated_at timestamptz,
  last_seen_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists train_positions_route_id_idx on public.train_positions (route_id);
create index if not exists train_positions_last_seen_at_idx on public.train_positions (last_seen_at desc);

create table if not exists public.feed_statuses (
  feed_name text primary key,
  last_polled_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  train_count integer not null default 0,
  route_count integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  favorite_routes text[] not null default '{}',
  default_visible_routes text[] not null default '{"red","blue"}',
  show_delayed_only boolean not null default false,
  map_center_lng double precision not null default -87.6298,
  map_center_lat double precision not null default 41.8781,
  map_zoom integer not null default 11,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists train_positions_set_updated_at on public.train_positions;
create trigger train_positions_set_updated_at
before update on public.train_positions
for each row
execute procedure public.set_updated_at();

drop trigger if exists feed_statuses_set_updated_at on public.feed_statuses;
create trigger feed_statuses_set_updated_at
before update on public.feed_statuses
for each row
execute procedure public.set_updated_at();

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row
execute procedure public.set_updated_at();

alter table public.train_positions enable row level security;
alter table public.feed_statuses enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "authenticated users can read train positions" on public.train_positions;
create policy "authenticated users can read train positions"
on public.train_positions
for select
to authenticated
using (true);

drop policy if exists "authenticated users can read feed statuses" on public.feed_statuses;
create policy "authenticated users can read feed statuses"
on public.feed_statuses
for select
to authenticated
using (true);

drop policy if exists "users can read their preferences" on public.user_preferences;
create policy "users can read their preferences"
on public.user_preferences
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "users can insert their preferences" on public.user_preferences;
create policy "users can insert their preferences"
on public.user_preferences
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "users can update their preferences" on public.user_preferences;
create policy "users can update their preferences"
on public.user_preferences
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter publication supabase_realtime add table public.train_positions;
alter publication supabase_realtime add table public.feed_statuses;
