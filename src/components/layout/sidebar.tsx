"use client";

import { BookOpenCheck, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { CourseCreateDialog } from "@/components/courses/course-create-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/database";

type Props = {
  courses: Course[];
  activeCourseId?: string;
  onSelect: (courseId: string) => void;
  onCreated: (course: Course) => void;
  onEdit: (courseId: string) => void;
  onDelete: (course: Course) => void;
};

export function SidebarContent({ courses, activeCourseId, onSelect, onCreated, onEdit, onDelete }: Props) {
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
      <div className="flex items-center justify-between px-4 pb-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">전체 강의</p>
        <span className="text-xs tabular-nums text-muted-foreground">{courses.length}</span>
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-4" aria-label="강의 목록">
        {courses.length === 0 ? (
          <div className="mx-2 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">아직 등록된 강의가 없습니다.</div>
        ) : courses.map((course) => (
          <div key={course.id} className={cn("group flex items-center rounded-lg", activeCourseId === course.id && "bg-sidebar-accent text-sidebar-accent-foreground")}>
            <button type="button" className="min-w-0 flex-1 px-3 py-2.5 text-left" onClick={() => onSelect(course.id)}>
              <span className="block truncate text-sm font-medium">{course.title}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{course.instructor_name || "강사 미정"}</span>
            </button>
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
        ))}
      </nav>
    </div>
  );
}
