-- Additive Insights collection. Safe to run more than once.
-- Does not drop tables, delete rows, or change environment settings.

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null default 'architecture',
  status public.content_status not null default 'draft',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  cover_path text,
  og_image_path text,
  video_url text,
  canonical_url text,
  seo_title text,
  meta_description text,
  translations jsonb not null default '{}'::jsonb,
  published_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists insights_status_idx on public.insights (status, is_active, published_at desc);

grant all on table public.insights to postgres, authenticated, service_role;
grant select on table public.insights to anon;

alter table public.insights enable row level security;

drop policy if exists "staff insights" on public.insights;
create policy "staff insights" on public.insights for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "public read published insights" on public.insights;
create policy "public read published insights"
on public.insights
for select to anon, authenticated
using (status = 'published' and is_active = true);
