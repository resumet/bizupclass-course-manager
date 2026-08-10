import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isoToKstDate } from "@/lib/client-api";
import { getCourses, getCurrentUserEmail, getGlobalCourseLinks } from "@/lib/data";

export default async function CourseLinksPage() {
  const [courses, userEmail, links] = await Promise.all([getCourses(), getCurrentUserEmail(), getGlobalCourseLinks()]);
  return <DashboardShell initialCourses={courses} bundle={null} userEmail={userEmail} todayKst={isoToKstDate(new Date().toISOString())} view="links" initialLinks={links} />;
}
