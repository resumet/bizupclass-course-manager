import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCourses, getCurrentUserEmail } from "@/lib/data";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const [courses, userEmail] = await Promise.all([getCourses(), getCurrentUserEmail()]);
  return <DashboardShell initialCourses={courses} userEmail={userEmail}>{children}</DashboardShell>;
}
