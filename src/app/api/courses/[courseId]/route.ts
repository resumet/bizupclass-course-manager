import { apiError, getAuthenticatedClient, unauthorized } from "@/lib/api/response";
import { courseSchema, validationError } from "@/lib/validation";

type Context = { params: Promise<{ courseId: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const auth = await getAuthenticatedClient();
    if (!auth) return unauthorized();
    const parsed = courseSchema.safeParse(await request.json());
    if (!parsed.success) return validationError(parsed.error);
    const { courseId } = await params;
    const { data, error } = await auth.supabase
      .from("courses")
      .update(parsed.data)
      .eq("id", courseId)
      .select()
      .single();
    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const auth = await getAuthenticatedClient();
    if (!auth) return unauthorized();
    const { courseId } = await params;
    const { error } = await auth.supabase.from("courses").delete().eq("id", courseId);
    if (error) throw error;
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
