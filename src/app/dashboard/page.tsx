import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isoToKstDate } from "@/lib/client-api";
import { getCourses, getCurrentUserEmail } from "@/lib/data";

export default async function DashboardPage() {
  const [courses, userEmail] = await Promise.all([getCourses(), getCurrentUserEmail()]);
  return <DashboardShell initialCourses={courses} bundle={null} userEmail={userEmail} todayKst={isoToKstDate(new Date().toISOString())} view="dashboard" />;
}
