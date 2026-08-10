import { CircleCheckBig, CircleDashed, CircleX, Flag } from "lucide-react";

import type { Course, CourseStatus } from "../types/database";

export const COURSE_STATUS_CONFIG = {
  preparing: {
    label: "준비",
    Icon: CircleDashed,
    badgeClassName: "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200",
    surfaceClassName: "border-amber-200 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/35",
    eventClassName: "border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100",
  },
  confirmed: {
    label: "확정",
    Icon: CircleCheckBig,
    badgeClassName: "border-sky-300 bg-sky-100 text-sky-900 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-200",
    surfaceClassName: "border-sky-200 bg-sky-50/80 dark:border-sky-900 dark:bg-sky-950/35",
    eventClassName: "border-sky-300 bg-sky-100 text-sky-950 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-100",
  },
  ended: {
    label: "종료",
    Icon: Flag,
    badgeClassName: "border-violet-300 bg-violet-100 text-violet-900 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-200",
    surfaceClassName: "border-violet-200 bg-violet-50/80 dark:border-violet-900 dark:bg-violet-950/35",
    eventClassName: "border-violet-300 bg-violet-100 text-violet-950 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-100",
  },
  cancelled: {
    label: "취소",
    Icon: CircleX,
    badgeClassName: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
    surfaceClassName: "border-slate-200 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/45",
    eventClassName: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  },
} satisfies Record<CourseStatus, {
  label: string;
  Icon: typeof CircleDashed;
  badgeClassName: string;
  surfaceClassName: string;
  eventClassName: string;
}>;

export const COURSE_STATUSES = Object.keys(COURSE_STATUS_CONFIG) as CourseStatus[];

export function isOngoingCourse(course: Course) {
  return course.status === "preparing" || course.status === "confirmed";
}

export function sortCoursesByStartDate(courses: Course[]) {
  return [...courses].sort((left, right) => {
    if (!left.webinar_at) return right.webinar_at ? 1 : left.created_at.localeCompare(right.created_at);
    if (!right.webinar_at) return -1;
    return left.webinar_at.localeCompare(right.webinar_at) || left.created_at.localeCompare(right.created_at);
  });
}
