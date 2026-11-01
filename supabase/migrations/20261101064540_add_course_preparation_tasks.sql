create table if not exists public.course_preparation_tasks (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  category text not null default 'other'
    constraint course_preparation_tasks_category_check
    check (category in ('planning', 'instagram', 'youtube', 'landing', 'materials', 'other')),
  title text not null check (char_length(trim(title)) > 0),
  status text not null default 'not_started'
    constraint course_preparation_tasks_status_check
    check (status in ('not_started', 'in_progress', 'completed', 'blocked')),
  progress_percent integer not null default 0
    check (progress_percent between 0 and 100),
  start_date date,
  due_date date,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_preparation_tasks_date_order_check
    check (start_date is null or due_date is null or start_date <= due_date)
);

create index if not exists course_preparation_tasks_course_id_idx
  on public.course_preparation_tasks(course_id, sort_order);

drop trigger if exists set_course_preparation_tasks_updated_at on public.course_preparation_tasks;
create trigger set_course_preparation_tasks_updated_at
before update on public.course_preparation_tasks
for each row execute function public.set_updated_at();

alter table public.course_preparation_tasks enable row level security;

revoke all on table public.course_preparation_tasks from anon, authenticated;
grant select, insert, update, delete on table public.course_preparation_tasks to authenticated;

create policy "Authenticated users can view course preparation tasks"
on public.course_preparation_tasks for select
to authenticated
using (true);

create policy "Authenticated users can create course preparation tasks"
on public.course_preparation_tasks for insert
to authenticated
with check (true);

create policy "Authenticated users can update course preparation tasks"
on public.course_preparation_tasks for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete course preparation tasks"
on public.course_preparation_tasks for delete
to authenticated
using (true);

insert into public.course_preparation_tasks (
  course_id,
  category,
  title,
  start_date,
  due_date,
  sort_order
)
select
  courses.id,
  defaults.category,
  defaults.title,
  (courses.created_at at time zone 'Asia/Seoul')::date,
  (coalesce(courses.opening_at, courses.webinar_at) at time zone 'Asia/Seoul')::date,
  defaults.sort_order
from public.courses
cross join (
  values
    ('planning', '강의 기획 확정', 0),
    ('instagram', '강사 인스타그램 운영', 1),
    ('youtube', '유튜브 출연·콘텐츠', 2),
    ('landing', '랜딩페이지 제작', 3),
    ('materials', '강의자료 준비', 4)
) as defaults(category, title, sort_order)
where not exists (
  select 1
  from public.course_preparation_tasks
  where course_preparation_tasks.course_id = courses.id
    and course_preparation_tasks.category = defaults.category
    and course_preparation_tasks.title = defaults.title
);
