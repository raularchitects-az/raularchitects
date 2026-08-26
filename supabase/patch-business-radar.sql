-- Business Radar (Phase 1). Additive and safe to run more than once.
-- Creates only radar_* tables. Does not touch CMS content, media or settings.
-- Every table is staff-only: no anon grants, no public read policy.

create table if not exists public.radar_sources (
  id text primary key,
  label text not null,
  -- 'available' sources can run now; 'planned' ones are reserved for a later phase.
  availability text not null default 'available',
  is_enabled boolean not null default false,
  last_run_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.radar_sources (id, label, availability, is_enabled)
values
  ('ted', 'TED Europe', 'available', true),
  ('simap', 'SIMAP (Switzerland)', 'planned', false)
on conflict (id) do nothing;

create table if not exists public.radar_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.radar_opportunities (
  id uuid primary key default gen_random_uuid(),

  -- Source provenance. Empty string lot keeps the unique constraint usable,
  -- because Postgres treats NULLs as distinct.
  source_id text not null default 'ted',
  source_ref text not null,
  source_lot text not null default '',
  source_url text not null,
  procedure_ref text,
  notice_version text,
  -- Verified facts exactly as returned by the source, never merged into the
  -- normalized columns or the assessment.
  raw jsonb not null default '{}'::jsonb,

  -- Normalized source facts.
  title text not null,
  buyer_name text,
  country text,
  city text,
  cpv_codes text[] not null default '{}',
  project_type text,
  published_at date,
  deadline_at timestamptz,
  deadline_status text not null default 'unknown',
  value_amount numeric,
  value_currency text,

  -- Radar assessment.
  score integer not null default 0,
  score_band text not null default 'low',
  score_factors jsonb not null default '[]'::jsonb,
  services text[] not null default '{}',
  analysis jsonb not null default '{}'::jsonb,

  -- Workflow. 'archived' covers expired and superseded notices.
  state text not null default 'active',
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,

  new_alert_sent_at timestamptz,
  urgent_alert_sent_at timestamptz,

  first_seen_at timestamptz not null default now(),
  last_checked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint radar_opportunities_source_key unique (source_id, source_ref, source_lot)
);

create index if not exists radar_opportunities_rank_idx
  on public.radar_opportunities (state, score desc, deadline_at asc);
create index if not exists radar_opportunities_seen_idx
  on public.radar_opportunities (first_seen_at desc);
create index if not exists radar_opportunities_country_idx
  on public.radar_opportunities (country, state);

create table if not exists public.radar_runs (
  id uuid primary key default gen_random_uuid(),
  source_id text not null default 'ted',
  trigger text not null default 'schedule',
  status text not null default 'running',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  fetched_count integer not null default 0,
  created_count integer not null default 0,
  updated_count integer not null default 0,
  archived_count integer not null default 0,
  alert_count integer not null default 0,
  error text,
  details jsonb not null default '{}'::jsonb
);

create index if not exists radar_runs_started_idx on public.radar_runs (started_at desc);

grant all on table public.radar_sources to postgres, authenticated, service_role;
grant all on table public.radar_settings to postgres, authenticated, service_role;
grant all on table public.radar_opportunities to postgres, authenticated, service_role;
grant all on table public.radar_runs to postgres, authenticated, service_role;

alter table public.radar_sources enable row level security;
alter table public.radar_settings enable row level security;
alter table public.radar_opportunities enable row level security;
alter table public.radar_runs enable row level security;

drop policy if exists "staff radar sources" on public.radar_sources;
create policy "staff radar sources" on public.radar_sources
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "staff radar settings" on public.radar_settings;
create policy "staff radar settings" on public.radar_settings
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "staff radar opportunities" on public.radar_opportunities;
create policy "staff radar opportunities" on public.radar_opportunities
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "staff radar runs" on public.radar_runs;
create policy "staff radar runs" on public.radar_runs
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
