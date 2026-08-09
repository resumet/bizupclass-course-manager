"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { toast } from "sonner";

import { CourseWorkspace } from "@/components/courses/course-workspace";
import { SidebarContent } from "@/components/layout/sidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { requestJson } from "@/lib/client-api";
import type { Course, CourseBundle } from "@/types/database";

type Props = { initialCourses: Course[]; bundle: CourseBundle | null };

export function DashboardShell({ initialCourses, bundle }: Props) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);
  const saveHandler = useRef<(() => Promise<boolean>) | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const guardNavigation = useCallback((action: () => void) => {
    if (!dirty) return action();
    pendingAction.current = action;
    setWarningOpen(true);
  }, [dirty]);

  const navigateToCourse = useCallback((courseId: string) => {
    setMobileOpen(false);
    guardNavigation(() => router.push(`/dashboard/courses/${courseId}`));
  }, [guardNavigation, router]);

  function handleCreated(course: Course) {
    setCourses((current) => [course, ...current]);
    guardNavigation(() => router.push(`/dashboard/courses/${course.id}`));
  }

  function handleUpdated(course: Course) {
    setCourses((current) => current.map((item) => item.id === course.id ? course : item));
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await requestJson<void>(`/api/courses/${deleteTarget.id}`, { method: "DELETE" });
      const remaining = courses.filter((course) => course.id !== deleteTarget.id);
      setCourses(remaining);
      setDeleteTarget(null);
      toast.success("강의와 연결된 정보가 삭제되었습니다.");
      if (bundle?.course.id === deleteTarget.id) {
        setDirty(false);
        router.push(remaining[0] ? `/dashboard/courses/${remaining[0].id}` : "/dashboard");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "강의를 삭제하지 못했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const sidebarProps = {
    courses,
    activeCourseId: bundle?.course.id,
    onSelect: navigateToCourse,
    onCreated: handleCreated,
    onEdit: navigateToCourse,
    onDelete: setDeleteTarget,
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r md:block"><SidebarContent {...sidebarProps} /></aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[88vw] max-w-72 p-0"><SheetTitle className="sr-only">강의 목록</SheetTitle><SidebarContent {...sidebarProps} /></SheetContent>
      </Sheet>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:pl-72">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="강의 목록 열기"><Menu /></Button>
            <div>
              <p className="text-sm font-semibold">{bundle?.course.title ?? "강의 대시보드"}</p>
              <p className="hidden text-xs text-muted-foreground sm:block">강의 운영 정보를 한곳에서 관리하세요.</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => guardNavigation(signOut)}><LogOut />로그아웃</Button>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <CourseWorkspace key={bundle?.course.id ?? "empty"} bundle={bundle} onDirtyChange={setDirty} registerSave={(handler) => { saveHandler.current = handler; }} guardNavigation={guardNavigation} onCourseUpdated={handleUpdated} />
        </main>
      </div>

      <AlertDialog open={warningOpen} onOpenChange={setWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>저장되지 않은 변경사항이 있습니다.</AlertDialogTitle>
            <AlertDialogDescription>변경사항을 저장하지 않고 이동하시겠습니까?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-row sm:justify-end">
            <AlertDialogCancel>취소</AlertDialogCancel>
            <Button variant="outline" onClick={() => { setWarningOpen(false); setDirty(false); pendingAction.current?.(); pendingAction.current = null; }}>저장하지 않고 이동</Button>
            <AlertDialogAction onClick={async (event) => {
              event.preventDefault();
              const saved = await saveHandler.current?.();
              if (saved) {
                setWarningOpen(false);
                setDirty(false);
                pendingAction.current?.();
                pendingAction.current = null;
              }
            }}>저장 후 이동</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이 강의를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>강의에 등록된 유튜브, 랜딩페이지, 자료 공유 정보도 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>취소</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={deleting} onClick={(event) => { event.preventDefault(); void handleDelete(); }}>{deleting ? "삭제 중..." : "강의 삭제"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
