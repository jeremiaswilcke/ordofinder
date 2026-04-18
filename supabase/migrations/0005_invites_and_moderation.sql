create table public.invite_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  email text not null,
  invited_by uuid references public.profiles(id) on delete set null,
  role public.user_role not null default 'reviewer',
  country_code text references public.countries(code) on delete set null,
  subdivision_code text references public.subdivisions(code) on delete set null,
  quota_override integer check (quota_override is null or quota_override between 0 and 100),
  redeemed_by uuid references public.profiles(id) on delete set null,
  redeemed_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.church_submissions (
  id uuid primary key default gen_random_uuid(),
  church_name text not null,
  city text not null,
  country_code text not null references public.countries(code),
  timezone text not null,
  payload jsonb not null,
  status public.moderation_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.approval_events (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  decision public.moderation_status not null,
  note text,
  created_at timestamptz not null default now(),
  unique (church_id, reviewer_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references public.churches(id) on delete cascade,
  rating_id uuid references public.ratings(id) on delete cascade,
  reason text not null,
  details text,
  ip_hash text not null,
  created_at timestamptz not null default now(),
  check (
    (church_id is not null and rating_id is null)
    or (church_id is null and rating_id is not null)
  )
);

alter table public.invite_tokens enable row level security;
alter table public.church_submissions enable row level security;
alter table public.approval_events enable row level security;
alter table public.reports enable row level security;

create policy "admins manage invites"
on public.invite_tokens
for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('regional_admin', 'global_admin')
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('regional_admin', 'global_admin')
  )
);

create policy "reviewers read submissions"
on public.church_submissions
for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('reviewer', 'regional_admin', 'global_admin')
  )
);

create policy "public create reports"
on public.reports
for insert
with check (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
