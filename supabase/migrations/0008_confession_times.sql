-- ============================================================================
-- 0008_confession_times.sql
--
-- Fuegt eine eigene Tabelle fuer Beichtzeiten hinzu und setzt INSERT-/DELETE-
-- Policies fuer mass_times und confession_times, sodass nur eingeloggte
-- Reviewer (Tier 2+) Eintraege anlegen koennen.
-- ============================================================================

create table if not exists public.confession_times (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time,
  language_code text,
  notes text check (notes is null or char_length(notes) <= 200),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_time is null or end_time > start_time)
);

create index if not exists confession_times_church on public.confession_times (church_id);

alter table public.confession_times enable row level security;

-- Oeffentliches Lesen, wenn die zugehoerige Kirche approved ist
create policy "public reads confession times"
  on public.confession_times
  for select
  using (
    exists (
      select 1 from public.churches
      where churches.id = confession_times.church_id
        and churches.status = 'approved'
    )
  );

-- Reviewer+ koennen Beichtzeiten anlegen
create policy "reviewers insert confession times"
  on public.confession_times
  for insert
  with check (
    auth.uid() = created_by
    and public.current_user_role()::text in ('reviewer', 'senior_reviewer', 'regional_admin', 'global_admin')
  );

-- Eigene Eintraege loeschen, Tier 1+ koennen alle loeschen
create policy "delete own or tier1 confession times"
  on public.confession_times
  for delete
  using (
    auth.uid() = created_by
    or public.current_user_role()::text in ('senior_reviewer', 'regional_admin', 'global_admin')
  );

-- --------------------------------------------------------------------------
-- mass_times: INSERT + DELETE Policies analog
-- --------------------------------------------------------------------------

-- Spalte created_by ergaenzen (fehlte bisher)
alter table public.mass_times
  add column if not exists created_by uuid references public.profiles(id) on delete set null;

drop policy if exists "reviewers insert mass times" on public.mass_times;
create policy "reviewers insert mass times"
  on public.mass_times
  for insert
  with check (
    (created_by is null or auth.uid() = created_by)
    and public.current_user_role()::text in ('reviewer', 'senior_reviewer', 'regional_admin', 'global_admin')
  );

drop policy if exists "delete own or tier1 mass times" on public.mass_times;
create policy "delete own or tier1 mass times"
  on public.mass_times
  for delete
  using (
    auth.uid() = created_by
    or public.current_user_role()::text in ('senior_reviewer', 'regional_admin', 'global_admin')
  );
