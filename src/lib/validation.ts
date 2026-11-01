import { z } from "zod";

const optionalText = z.string().trim().nullable().optional();
const optionalDate = z.iso.datetime({ offset: true }).nullable().optional();
const httpUrl = z.url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol), "HTTP 또는 HTTPS 주소만 입력할 수 있습니다.");
const optionalUrl = z.union([z.literal(""), httpUrl]).nullable().optional();

export const courseSchema = z.object({
  title: z.string().trim().min(1, "강의명을 입력해 주세요."),
  instructor_name: optionalText,
  webinar_at: optionalDate,
  opening_at: optionalDate,
  status: z.enum(["preparing", "confirmed", "ended", "cancelled"]).default("preparing"),
});

export const coursePreparationTaskSchema = z.object({
  category: z.enum(["planning", "instagram", "youtube", "landing", "materials", "other"]).default("other"),
  title: z.string().trim().min(1, "준비 항목명을 입력해 주세요."),
  status: z.enum(["not_started", "in_progress", "completed", "blocked"]).default("not_started"),
  progress_percent: z.coerce.number().int().min(0).max(100).default(0),
  start_date: z.iso.date().nullable().optional(),
  due_date: z.iso.date().nullable().optional(),
  notes: optionalText,
  sort_order: z.coerce.number().int().min(0).default(0),
}).refine(
  ({ start_date, due_date }) => !start_date || !due_date || start_date <= due_date,
  { message: "마감일은 시작일보다 빠를 수 없습니다.", path: ["due_date"] },
);

export const youtubeSchema = z.object({
  channel_name: z.string().trim().min(1, "채널 이름을 입력해 주세요."),
  appearance_fee: z.coerce.number().int().min(0).default(0),
  revenue_share: z.coerce.number().min(0).max(100).nullable().optional(),
  contact_name: optionalText,
  contact_phone: optionalText,
  filming_at: optionalDate,
  youtube_url: optionalUrl,
  sort_order: z.coerce.number().int().min(0).default(0),
});

export const landingPageSchema = z.object({
  name: z.string().trim().min(1, "랜딩페이지 이름을 입력해 주세요."),
  original_url: httpUrl,
  sort_order: z.coerce.number().int().min(0).default(0),
});

export const sharedResourceSchema = z.object({
  name: z.string().trim().min(1, "자료명을 입력해 주세요."),
  resource_type: optionalText,
  url: httpUrl,
  sort_order: z.coerce.number().int().min(0).default(0),
});

export const globalCourseLinkSchema = z.object({
  title: z.string().trim().min(1, "링크 이름을 입력해 주세요."),
  url: httpUrl,
  description: optionalText,
  sort_order: z.coerce.number().int().min(0).default(0),
});

export function validationError(error: z.ZodError) {
  return Response.json(
    { error: error.issues[0]?.message ?? "입력값을 확인해 주세요." },
    { status: 400 },
  );
}
