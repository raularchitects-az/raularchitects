-- Apply in Supabase SQL editor on the live project.
-- Adds public SELECT for published+active content. Does not weaken staff write policies.

grant select on table
  public.projects,
  public.portfolio,
  public.blog_posts,
  public.services,
  public.site_settings,
  public.redirects
to anon;

drop policy if exists "public read published projects" on public.projects;
create policy "public read published projects" on public.projects
for select to anon, authenticated
using (status = 'published' and is_active = true);

drop policy if exists "public read published portfolio" on public.portfolio;
create policy "public read published portfolio" on public.portfolio
for select to anon, authenticated
using (status = 'published' and is_active = true);

drop policy if exists "public read published blog" on public.blog_posts;
create policy "public read published blog" on public.blog_posts
for select to anon, authenticated
using (status = 'published' and is_active = true);

drop policy if exists "public read published services" on public.services;
create policy "public read published services" on public.services
for select to anon, authenticated
using (status = 'published' and is_active = true);

drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings
for select to anon, authenticated
using (true);

drop policy if exists "public read redirects" on public.redirects;
create policy "public read redirects" on public.redirects
for select to anon, authenticated
using (true);
