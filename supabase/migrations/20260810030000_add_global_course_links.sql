create table if not exists public.global_course_links (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  url text not null check (url ~ '^https?://'),
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists global_course_links_sort_order_idx
  on public.global_course_links(sort_order, created_at);

drop trigger if exists set_global_course_links_updated_at on public.global_course_links;
create trigger set_global_course_links_updated_at before update on public.global_course_links
for each row execute function public.set_updated_at();

alter table public.global_course_links enable row level security;

create policy "Authenticated users can manage global course links"
on public.global_course_links for all to authenticated
using (true) with check (true);

revoke all on public.global_course_links from anon;
grant select, insert, update, delete on public.global_course_links to authenticated;
