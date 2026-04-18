create extension if not exists pgcrypto;

create type public.architectural_style as enum (
  'romanesque',
  'romanesque_revival',
  'gothic',
  'gothic_revival',
  'renaissance',
  'baroque',
  'rococo',
  'neoclassical',
  'neo_byzantine',
  'modernist_sacred',
  'contemporary',
  'vernacular',
  'other'
);

create type public.rite as enum (
  'roman',
  'byzantine',
  'maronite',
  'chaldean',
  'syro_malabar',
  'syro_malankara',
  'coptic_catholic',
  'ethiopian_catholic',
  'armenian_catholic',
  'ambrosian',
  'mozarabic',
  'other'
);

create type public.roman_form as enum ('novus_ordo', 'tridentine', 'not_applicable');
create type public.moderation_status as enum ('pending', 'partially_approved', 'approved', 'rejected');
create type public.user_role as enum ('reviewer', 'regional_admin', 'global_admin');

create table public.countries (
  code text primary key,
  name text not null
);

create table public.subdivisions (
  code text primary key,
  country_code text not null references public.countries(code) on delete cascade,
  name text not null
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label_en text not null,
  label_de text not null
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.user_role,
  reviewer_invite_quota integer not null default 3 check (reviewer_invite_quota between 0 and 100),
  created_at timestamptz not null default now()
);

create table public.reviewer_regions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  country_code text references public.countries(code) on delete cascade,
  subdivision_code text references public.subdivisions(code) on delete cascade,
  is_global_scope boolean not null default false,
  created_at timestamptz not null default now(),
  check (
    is_global_scope
    or country_code is not null
    or subdivision_code is not null
  )
);

create table public.churches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  address text not null,
  city text not null,
  country_code text not null references public.countries(code),
  subdivision_code text references public.subdivisions(code),
  postal_code text,
  latitude numeric(9, 6) not null check (latitude between -90 and 90),
  longitude numeric(9, 6) not null check (longitude between -180 and 180),
  timezone text not null,
  diocese text,
  consecration_year smallint check (
    consecration_year is null
    or consecration_year between 100 and extract(year from now())::int
  ),
  architectural_style public.architectural_style,
  capacity integer check (capacity is null or capacity between 10 and 50000),
  short_note text check (short_note is null or char_length(short_note) <= 200),
  description text not null check (char_length(description) <= 2000),
  hero_image_url text,
  website text,
  phone text,
  email text,
  status public.moderation_status not null default 'pending',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.church_tags (
  church_id uuid not null references public.churches(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (church_id, tag_id)
);

create table public.mass_times (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  language_code text not null,
  rite public.rite not null,
  form public.roman_form not null,
  notes text,
  created_at timestamptz not null default now(),
  check (
    (rite = 'roman' and form in ('novus_ordo', 'tridentine', 'not_applicable'))
    or (rite <> 'roman' and form = 'not_applicable')
  )
);

create table public.music_styles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null
);

create table public.mass_time_music_styles (
  mass_time_id uuid not null references public.mass_times(id) on delete cascade,
  music_style_id uuid not null references public.music_styles(id) on delete cascade,
  primary key (mass_time_id, music_style_id)
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  liturgy_quality smallint not null check (liturgy_quality between 1 and 10),
  music smallint not null check (music between 1 and 10),
  homily_clarity smallint not null check (homily_clarity between 1 and 10),
  vibrancy smallint not null check (vibrancy between 1 and 10),
  review_text text check (review_text is null or char_length(review_text) <= 300),
  is_anonymous boolean not null default false,
  status public.moderation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (church_id, user_id)
);

create view public.church_ratings_summary as
select
  church_id,
  count(*)::int as rating_count,
  round(avg(liturgy_quality)::numeric, 1) as avg_liturgy,
  round(avg(music)::numeric, 1) as avg_music,
  round(avg(homily_clarity)::numeric, 1) as avg_homily,
  round(avg(vibrancy)::numeric, 1) as avg_vibrancy,
  round(avg((liturgy_quality + music + homily_clarity + vibrancy) / 4.0)::numeric, 1) as avg_overall
from public.ratings
where status = 'approved'
group by church_id;
