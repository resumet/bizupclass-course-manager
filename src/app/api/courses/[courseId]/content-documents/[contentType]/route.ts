import { apiError, getAuthenticatedClient, unauthorized } from "@/lib/api/response";
import { courseContentDocumentSchema, validationError } from "@/lib/validation";
import type { CourseContentType } from "@/types/database";

type Context = {
  params: Promise<{ courseId: string; contentType: string }>;
};

const CONTENT_TYPES: CourseContentType[] = ["instagram_dm", "contract_template"];

function isContentType(value: string): value is CourseContentType {
  return CONTENT_TYPES.includes(value as CourseContentType);
}

function invalidContentType() {
  return Response.json({ error: "지원하지 않는 콘텐츠 유형입니다." }, { status: 404 });
}

export async function GET(_request: Request, { params }: Context) {
  try {
    const auth = await getAuthenticatedClient();
    if (!auth) return unauthorized();
    const { courseId, contentType } = await params;
    if (!isContentType(contentType)) return invalidContentType();

    const { data, error } = await auth.supabase
      .from("course_content_documents")
      .select("*")
      .eq("course_id", courseId)
      .eq("content_type", contentType)
      .maybeSingle();
    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const auth = await getAuthenticatedClient();
    if (!auth) return unauthorized();
    const { courseId, contentType } = await params;
    if (!isContentType(contentType)) return invalidContentType();

    const parsed = courseContentDocumentSchema.safeParse(await request.json());
    if (!parsed.success) return validationError(parsed.error);

    const { data, error } = await auth.supabase
      .from("course_content_documents")
      .upsert(
        { course_id: courseId, content_type: contentType, content: parsed.data.content },
        { onConflict: "course_id,content_type" },
      )
      .select()
      .single();
    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    return apiError(error);
  }
}
