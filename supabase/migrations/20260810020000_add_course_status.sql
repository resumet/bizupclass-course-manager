alter table public.courses
  add column status text not null default 'preparing'
  constraint courses_status_check
  check (status in ('preparing', 'confirmed', 'ended', 'cancelled'));

create index courses_webinar_at_idx on public.courses (webinar_at asc nulls last);
