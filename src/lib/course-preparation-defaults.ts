import { getKoreanDateKey } from "@/lib/course-preparation";
import type { Course } from "@/types/database";

const DEFAULT_TASKS = [
  { category: "planning" as const, title: "강의 기획 확정" },
  { category: "instagram" as const, title: "강사 인스타그램 운영" },
  { category: "youtube" as const, title: "유튜브 출연·콘텐츠" },
  { category: "landing" as const, title: "랜딩페이지 제작" },
  { category: "materials" as const, title: "강의자료 준비" },
];

function isoToKoreanDate(value: string | null) {
  return value ? getKoreanDateKey(new Date(value)) : null;
}

export function createDefaultPreparationTasks(course: Course) {
  const dueDate = isoToKoreanDate(course.opening_at ?? course.webinar_at);
  const startDate = isoToKoreanDate(course.created_at);
  return DEFAULT_TASKS.map((task, sortOrder) => ({
    course_id: course.id,
    category: task.category,
    title: task.title,
    start_date: startDate,
    due_date: dueDate,
    sort_order: sortOrder,
  }));
}
