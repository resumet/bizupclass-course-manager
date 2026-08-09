import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCourseBundle, getCourses } from "@/lib/data";

type Props = { params: Promise<{ courseId: string }> };

export default async function CoursePage({ params }: Props) {
  const { courseId } = await params;
  const [courses, bundle] = await Promise.all([getCourses(), getCourseBundle(courseId)]);
  if (!bundle) notFound();
  return <DashboardShell initialCourses={courses} bundle={bundle} />;
}
