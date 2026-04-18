-- ============================================================================
-- 0007_applications_and_four_eyes.sql
--
-- Baut das 4-Augen- und Bewerbungs-Modell auf den Rollen aus 0006 auf:
--   * `reviewer_applications` fuer eingeloggte User ohne Rolle.
--   * `moderation_actions` als generische Signaturtabelle
--     (target_type church|rating|application).
--   * Gewichtsfunktion + Trigger: nach jeder Signatur wird Status neu berechnet.
--   * Auto-Approve, wenn Tier 1+ ein Target anlegt.
--   * Bewerbung angenommen -> profiles.role = 'reviewer' (Tier 2).
--   * RLS: anonym nur lesen; INSERT/Signatur braucht Login mit passender Rolle.
-- ============================================================================


-- 1. Bewerbungstabelle
create table if not exists public.reviewer_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  about text not null check (char_length(about) between 10 and 2000),
  motivation text not null check (char_length(motivation) between 10 and 2000),
  preferred_country_code text references public.countries(code) on delete set null,
  preferred_subdivision_code text references public.subdivisions(code) on delete set null,
  status public.moderation_status not null default 'pending',
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz not null default now()
);

create unique index if not exists reviewer_applications_user_pending
  on public.reviewer_applications(user_id)
  where status = 'pending';


-- 2. Generische Moderations-Actions
create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('church', 'rating', 'application')),
  target_id uuid not null,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('approve', 'reject')),
  note text,
  created_at timestamptz not null default now(),
  unique (target_type, target_id, actor_id)
);

create index if not exists moderation_actions_target
  on public.moderation_actions (target_type, target_id);


-- 3. Gewichtsfunktion. Tier 1+ = 2 (solo reicht), Tier 2 = 1 (zwei reichen zusammen).
-- Text-Cast verwendet, um Enum-Literale im selben File zu vermeiden.
create or replace function public.user_role_weight(p_role public.user_role)
returns integer
language sql
immutable
as $$
  select case p_role::text
    when 'global_admin'    then 2
    when 'regional_admin'  then 2
    when 'senior_reviewer' then 2
    when 'reviewer'        then 1
    else 0
  end;
$$;


-- 4. Helper: aktuelle Nutzerrolle
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;


-- 5. Recompute-Trigger fuer ein Target nach jeder Action
create or replace function public.recompute_target_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator uuid;
  v_creator_role_text text;
  v_weight int;
  v_reject_tier1 int;
  v_new_status public.moderation_status;
  v_target_type text := NEW.target_type;
  v_target_id uuid := NEW.target_id;
begin
  if v_target_type = 'church' then
    select created_by into v_creator from public.churches where id = v_target_id;
  elsif v_target_type = 'rating' then
    select user_id into v_creator from public.ratings where id = v_target_id;
  elsif v_target_type = 'application' then
    select user_id into v_creator from public.reviewer_applications where id = v_target_id;
  end if;

  select role::text into v_creator_role_text from public.profiles where id = v_creator;

  select coalesce(sum(public.user_role_weight(p.role)), 0)
  into v_weight
  from public.moderation_actions ma
  join public.profiles p on p.id = ma.actor_id
  where ma.target_type = v_target_type
    and ma.target_id = v_target_id
    and ma.action = 'approve'
    and ma.actor_id is distinct from v_creator;

  select count(*) into v_reject_tier1
  from public.moderation_actions ma
  join public.profiles p on p.id = ma.actor_id
  where ma.target_type = v_target_type
    and ma.target_id = v_target_id
    and ma.action = 'reject'
    and p.role::text in ('senior_reviewer', 'regional_admin', 'global_admin');

  if v_reject_tier1 > 0 then
    v_new_status := 'rejected';
  elsif v_creator_role_text in ('senior_reviewer', 'regional_admin', 'global_admin')
     or v_weight >= 2 then
    v_new_status := 'approved';
  elsif v_weight > 0 then
    v_new_status := 'partially_approved';
  else
    v_new_status := 'pending';
  end if;

  if v_target_type = 'church' then
    update public.churches set status = v_new_status, updated_at = now() where id = v_target_id;
  elsif v_target_type = 'rating' then
    update public.ratings set status = v_new_status, updated_at = now() where id = v_target_id;
  elsif v_target_type = 'application' then
    update public.reviewer_applications
      set status = v_new_status,
          decided_by = coalesce(decided_by, NEW.actor_id),
          decided_at = coalesce(decided_at, now())
      where id = v_target_id;
  end if;

  return NEW;
end;
$$;

drop trigger if exists moderation_actions_recompute on public.moderation_actions;
create trigger moderation_actions_recompute
  after insert on public.moderation_actions
  for each row execute function public.recompute_target_status();


