-- Business Radar (Phase 2 — SIMAP Switzerland).
-- Additive and safe to run more than once. Run patch-business-radar.sql first.
--
-- No table, column, policy or CMS object is created or altered here. The patch
-- only promotes the SIMAP source row from 'planned' to 'available' now that an
-- official simap.ch API client exists, and adds one index that the cross-source
-- duplicate check reads.

insert into public.radar_sources (id, label, availability, is_enabled)
values ('simap', 'SIMAP Switzerland', 'available', true)
on conflict (id) do update
  set label = excluded.label,
      availability = excluded.availability,
      is_enabled = true,
      updated_at = now();

-- A Swiss tender above the WTO threshold is published on both SIMAP and TED.
-- Discovery looks an official reference up across sources before inserting,
-- which is a lookup by source_ref alone.
create index if not exists radar_opportunities_ref_idx
  on public.radar_opportunities (source_ref);
