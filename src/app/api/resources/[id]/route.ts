import { apiError, getAuthenticatedClient, unauthorized } from "@/lib/api/response";
import { sharedResourceSchema, validationError } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const auth = await getAuthenticatedClient();
    if (!auth) return unauthorized();
    const parsed = sharedResourceSchema.safeParse(await request.json());
    if (!parsed.success) return validationError(parsed.error);
    const { id } = await params;
    const { data, error } = await auth.supabase
      .from("shared_resources")
      .update(parsed.data)
      .eq("id", id)
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
    const { id } = await params;
    const { error } = await auth.supabase.from("shared_resources").delete().eq("id", id);
    if (error) throw error;
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
