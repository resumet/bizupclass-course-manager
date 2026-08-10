"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, UserRound } from "lucide-react";

import { CourseStatusBadge } from "@/components/courses/course-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKoreanLiveSchedule, isoToKstDate } from "@/lib/client-api";
import { COURSE_STATUSES, COURSE_STATUS_CONFIG, isOngoingCourse } from "@/lib/course-status";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/database";

type Props = {
  courses: Course[];
  todayKst: string;
  onSelectCourse: (courseId: string) => void;
  onPrefetchCourse: (courseId: string) => void;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(Date.UTC(year, month, 1));
  const gridStart = new Date(Date.UTC(year, month, 1 - firstDay.getUTCDay()));
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setUTCDate(gridStart.getUTCDate() + index);
    const dateMonth = date.getUTCMonth();
    return {
      key: date.toISOString().slice(0, 10),
      day: date.getUTCDate(),
      inMonth: dateMonth === month,
    };
  });
}

export function DashboardOverview({ courses, todayKst, onSelectCourse, onPrefetchCourse }: Props) {
  const [initialYear, initialMonth] = todayKst.split("-").map(Number);
  const [visibleMonth, setVisibleMonth] = useState(() => ({ year: initialYear, month: initialMonth - 1 }));
  const ongoingCourses = useMemo(() => courses.filter(isOngoingCourse), [courses]);
  const days = useMemo(() => buildCalendarDays(visibleMonth.year, visibleMonth.month), [visibleMonth]);
  const coursesByDay = useMemo(() => {
    const grouped = new Map<string, Course[]>();
    for (const course of ongoingCourses) {
      const key = isoToKstDate(course.webinar_at);
      if (!key) continue;
      grouped.set(key, [...(grouped.get(key) ?? []), course]);
    }
    return grouped;
  }, [ongoingCourses]);

  function changeMonth(offset: number) {
    setVisibleMonth((current) => {
      const next = new Date(Date.UTC(current.year, current.month + offset, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <section aria-labelledby="ongoing-courses-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">현재 진행중</p>
            <h1 id="ongoing-courses-title" className="mt-1 text-2xl font-semibold tracking-tight">강의 현황</h1>
          </div>
          <span className="text-sm tabular-nums text-muted-foreground">{ongoingCourses.length}개</span>
        </div>
        {ongoingCourses.length === 0 ? (
          <Card className="border-dashed"><CardHeader className="items-center py-8 text-center"><CalendarDays className="size-8 text-muted-foreground" /><CardTitle>진행중인 강의가 없습니다</CardTitle><CardDescription>상태가 준비 또는 확정인 강의가 여기에 표시됩니다.</CardDescription></CardHeader></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ongoingCourses.map((course) => {
              const status = COURSE_STATUS_CONFIG[course.status];
              return (
                <Card key={course.id} className={cn("border", status.surfaceClassName)}>
                  <CardHeader>
                    <CardTitle className="pr-2 text-lg">{course.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5"><UserRound className="size-3.5" />{course.instructor_name || "강사 미정"}</CardDescription>
                    <CardAction><CourseStatusBadge status={course.status} /></CardAction>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-sm font-medium"><Clock3 className="size-4" />{formatKoreanLiveSchedule(course.webinar_at) ?? "일정 미정"}</span>
                    <Button asChild size="sm" variant="outline" className="bg-background/70"><Link href={`/dashboard/courses/${course.id}`} onMouseEnter={() => onPrefetchCourse(course.id)} onFocus={() => onPrefetchCourse(course.id)} onClick={(event) => { event.preventDefault(); onSelectCourse(course.id); }}>관리</Link></Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="schedule-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">일정</p>
            <h2 id="schedule-title" className="mt-1 text-2xl font-semibold tracking-tight">강의 캘린더</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2" aria-label="강의 상태 범례">
            {COURSE_STATUSES.map((status) => <CourseStatusBadge key={status} status={status} />)}
          </div>
        </div>
        <Card className="gap-0 py-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Button variant="ghost" size="icon-sm" onClick={() => changeMonth(-1)} aria-label="이전 달"><ChevronLeft /></Button>
            <p className="font-semibold tabular-nums">{visibleMonth.year}년 {visibleMonth.month + 1}월</p>
            <Button variant="ghost" size="icon-sm" onClick={() => changeMonth(1)} aria-label="다음 달"><ChevronRight /></Button>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-7 border-b bg-muted/35">
                {WEEKDAYS.map((weekday, index) => <div key={weekday} className={cn("px-2 py-2 text-center text-xs font-medium text-muted-foreground", index === 0 && "text-rose-600", index === 6 && "text-sky-600")}>{weekday}</div>)}
              </div>
              <div className="grid grid-cols-7">
                {days.map((day, index) => {
                  const scheduled = coursesByDay.get(day.key) ?? [];
                  return (
                    <div key={day.key} className={cn("min-h-28 border-b border-r p-1.5", index % 7 === 6 && "border-r-0", !day.inMonth && "bg-muted/20")}>
                      <span className={cn("inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums", !day.inMonth && "text-muted-foreground/50", day.key === todayKst && "bg-primary font-semibold text-primary-foreground")}>{day.day}</span>
                      <div className="mt-1 space-y-1">
                        {scheduled.map((course) => {
                          const { Icon, eventClassName } = COURSE_STATUS_CONFIG[course.status];
                          return (
                            <Link key={course.id} href={`/dashboard/courses/${course.id}`} className={cn("flex w-full items-center gap-1 rounded-md border px-1.5 py-1 text-left text-[11px] font-medium transition-opacity hover:opacity-75", eventClassName)} onMouseEnter={() => onPrefetchCourse(course.id)} onFocus={() => onPrefetchCourse(course.id)} onClick={(event) => { event.preventDefault(); onSelectCourse(course.id); }} title={`${course.title} · ${formatKoreanLiveSchedule(course.webinar_at)}`}>
                              <Icon className="size-3 shrink-0" /><span className="truncate">{course.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
