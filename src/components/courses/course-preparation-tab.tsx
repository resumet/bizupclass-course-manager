"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Camera, Check, CheckCircle2, CircleHelp, LoaderCircle, Plus, Save, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { nullable, requestJson } from "@/lib/client-api";
import { getPreparationSummary, getTaskForecast, PREPARATION_CATEGORIES, PREPARATION_CATEGORY_LABELS, type TaskForecast } from "@/lib/course-preparation";
import { cn } from "@/lib/utils";
import type { CoursePreparationTask, PreparationCategory, PreparationStatus } from "@/types/database";

type SaveHandler = () => Promise<boolean>;
type Props = {
  courseId: string;
  initialItems: CoursePreparationTask[];
  onDirtyChange: (dirty: boolean) => void;
  registerSave: (handler: SaveHandler) => void;
  onDataSaved: () => void;
};
type TaskDraft = CoursePreparationTask & { isNew?: boolean };

const STATUS_OPTIONS: { value: PreparationStatus; label: string }[] = [
  { value: "not_started", label: "미시작" },
  { value: "in_progress", label: "진행 중" },
  { value: "completed", label: "완료" },
  { value: "blocked", label: "막힘" },
];

const FORECAST_CONFIG: Record<TaskForecast, { label: string; description: string; className: string; Icon: typeof CheckCircle2 }> = {
  completed: { label: "달성 완료", description: "모든 준비를 마쳤습니다.", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", Icon: CheckCircle2 },
  achievable: { label: "달성 가능", description: "현재 속도면 일정 내 완료할 수 있습니다.", className: "bg-blue-500/10 text-blue-700 dark:text-blue-300", Icon: TrendingUp },
  at_risk: { label: "주의 필요", description: "지연 또는 막힌 항목을 우선 확인하세요.", className: "bg-amber-500/10 text-amber-700 dark:text-amber-300", Icon: AlertTriangle },
  unknown: { label: "판단 대기", description: "마감일을 입력하면 달성 가능성을 계산합니다.", className: "bg-muted text-muted-foreground", Icon: CircleHelp },
};

function emptyTask(courseId: string, order: number): TaskDraft {
  return {
    id: `new-${crypto.randomUUID()}`,
    course_id: courseId,
    category: "other",
    title: "",
    status: "not_started",
    progress_percent: 0,
    start_date: null,
    due_date: null,
    notes: null,
    sort_order: order,
    created_at: "",
    updated_at: "",
    isNew: true,
  };
}

export function CoursePreparationTab({ courseId, initialItems, onDirtyChange, registerSave, onDataSaved }: Props) {
  const [items, setItems] = useState<TaskDraft[]>(initialItems);
  const [saved, setSaved] = useState<TaskDraft[]>(initialItems);
  const [deleted, setDeleted] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const dirty = deleted.length > 0 || JSON.stringify(items) !== JSON.stringify(saved);
  const summary = useMemo(() => getPreparationSummary(items), [items]);
  const summaryForecast = FORECAST_CONFIG[summary.forecast];
  const completedCount = items.filter((item) => item.status === "completed" || item.progress_percent === 100).length;

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const save = useCallback(async () => {
    const invalidTitle = items.find((item) => !item.title.trim());
    if (invalidTitle) {
      toast.error("모든 준비 항목의 이름을 입력해 주세요.");
      return false;
    }
    const invalidDate = items.find((item) => item.start_date && item.due_date && item.start_date > item.due_date);
    if (invalidDate) {
      toast.error("마감일은 시작일보다 빠를 수 없습니다.");
      return false;
    }

    setPending(true);
    try {
      const savedRows: CoursePreparationTask[] = [];
      for (const [index, item] of items.entries()) {
        const payload = {
          category: item.category,
          title: item.title,
          status: item.status,
          progress_percent: item.progress_percent,
          start_date: item.start_date,
          due_date: item.due_date,
          notes: item.notes,
          sort_order: index,
        };
        const row = await requestJson<CoursePreparationTask>(
          item.isNew ? `/api/courses/${courseId}/preparation-tasks` : `/api/preparation-tasks/${item.id}`,
          { method: item.isNew ? "POST" : "PATCH", body: JSON.stringify(payload) },
        );
        savedRows.push(row);
      }
      for (const id of deleted) await requestJson<void>(`/api/preparation-tasks/${id}`, { method: "DELETE" });
      setItems(savedRows);
      setSaved(savedRows);
      setDeleted([]);
      onDataSaved();
      toast.success("강의 준비 현황이 저장되었습니다.");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "준비 현황을 저장하지 못했습니다.");
      return false;
    } finally {
      setPending(false);
    }
  }, [courseId, deleted, items, onDataSaved]);

  useEffect(() => registerSave(save), [registerSave, save]);

  function updateItem(id: string, changes: Partial<TaskDraft>) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  }

  function changeProgress(item: TaskDraft, value: number) {
    const progress = Math.min(100, Math.max(0, value));
    const status = progress === 100
      ? "completed"
      : item.status === "completed" || (item.status === "not_started" && progress > 0)
        ? "in_progress"
        : item.status;
    updateItem(item.id, { progress_percent: progress, status });
  }

  function changeStatus(item: TaskDraft, status: PreparationStatus) {
    updateItem(item.id, {
      status,
      progress_percent: status === "completed" ? 100 : Math.min(item.progress_percent, 95),
    });
  }

  function removeItem(item: TaskDraft) {
    setItems((current) => current.filter((row) => row.id !== item.id));
    if (!item.isNew) setDeleted((current) => [...current, item.id]);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr_1fr]">
        <Card className="bg-primary text-primary-foreground ring-primary/20">
          <CardHeader>
            <CardDescription className="text-primary-foreground/70">전체 진행 정도</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">{summary.progress}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 overflow-hidden rounded-full bg-primary-foreground/20" role="progressbar" aria-label="전체 준비 진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.progress}>
              <div className="h-full rounded-full bg-primary-foreground transition-[width]" style={{ width: `${summary.progress}%` }} />
            </div>
            <p className="mt-3 text-xs text-primary-foreground/75">완료 {completedCount}개 · 전체 {items.length}개</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>종합 달성 가능성</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl"><summaryForecast.Icon className="size-5" />{summaryForecast.label}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs leading-5 text-muted-foreground">{summaryForecast.description}</p></CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>인스타그램 운영</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl"><Camera className="size-5" />{
              items.find((item) => item.category === "instagram")?.progress_percent ?? 0
            }%</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs leading-5 text-muted-foreground">강사 계정의 콘텐츠 준비와 운영 진척도를 포함합니다.</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>강의 준비 현황</CardTitle>
            <CardDescription className="mt-1.5">시작일과 마감일을 기준으로 실제 진행률이 일정에 맞는지 자동 판단합니다.</CardDescription>
          </div>
          <Button onClick={() => setItems((current) => [...current, emptyTask(courseId, current.length)])}><Plus />항목 추가</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">준비 항목을 추가해 전체 진행 정도를 확인하세요.</div>
          ) : items.map((item) => {
            const forecast = FORECAST_CONFIG[getTaskForecast(item)];
            return (
              <div key={item.id} className={cn("rounded-xl border p-4 transition-colors", item.category === "instagram" && "border-pink-300/70 bg-pink-500/[0.03] dark:border-pink-800")}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <Select value={item.category} onValueChange={(category) => updateItem(item.id, { category: category as PreparationCategory })}>
                    <SelectTrigger className="w-full sm:w-36" aria-label="준비 분야"><SelectValue /></SelectTrigger>
                    <SelectContent>{PREPARATION_CATEGORIES.map((category) => <SelectItem key={category} value={category}>{PREPARATION_CATEGORY_LABELS[category]}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input className="flex-1 font-medium" aria-label="준비 항목명" placeholder="준비 항목명" value={item.title} onChange={(event) => updateItem(item.id, { title: event.target.value })} />
                  <Badge variant="outline" className={cn("h-9 px-3", forecast.className)}><forecast.Icon />{forecast.label}</Badge>
                  <Button variant="ghost" size="icon" aria-label={`${item.title || "준비 항목"} 삭제`} onClick={() => removeItem(item)}><Trash2 /></Button>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor={`status-${item.id}`}>상태</Label>
                    <Select value={item.status} onValueChange={(status) => changeStatus(item, status as PreparationStatus)}>
                      <SelectTrigger id={`status-${item.id}`} className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUS_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`progress-${item.id}`}>진행률 (%)</Label>
                    <Input id={`progress-${item.id}`} type="number" min="0" max="100" step="5" value={item.progress_percent} onChange={(event) => changeProgress(item, Number(event.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`start-${item.id}`}>시작일</Label>
                    <Input id={`start-${item.id}`} type="date" value={item.start_date ?? ""} onChange={(event) => updateItem(item.id, { start_date: nullable(event.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`due-${item.id}`}>마감일</Label>
                    <Input id={`due-${item.id}`} type="date" value={item.due_date ?? ""} onChange={(event) => updateItem(item.id, { due_date: nullable(event.target.value) })} />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor={`notes-${item.id}`}>메모</Label>
                  <Textarea id={`notes-${item.id}`} placeholder={item.category === "instagram" ? "예: 릴스 주 3회, 스토리 매일 업로드, 프로필 링크 점검" : "진행 내용이나 다음 할 일을 기록하세요."} value={item.notes ?? ""} onChange={(event) => updateItem(item.id, { notes: nullable(event.target.value) })} />
                </div>
              </div>
            );
          })}

          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-card/95 py-4 backdrop-blur">
            {dirty ? <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700"><span className="size-1.5 rounded-full bg-amber-500" />변경사항 있음</span> : <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="size-3.5" />저장됨</span>}
            <Button onClick={() => void save()} disabled={!dirty || pending}>
              {pending ? <LoaderCircle className="animate-spin" /> : <Save />}
              {pending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
