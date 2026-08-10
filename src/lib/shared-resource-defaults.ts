export const DEFAULT_SHARED_RESOURCE_URL = "https://bizupclass.com";

export const DEFAULT_SHARED_RESOURCES = [
  { name: "무료특강 자료 드라이브", resource_type: "Google Drive" },
  { name: "유료강의 커리큘럼 시트", resource_type: "Google Sheets" },
  { name: "무료 단톡방(1번) 주소", resource_type: "기타" },
] as const;

export function createDefaultSharedResources(courseId: string) {
  return DEFAULT_SHARED_RESOURCES.map((resource, sortOrder) => ({
    course_id: courseId,
    name: resource.name,
    resource_type: resource.resource_type,
    url: DEFAULT_SHARED_RESOURCE_URL,
    sort_order: sortOrder,
  }));
}
