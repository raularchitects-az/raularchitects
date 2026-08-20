-- Raul Architects CMS
-- Run this in the Supabase SQL editor (see SETUP.md).

create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('admin', 'editor');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.content_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'editor',
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  bucket text not null default 'media',
  mime text not null,
  size_bytes integer not null default 0,
  alt_text text,
  width integer,
  height integer,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null default 'villa',
  location text,
  area_m2 text,
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
  sections jsonb not null default '{}'::jsonb,
  gallery jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  country text,
  service_filter text,
  category text not null default 'villa',
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
  gallery jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null default 'architecture',
  status public.content_status not null default 'draft',
  is_active boolean not null default true,
  show_on_home boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  cover_path text,
  og_image_path text,
  canonical_url text,
  published_at date,
  translations jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  icon text,
  number text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  show_on_home boolean not null default true,
  image_path text,
  video_url text,
  seo_title text,
  meta_description text,
  translations jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text not null unique,
  to_path text not null,
  status_code integer not null default 301,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  summary text,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  payload jsonb not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists projects_status_idx on public.projects (status, is_active, sort_order);
create index if not exists portfolio_status_idx on public.portfolio (status, is_active, sort_order);
create index if not exists blog_status_idx on public.blog_posts (status, is_active, published_at desc);
create index if not exists audit_created_idx on public.audit_logs (created_at desc);
create index if not exists revisions_entity_idx on public.content_revisions (entity_type, entity_id, created_at desc);

grant usage on schema public to anon, authenticated, service_role;
grant all on table
  public.profiles,
  public.media,
  public.projects,
  public.portfolio,
  public.blog_posts,
  public.services,
  public.site_settings,
  public.redirects,
  public.audit_logs,
  public.content_revisions
to postgres, authenticated, service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
grant select on table
  public.projects,
  public.portfolio,
  public.blog_posts,
  public.services,
  public.site_settings,
  public.redirects
to anon;

alter table public.profiles enable row level security;
alter table public.media enable row level security;
alter table public.projects enable row level security;
alter table public.portfolio enable row level security;
alter table public.blog_posts enable row level security;
alter table public.services enable row level security;
alter table public.site_settings enable row level security;
alter table public.redirects enable row level security;
alter table public.audit_logs enable row level security;
alter table public.content_revisions enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

grant execute on function public.is_staff() to authenticated, service_role;
grant execute on function public.is_admin() to authenticated, service_role;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
for select to authenticated
using (id = auth.uid());

drop policy if exists "staff read profiles" on public.profiles;
create policy "staff read profiles" on public.profiles for select to authenticated using (public.is_staff());
drop policy if exists "admin write profiles" on public.profiles;
create policy "admin write profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "staff media" on public.media;
create policy "staff media" on public.media for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "staff projects" on public.projects;
create policy "staff projects" on public.projects for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "public read published projects" on public.projects;
create policy "public read published projects" on public.projects
for select to anon, authenticated
using (status = 'published' and is_active = true);

drop policy if exists "staff portfolio" on public.portfolio;
create policy "staff portfolio" on public.portfolio for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "public read published portfolio" on public.portfolio;
create policy "public read published portfolio" on public.portfolio
for select to anon, authenticated
using (status = 'published' and is_active = true);

drop policy if exists "staff blog" on public.blog_posts;
create policy "staff blog" on public.blog_posts for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "public read published blog" on public.blog_posts;
create policy "public read published blog" on public.blog_posts
for select to anon, authenticated
using (status = 'published' and is_active = true);

drop policy if exists "staff services" on public.services;
create policy "staff services" on public.services for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "public read published services" on public.services;
create policy "public read published services" on public.services
for select to anon, authenticated
using (status = 'published' and is_active = true);

drop policy if exists "staff settings" on public.site_settings;
create policy "staff settings" on public.site_settings for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings for select to anon, authenticated using (true);

drop policy if exists "staff redirects" on public.redirects;
create policy "staff redirects" on public.redirects for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "public read redirects" on public.redirects;
create policy "public read redirects" on public.redirects for select to anon, authenticated using (true);

