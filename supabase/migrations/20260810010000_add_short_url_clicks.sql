create table if not exists public.short_url_clicks (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references public.landing_pages(id) on delete cascade,
  clicked_at timestamptz not null default now(),
  referrer text,
  user_agent text,
  country_code varchar(2),
  region text,
  city text
);

create index if not exists short_url_clicks_landing_page_clicked_at_idx
  on public.short_url_clicks(landing_page_id, clicked_at desc);

alter table public.short_url_clicks enable row level security;

create policy "Authenticated users can view short URL clicks"
on public.short_url_clicks for select to authenticated
using (true);

revoke all on public.short_url_clicks from anon;
grant select on public.short_url_clicks to authenticated;
