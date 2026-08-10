"use client";

import Link from "next/link";
import { BookOpenCheck, LayoutDashboard, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { CourseCreateDialog } from "@/components/courses/course-create-dialog";
import { CourseStatusBadge } from "@/components/courses/course-status-badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatKoreanLiveSchedule } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/database";

type Props = {
  courses: Course[];
  activeCourseId?: string;
  dashboardActive: boolean;
  onDashboard: () => void;
  onSelect: (courseId: string) => void;
  onPrefetch: (courseId: string) => void;
  onCreated: (course: Course) => void;
  onEdit: (courseId: string) => void;
  onDelete: (course: Course) => void;
};

export function SidebarContent({ courses, activeCourseId, dashboardActive, onDashboard, onSelect, onPrefetch, onCreated, onEdit, onDelete }: Props) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><BookOpenCheck className="size-4" /></div>
        <div>
          <p className="text-sm font-semibold">강의 운영 관리</p>
          <p className="text-xs text-muted-foreground">Course workspace</p>
        </div>
      </div>
      <div className="p-4"><CourseCreateDialog onCreated={onCreated} /></div>
      <div className="px-2 pb-4">
        <Button asChild variant="ghost" className={cn("w-full justify-start", dashboardActive && "bg-sidebar-accent font-semibold text-sidebar-accent-foreground")}><Link href="/dashboard" onClick={(event) => { event.preventDefault(); onDashboard(); }}><LayoutDashboard />대시보드</Link></Button>
      </div>
      <div className="flex items-center justify-between px-4 pb-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">전체 강의</p>
        <span className="text-xs tabular-nums text-muted-foreground">{courses.length}</span>
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-4" aria-label="강의 목록">
        {courses.length === 0 ? (
          <div className="mx-2 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">아직 등록된 강의가 없습니다.</div>
        ) : courses.map((course) => {
          const liveSchedule = formatKoreanLiveSchedule(course.webinar_at);
          return (
            <div key={course.id} className={cn("group flex items-center rounded-lg", activeCourseId === course.id && "bg-sidebar-accent text-sidebar-accent-foreground")}>
              <Link href={`/dashboard/courses/${course.id}`} className="flex min-w-0 flex-1 items-start gap-2 px-3 py-2.5 text-left" onMouseEnter={() => onPrefetch(course.id)} onFocus={() => onPrefetch(course.id)} onClick={(event) => { event.preventDefault(); onSelect(course.id); }}>
                <CourseStatusBadge status={course.status} iconOnly className="mt-0.5" />
                <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{course.title}</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {course.instructor_name || "강사 미정"}
                  {liveSchedule ? <span className="text-sidebar-foreground/70"> ({liveSchedule})</span> : null}
                </span>
                </span>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="mr-1 opacity-70 sm:opacity-0 sm:group-hover:opacity-100" aria-label={`${course.title} 관리 메뉴`}><MoreHorizontal /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(course.id)}><Pencil />강의 수정</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(course)}><Trash2 />강의 삭제</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
