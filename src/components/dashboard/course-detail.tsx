"use client";

import { CourseWorkspace } from "@/components/courses/course-workspace";
import { useDashboard } from "@/components/dashboard/dashboard-shell";
import type { Course } from "@/types/database";

export function CourseDetail({ course }: { course: Course }) {
  const { guardNavigation, onCourseUpdated, onDirtyChange, registerSave } = useDashboard();
  return <CourseWorkspace course={course} guardNavigation={guardNavigation} onCourseUpdated={onCourseUpdated} onDirtyChange={onDirtyChange} registerSave={registerSave} />;
}
