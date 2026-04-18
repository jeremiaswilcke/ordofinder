-- ============================================================================
-- 0009_security_hardening.sql
--
-- Security-Audit-Findings F-01, F-03, F-07, plus RLS-Coverage fuer die
-- ungesicherten Lookup-Tabellen.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- F-01: profiles-UPDATE-Policy zu weit.
-- ---------------------------------------------------------------------------

drop policy if exists "admins update profiles role" on public.profiles;
drop policy if exists "global admin updates profiles" on public.profiles;
drop policy if exists "regional admin updates lower profiles" on public.profiles;

create policy "global admin updates profiles"
  on public.profiles
  for update
  using (
    public.current_user_role()::text = 'global_admin'
    and id <> auth.uid()
  )
  with check (
    public.current_user_role()::text = 'global_admin'
    and id <> auth.uid()
  );

create policy "regional admin updates lower profiles"
  on public.profiles
  for update
  using (
    public.current_user_role()::text = 'regional_admin'
    and id <> auth.uid()
  )
  with check (
    public.current_user_role()::text = 'regional_admin'
    and id <> auth.uid()
    and (role is null or role::text in ('reviewer', 'senior_reviewer'))
  );


-- ---------------------------------------------------------------------------
-- F-03: auto_approve_on_create erzwingt den Status jetzt immer.
-- ---------------------------------------------------------------------------

create or replace function public.auto_approve_on_create()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role_text text;
  v_creator uuid;
begin
  if TG_TABLE_NAME = 'churches' then
    v_creator := NEW.created_by;
  elsif TG_TABLE_NAME = 'ratings' then
    v_creator := NEW.user_id;
  end if;

  if v_creator is null then
    NEW.status := 'pending';
    return NEW;
  end if;

  select role::text into v_role_text from public.profiles where id = v_creator;

  if v_role_text in ('senior_reviewer', 'regional_admin', 'global_admin') then
    NEW.status := 'approved';
  else
    NEW.status := 'pending';
  end if;

  return NEW;
end;
$$;


-- ---------------------------------------------------------------------------
-- F-07: moderation-Actions akzeptierten Geister-UUIDs.
-- ---------------------------------------------------------------------------

drop policy if exists "reviewers sign others work" on public.moderation_actions;

create policy "reviewers sign others work"
  on public.moderation_actions
  for insert
  with check (
    auth.uid() = actor_id
    and public.current_user_role()::text in (
      'reviewer', 'senior_reviewer', 'regional_admin', 'global_admin'
    )
    and case
      when target_type = 'church' then exists (
        select 1 from public.churches
        where id = target_id
          and (created_by is null or created_by <> auth.uid())
      )
      when target_type = 'rating' then exists (
        select 1 from public.ratings
        where id = target_id
          and user_id <> auth.uid()
      )
      when target_type = 'application' then exists (
        select 1 from public.reviewer_applications
        where id = target_id
          and user_id <> auth.uid()
      )
      else false
    end
  );


-- ---------------------------------------------------------------------------
-- RLS fuer Lookup-Tabellen.
-- ---------------------------------------------------------------------------

alter table public.countries enable row level security;
alter table public.subdivisions enable row level security;
alter table public.tags enable row level security;
alter table public.music_styles enable row level security;
alter table public.mass_time_music_styles enable row level security;
alter table public.approval_events enable row level security;

drop policy if exists "public reads countries" on public.countries;
create policy "public reads countries"
  on public.countries for select using (true);

drop policy if exists "public reads subdivisions" on public.subdivisions;
create policy "public reads subdivisions"
  on public.subdivisions for select using (true);

drop policy if exists "public reads tags" on public.tags;
create policy "public reads tags"
  on public.tags for select using (true);

drop policy if exists "public reads music styles" on public.music_styles;
create policy "public reads music styles"
  on public.music_styles for select using (true);

drop policy if exists "public reads mass time music styles" on public.mass_time_music_styles;
create policy "public reads mass time music styles"
  on public.mass_time_music_styles for select using (true);

drop policy if exists "reviewers read approval events" on public.approval_events;
create policy "reviewers read approval events"
  on public.approval_events
  for select
  using (
    public.current_user_role()::text in (
      'reviewer', 'senior_reviewer', 'regional_admin', 'global_admin'
    )
  );

-- reviewer_regions
drop policy if exists "own reviewer regions readable" on public.reviewer_regions;
create policy "own reviewer regions readable"
  on public.reviewer_regions
  for select
  using (user_id = auth.uid());

drop policy if exists "admins read reviewer regions" on public.reviewer_regions;
create policy "admins read reviewer regions"
  on public.reviewer_regions
  for select
  using (
    public.current_user_role()::text in ('regional_admin', 'global_admin')
  );
