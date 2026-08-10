"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Link2, LogOut, Menu, UserRound } from "lucide-react";
import { toast } from "sonner";

import { SidebarContent } from "@/components/layout/sidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { requestJson } from "@/lib/client-api";
import { sortCoursesByStartDate } from "@/lib/course-status";
import type { Course } from "@/types/database";

type Props = { initialCourses: Course[]; userEmail: string; children: React.ReactNode };
type DashboardContextValue = {
  courses: Course[];
  guardNavigation: (action: () => void) => void;
  navigateToCourse: (courseId: string) => void;
  prefetchCourse: (courseId: string) => void;
  onCourseUpdated: (course: Course) => void;
  onDirtyChange: (dirty: boolean) => void;
  registerSave: (handler: () => Promise<boolean>) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within DashboardShell");
  return context;
}

export function DashboardShell({ initialCourses, userEmail, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [courses, setCourses] = useState(initialCourses);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);
  const saveHandler = useRef<(() => Promise<boolean>) | null>(null);
  const sortedCourses = useMemo(() => sortCoursesByStartDate(courses), [courses]);
  const activeCourseId = pathname.match(/^\/dashboard\/courses\/([^/]+)$/)?.[1];
  const dashboardActive = pathname === "/dashboard";
  const linksActive = pathname === "/dashboard/links";

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

  const prefetchCourse = useCallback((courseId: string) => {
    router.prefetch(`/dashboard/courses/${courseId}`);
  }, [router]);

  const navigateToDashboard = useCallback(() => {
    setMobileOpen(false);
    guardNavigation(() => router.push("/dashboard"));
  }, [guardNavigation, router]);

  const navigateToLinks = useCallback(() => {
    setMobileOpen(false);
    guardNavigation(() => router.push("/dashboard/links"));
  }, [guardNavigation, router]);

  const handleCreated = useCallback((course: Course) => {
    setCourses((current) => [course, ...current]);
    guardNavigation(() => router.push(`/dashboard/courses/${course.id}`));
  }, [guardNavigation, router]);

  const handleUpdated = useCallback((course: Course) => {
    setCourses((current) => current.map((item) => item.id === course.id ? course : item));
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await requestJson<void>(`/api/courses/${deleteTarget.id}`, { method: "DELETE" });
      const remaining = courses.filter((course) => course.id !== deleteTarget.id);
      setCourses(remaining);
      setDeleteTarget(null);
      toast.success("강의와 연결된 정보가 삭제되었습니다.");
      if (activeCourseId === deleteTarget.id) {
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
    courses: sortedCourses,
    activeCourseId,
    dashboardActive,
    onDashboard: navigateToDashboard,
    onSelect: navigateToCourse,
    onPrefetch: prefetchCourse,
    onCreated: handleCreated,
    onEdit: navigateToCourse,
    onDelete: setDeleteTarget,
  };

  const contextValue = useMemo<DashboardContextValue>(() => ({
    courses: sortedCourses,
    guardNavigation,
    navigateToCourse,
    prefetchCourse,
    onCourseUpdated: handleUpdated,
    onDirtyChange: setDirty,
    registerSave: (handler) => { saveHandler.current = handler; },
  }), [guardNavigation, handleUpdated, navigateToCourse, prefetchCourse, sortedCourses]);

  return (
    <DashboardContext.Provider value={contextValue}>
    <div className="flex min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r md:block"><SidebarContent {...sidebarProps} /></aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[88vw] max-w-72 p-0"><SheetTitle className="sr-only">강의 목록</SheetTitle><SidebarContent {...sidebarProps} /></SheetContent>
      </Sheet>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:pl-72">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="강의 목록 열기"><Menu /></Button>
            <Button asChild variant={linksActive ? "default" : "outline"} size="sm"><Link href="/dashboard/links" onMouseEnter={() => router.prefetch("/dashboard/links")} onFocus={() => router.prefetch("/dashboard/links")} onClick={(event) => { event.preventDefault(); navigateToLinks(); }}><Link2 />강의용 링크</Link></Button>
          </div>
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-muted px-2 py-1.5 text-xs text-muted-foreground" title={userEmail}><UserRound className="size-3.5 shrink-0" /><span className="max-w-28 truncate sm:max-w-52">{userEmail}</span></div>
            <Button variant="ghost" size="sm" onClick={() => guardNavigation(signOut)}><LogOut /><span className="hidden sm:inline">로그아웃</span></Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          {children}
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
    </DashboardContext.Provider>
  );
}
