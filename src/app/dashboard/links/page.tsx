import { CourseLinksManager } from "@/components/dashboard/course-links-manager";
import { getGlobalCourseLinks } from "@/lib/data";

export default async function CourseLinksPage() {
  const links = await getGlobalCourseLinks();
  return <CourseLinksManager initialLinks={links} />;
}
