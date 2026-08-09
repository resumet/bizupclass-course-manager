create extension if not exists pgcrypto;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  instructor_name text,
  webinar_at timestamptz,
  opening_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.youtube_appearances (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  channel_name text not null check (char_length(trim(channel_name)) > 0),
  appearance_fee bigint not null default 0 check (appearance_fee >= 0),
  revenue_share numeric(5,2) check (revenue_share between 0 and 100),
  contact_name text,
  contact_phone text,
  filming_at timestamptz,
  youtube_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  original_url text not null check (char_length(trim(original_url)) > 0),
  short_code varchar(6) not null unique check (short_code ~ '^[A-Za-z0-9]{6}$'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shared_resources (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  resource_type text,
  url text not null check (char_length(trim(url)) > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists youtube_appearances_course_id_idx
  on public.youtube_appearances(course_id, sort_order);
create index if not exists landing_pages_course_id_idx
  on public.landing_pages(course_id, sort_order);
create index if not exists shared_resources_course_id_idx
  on public.shared_resources(course_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists set_youtube_appearances_updated_at on public.youtube_appearances;
create trigger set_youtube_appearances_updated_at before update on public.youtube_appearances
for each row execute function public.set_updated_at();

drop trigger if exists set_landing_pages_updated_at on public.landing_pages;
create trigger set_landing_pages_updated_at before update on public.landing_pages
for each row execute function public.set_updated_at();

drop trigger if exists set_shared_resources_updated_at on public.shared_resources;
create trigger set_shared_resources_updated_at before update on public.shared_resources
for each row execute function public.set_updated_at();

alter table public.courses enable row level security;
alter table public.youtube_appearances enable row level security;
alter table public.landing_pages enable row level security;
alter table public.shared_resources enable row level security;

create policy "Authenticated users can manage courses"
on public.courses for all to authenticated
using (true) with check (true);

create policy "Authenticated users can manage youtube appearances"
on public.youtube_appearances for all to authenticated
using (true) with check (true);

create policy "Authenticated users can manage landing pages"
on public.landing_pages for all to authenticated
using (true) with check (true);

create policy "Authenticated users can manage shared resources"
on public.shared_resources for all to authenticated
using (true) with check (true);

revoke all on public.courses from anon;
revoke all on public.youtube_appearances from anon;
revoke all on public.landing_pages from anon;
revoke all on public.shared_resources from anon;

grant select, insert, update, delete on public.courses to authenticated;
grant select, insert, update, delete on public.youtube_appearances to authenticated;
grant select, insert, update, delete on public.landing_pages to authenticated;
grant select, insert, update, delete on public.shared_resources to authenticated;
