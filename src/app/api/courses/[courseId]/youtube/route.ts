import { apiError, getAuthenticatedClient, unauthorized } from "@/lib/api/response";
import { validationError, youtubeSchema } from "@/lib/validation";

type Context = { params: Promise<{ courseId: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const auth = await getAuthenticatedClient();
    if (!auth) return unauthorized();
    const { courseId } = await params;
    const { data, error } = await auth.supabase
      .from("youtube_appearances")
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
    const parsed = youtubeSchema.safeParse(await request.json());
    if (!parsed.success) return validationError(parsed.error);
    const { courseId } = await params;
    const { data, error } = await auth.supabase
      .from("youtube_appearances")
      .insert({ ...parsed.data, course_id: courseId })
      .select()
      .single();
    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
