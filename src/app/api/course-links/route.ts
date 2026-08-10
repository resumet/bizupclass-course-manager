import { apiError, getAuthenticatedClient, unauthorized } from "@/lib/api/response";
import { globalCourseLinkSchema, validationError } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedClient();
    if (!auth) return unauthorized();
    const parsed = globalCourseLinkSchema.safeParse(await request.json());
    if (!parsed.success) return validationError(parsed.error);
    const { data, error } = await auth.supabase
      .from("global_course_links")
      .insert(parsed.data)
      .select()
      .single();
    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
