"use client";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { useDashboard } from "@/components/dashboard/dashboard-shell";

export function DashboardHome({ todayKst }: { todayKst: string }) {
  const { courses, navigateToCourse, prefetchCourse } = useDashboard();
  return <DashboardOverview courses={courses} todayKst={todayKst} onSelectCourse={navigateToCourse} onPrefetchCourse={prefetchCourse} />;
}
