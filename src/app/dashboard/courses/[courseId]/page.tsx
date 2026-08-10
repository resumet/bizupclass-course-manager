import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isoToKstDate } from "@/lib/client-api";
import { getCourseBundle, getCourses, getCurrentUserEmail } from "@/lib/data";

type Props = { params: Promise<{ courseId: string }> };

export default async function CoursePage({ params }: Props) {
  const { courseId } = await params;
  const [courses, bundle, userEmail] = await Promise.all([getCourses(), getCourseBundle(courseId), getCurrentUserEmail()]);
  if (!bundle) notFound();
  return <DashboardShell initialCourses={courses} bundle={bundle} userEmail={userEmail} todayKst={isoToKstDate(new Date().toISOString())} view="course" />;
}
