import { createAdminClient } from "@/lib/supabase/admin";

type Context = { params: Promise<{ shortCode: string }> };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: Context) {
  const { shortCode } = await params;
  if (!/^[A-Za-z0-9]{6}$/.test(shortCode)) {
    return new Response("존재하지 않는 짧은 주소입니다.", { status: 404 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("landing_pages")
      .select("original_url")
      .eq("short_code", shortCode)
      .maybeSingle();

    if (error || !data) {
      return new Response("존재하지 않는 짧은 주소입니다.", { status: 404 });
    }

    return Response.redirect(data.original_url, 302);
  } catch {
    return new Response("짧은 주소 서비스를 사용할 수 없습니다.", { status: 503 });
  }
}
