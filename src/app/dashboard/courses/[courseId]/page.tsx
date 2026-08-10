import { notFound } from "next/navigation";

import { CourseDetail } from "@/components/dashboard/course-detail";
import { getCourse } from "@/lib/data";

type Props = { params: Promise<{ courseId: string }> };

export default async function CoursePage({ params }: Props) {
  const { courseId } = await params;
  const course = await getCourse(courseId);
  if (!course) notFound();
  return <CourseDetail course={course} />;
}
