create table if not exists public.course_content_documents (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  content_type text not null
    constraint course_content_documents_type_check
    check (content_type in ('instagram_dm', 'contract_template')),
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_content_documents_course_type_key
    unique (course_id, content_type)
);

drop trigger if exists set_course_content_documents_updated_at
on public.course_content_documents;
create trigger set_course_content_documents_updated_at
before update on public.course_content_documents
for each row execute function public.set_updated_at();

alter table public.course_content_documents enable row level security;

revoke all on table public.course_content_documents from anon, authenticated;
grant select, insert, update, delete
on table public.course_content_documents to authenticated;

-- This is a shared internal operations app: every signed-in operator can manage
-- every course and its content, matching the existing course table policies.
create policy "Authenticated users can view course content documents"
on public.course_content_documents for select
to authenticated
using (true);

create policy "Authenticated users can create course content documents"
on public.course_content_documents for insert
to authenticated
with check (true);

create policy "Authenticated users can update course content documents"
on public.course_content_documents for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete course content documents"
on public.course_content_documents for delete
to authenticated
using (true);
