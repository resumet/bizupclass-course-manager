import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCourses } from "@/lib/data";

export default async function DashboardPage() {
  const courses = await getCourses();
  return <DashboardShell initialCourses={courses} bundle={null} />;
}