drop policy if exists "staff audit read" on public.audit_logs;
create policy "staff audit read" on public.audit_logs for select to authenticated using (public.is_staff());
drop policy if exists "staff audit insert" on public.audit_logs;
create policy "staff audit insert" on public.audit_logs for insert to authenticated with check (public.is_staff());

drop policy if exists "staff revisions" on public.content_revisions;
create policy "staff revisions" on public.content_revisions for all to authenticated using (public.is_staff()) with check (public.is_staff());

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "staff upload media" on storage.objects;
create policy "staff upload media"
on storage.objects for insert to authenticated
with check (bucket_id = 'media' and public.is_staff());

drop policy if exists "staff update media" on storage.objects;
create policy "staff update media"
on storage.objects for update to authenticated
using (bucket_id = 'media' and public.is_staff());

drop policy if exists "staff delete media" on storage.objects;
create policy "staff delete media"
on storage.objects for delete to authenticated
using (bucket_id = 'media' and public.is_staff());

drop policy if exists "public read media" on storage.objects;
create policy "public read media"
on storage.objects for select
using (bucket_id = 'media');

insert into public.services (slug, icon, number, sort_order, translations)
values
  (
    'bim-ile-layihelendirme',
    'Boxes',
    '01',
    1,
    '{"az":{"title":"BIM Memarlıq","intro":"","body":""},"en":{"title":"BIM Architecture","intro":"","body":""},"de":{"title":"BIM-Architektur","intro":"","body":""},"ru":{"title":"BIM-архитектура","intro":"","body":""}}'::jsonb
  ),
  (
    'tikinti-ve-temir',
    'HardHat',
    '02',
    2,
    '{"az":{"title":"Tikinti və Təmir","intro":"","body":""},"en":{"title":"Construction & Renovation","intro":"","body":""},"de":{"title":"Bau und Sanierung","intro":"","body":""},"ru":{"title":"Строительство и ремонт","intro":"","body":""}}'::jsonb
  ),
  (
    'interyer-dizayn',
    'Sofa',
    '03',
    3,
    '{"az":{"title":"İnteryer Dizayn","intro":"","body":""},"en":{"title":"Interior Design","intro":"","body":""},"de":{"title":"Interior Design","intro":"","body":""},"ru":{"title":"Дизайн интерьера","intro":"","body":""}}'::jsonb
  ),
  (
    'seherselme-layiheleri',
    'Building2',
    '04',
    4,
    '{"az":{"title":"Şəhərsalma Həlləri","intro":"","body":""},"en":{"title":"Urban Planning","intro":"","body":""},"de":{"title":"Städtebau","intro":"","body":""},"ru":{"title":"Градостроительство","intro":"","body":""}}'::jsonb
  )
on conflict (slug) do nothing;

alter table public.blog_posts add column if not exists seo_title text;
alter table public.blog_posts add column if not exists meta_description text;
alter table public.blog_posts add column if not exists video_url text;
alter table public.services add column if not exists status public.content_status not null default 'draft';
alter table public.services add column if not exists cover_path text;
alter table public.services add column if not exists og_image_path text;
alter table public.services add column if not exists canonical_url text;

insert into public.site_settings (key, value) values
  ('hero', '{"raulName":"Raul NAGHIYEV","role1":"","role2":"","roleLine2":"","roleLine3":"","photoDesktop":"/images/raul-hero.jpg","photoMobile":"/images/raul-hero-mobile.jpg","identityHref":"/haqqimizda/raul-nagiyev"}'::jsonb),
  ('contact', '{"email":"office@raularchitects.com","whatsapp":"","azerbaijan":{"phone":"","address":""},"germany":{"phone":"","address":""},"switzerland":{"phone":"","address":""}}'::jsonb),
  ('about', '{"intro":"","blocks":[]}'::jsonb),
  ('footer', '{"credit":""}'::jsonb),
  ('home', '{"showProjects":true,"showPortfolio":true,"showBlog":false,"showServices":true}'::jsonb)
on conflict (key) do nothing;