-- 6. Auto-Approve bei Create wenn Ersteller Tier 1+
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

  if v_creator is not null then
    select role::text into v_role_text from public.profiles where id = v_creator;
    if v_role_text in ('senior_reviewer', 'regional_admin', 'global_admin') then
      NEW.status := 'approved';
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists churches_auto_approve on public.churches;
create trigger churches_auto_approve
  before insert on public.churches
  for each row execute function public.auto_approve_on_create();

drop trigger if exists ratings_auto_approve on public.ratings;
create trigger ratings_auto_approve
  before insert on public.ratings
  for each row execute function public.auto_approve_on_create();


-- 7. Bewerbung angenommen -> profiles.role auf 'reviewer' setzen
create or replace function public.apply_application_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.status = 'approved' and NEW.status is distinct from OLD.status then
    update public.profiles
    set role = 'reviewer'
    where id = NEW.user_id
      and role is null;

    if NEW.preferred_country_code is not null or NEW.preferred_subdivision_code is not null then
      insert into public.reviewer_regions (user_id, country_code, subdivision_code)
      values (NEW.user_id, NEW.preferred_country_code, NEW.preferred_subdivision_code)
      on conflict do nothing;
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists reviewer_applications_on_approve on public.reviewer_applications;
create trigger reviewer_applications_on_approve
  after update on public.reviewer_applications
  for each row execute function public.apply_application_approval();


-- 8. RLS aktivieren fuer neue Tabellen
alter table public.reviewer_applications enable row level security;
alter table public.moderation_actions enable row level security;


-- 9. Policies: reviewer_applications
create policy "own application readable"
  on public.reviewer_applications
  for select
  using (auth.uid() = user_id);

create policy "admins read all applications"
  on public.reviewer_applications
  for select
  using (public.current_user_role()::text in ('regional_admin', 'global_admin'));

-- Eingeloggte ohne Rolle duerfen Antrag stellen
create policy "logged in without role can apply"
  on public.reviewer_applications
  for insert
  with check (
    auth.uid() = user_id
    and public.current_user_role() is null
  );


-- 10. Policies: moderation_actions
create policy "reviewers sign others work"
  on public.moderation_actions
  for insert
  with check (
    auth.uid() = actor_id
    and public.current_user_role()::text in ('reviewer', 'senior_reviewer', 'regional_admin', 'global_admin')
    and case
      when target_type = 'church'      then (select created_by from public.churches where id = target_id) is distinct from auth.uid()
      when target_type = 'rating'      then (select user_id   from public.ratings  where id = target_id) is distinct from auth.uid()
      when target_type = 'application' then (select user_id   from public.reviewer_applications where id = target_id) is distinct from auth.uid()
      else false
    end
  );

create policy "reviewers read actions"
  on public.moderation_actions
  for select
  using (public.current_user_role()::text in ('reviewer', 'senior_reviewer', 'regional_admin', 'global_admin'));


-- 11. Policy: churches INSERT (Tier 2+)
drop policy if exists "reviewers create churches" on public.churches;
create policy "reviewers create churches"
  on public.churches
  for insert
  with check (
    auth.uid() = created_by
    and public.current_user_role()::text in ('reviewer', 'senior_reviewer', 'regional_admin', 'global_admin')
  );


-- 12. Policy: ratings INSERT (Tier 2+)
drop policy if exists "reviewers create ratings" on public.ratings;
create policy "reviewers create ratings"
  on public.ratings
  for insert
  with check (
    auth.uid() = user_id
    and public.current_user_role()::text in ('reviewer', 'senior_reviewer', 'regional_admin', 'global_admin')
  );


-- 13. Policy: profiles
drop policy if exists "own profile readable" on public.profiles;
create policy "own profile readable"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "admins read all profiles" on public.profiles;
create policy "admins read all profiles"
  on public.profiles
  for select
  using (public.current_user_role()::text in ('regional_admin', 'global_admin'));

drop policy if exists "admins update profiles role" on public.profiles;
create policy "admins update profiles role"
  on public.profiles
  for update
  using (
    public.current_user_role()::text in ('regional_admin', 'global_admin')
  )
  with check (
    public.current_user_role()::text in ('regional_admin', 'global_admin')
  );


-- 14. Komfort-View: offene Moderations-Queue
create or replace view public.moderation_queue as
  select 'church'::text as target_type, id as target_id, status, created_at
    from public.churches where status in ('pending', 'partially_approved')
  union all
  select 'rating'::text, id, status, created_at
    from public.ratings where status in ('pending', 'partially_approved')
  union all
  select 'application'::text, id, status, created_at
    from public.reviewer_applications where status in ('pending', 'partially_approved');

grant select on public.moderation_queue to authenticated;
