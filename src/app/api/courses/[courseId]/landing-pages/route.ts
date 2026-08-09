import { apiError, getAuthenticatedClient, unauthorized } from "@/lib/api/response";
import { generateShortCode } from "@/lib/short-code";
import { landingPageSchema, validationError } from "@/lib/validation";

type Context = { params: Promise<{ courseId: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const auth = await getAuthenticatedClient();
    if (!auth) return unauthorized();
    const { courseId } = await params;
    const { data, error } = await auth.supabase
      .from("landing_pages")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order");
    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, { params }: Context) {
  try {
    const auth = await getAuthenticatedClient();
    if (!auth) return unauthorized();
    const parsed = landingPageSchema.safeParse(await request.json());
    if (!parsed.success) return validationError(parsed.error);
    const { courseId } = await params;

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const { data, error } = await auth.supabase
        .from("landing_pages")
        .insert({ ...parsed.data, course_id: courseId, short_code: generateShortCode() })
        .select()
        .single();
      if (!error) return Response.json(data, { status: 201 });
      if (error.code !== "23505") throw error;
    }

    return Response.json(
      { error: "짧은 주소 생성에 실패했습니다. 다시 시도해 주세요." },
      { status: 503 },
    );
  } catch (error) {
    return apiError(error);
  }
}
