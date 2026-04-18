alter table public.profiles enable row level security;
alter table public.reviewer_regions enable row level security;
alter table public.churches enable row level security;
alter table public.church_tags enable row level security;
alter table public.mass_times enable row level security;
alter table public.ratings enable row level security;

create policy "public can read approved churches"
on public.churches
for select
using (status = 'approved');

create policy "public can read church tags"
on public.church_tags
for select
using (true);

create policy "public can read mass times for approved churches"
on public.mass_times
for select
using (
  exists (
    select 1 from public.churches
    where churches.id = mass_times.church_id
      and churches.status = 'approved'
  )
);

create policy "public can read approved ratings"
on public.ratings
for select
using (status = 'approved');
