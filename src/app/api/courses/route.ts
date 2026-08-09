import { apiError, getAuthenticatedClient, unauthorized } from "@/lib/api/response";
import { courseSchema, validationError } from "@/lib/validation";

export async function GET() {
  try {
    const auth = await getAuthenticatedClient();
    if (!auth) return unauthorized();
    const { data, error } = await auth.supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedClient();
    if (!auth) return unauthorized();
    const parsed = courseSchema.safeParse(await request.json());
    if (!parsed.success) return validationError(parsed.error);
    const { data, error } = await auth.supabase
      .from("courses")
      .insert(parsed.data)
      .select()
      .single();
    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
