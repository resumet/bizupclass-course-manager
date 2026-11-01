import type { CoursePreparationTask, PreparationCategory } from "@/types/database";

export type TaskForecast = "completed" | "achievable" | "at_risk" | "unknown";

export const PREPARATION_CATEGORIES: PreparationCategory[] = [
  "planning",
  "instagram",
  "youtube",
  "landing",
  "materials",
  "other",
];

export const PREPARATION_CATEGORY_LABELS: Record<PreparationCategory, string> = {
  planning: "기획",
  instagram: "인스타그램",
  youtube: "유튜브",
  landing: "랜딩페이지",
  materials: "강의자료",
  other: "기타",
};

const DAY_MS = 24 * 60 * 60 * 1000;

function dateOnlyMs(value: string) {
  return Date.parse(`${value}T00:00:00Z`);
}

export function getKoreanDateKey(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function getTaskForecast(
  task: Pick<CoursePreparationTask, "status" | "progress_percent" | "start_date" | "due_date">,
  today = getKoreanDateKey(),
): TaskForecast {
  if (task.status === "completed" || task.progress_percent >= 100) return "completed";
  if (task.status === "blocked") return "at_risk";
  if (!task.due_date) return "unknown";

  const todayMs = dateOnlyMs(today);
  const dueMs = dateOnlyMs(task.due_date);
  if (dueMs < todayMs) return "at_risk";
  if (!task.start_date) return "achievable";

  const startMs = dateOnlyMs(task.start_date);
  if (todayMs <= startMs) return "achievable";
  const duration = Math.max(DAY_MS, dueMs - startMs);
  const elapsed = Math.min(duration, todayMs - startMs);
  const expectedProgress = Math.round((elapsed / duration) * 100);
  return task.progress_percent + 10 >= expectedProgress ? "achievable" : "at_risk";
}

export function getPreparationSummary(
  tasks: Pick<CoursePreparationTask, "status" | "progress_percent" | "start_date" | "due_date">[],
  today = getKoreanDateKey(),
) {
  if (tasks.length === 0) return { progress: 0, forecast: "unknown" as TaskForecast };
  const progress = Math.round(tasks.reduce((sum, task) => sum + task.progress_percent, 0) / tasks.length);
  const forecasts = tasks.map((task) => getTaskForecast(task, today));
  const forecast: TaskForecast = forecasts.every((value) => value === "completed")
    ? "completed"
    : forecasts.includes("at_risk")
      ? "at_risk"
      : forecasts.includes("unknown")
        ? "unknown"
        : "achievable";
  return { progress, forecast };
}
