insert into public.shared_resources (course_id, name, resource_type, url, sort_order)
select
  courses.id,
  defaults.name,
  defaults.resource_type,
  'https://bizupclass.com',
  defaults.sort_order
from public.courses
cross join (
  values
    ('무료특강 자료 드라이브', 'Google Drive', 0),
    ('유료강의 커리큘럼 시트', 'Google Sheets', 1),
    ('무료 단톡방(1번) 주소', '기타', 2)
) as defaults(name, resource_type, sort_order)
where not exists (
  select 1
  from public.shared_resources
  where shared_resources.course_id = courses.id
    and shared_resources.name = defaults.name
);
