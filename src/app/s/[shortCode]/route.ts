import { createAdminClient } from "@/lib/supabase/admin";
import { decodeLocationHeader } from "@/lib/traffic";

type Context = { params: Promise<{ shortCode: string }> };

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: Context) {
  const { shortCode } = await params;
  if (!/^[A-Za-z0-9]{6}$/.test(shortCode)) {
    return new Response("존재하지 않는 짧은 주소입니다.", { status: 404 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("landing_pages")
      .select("id, original_url")
      .eq("short_code", shortCode)
      .maybeSingle();

    if (error || !data) {
      return new Response("존재하지 않는 짧은 주소입니다.", { status: 404 });
    }

    const referrer = request.headers.get("referer")?.slice(0, 2000) ?? null;
    const userAgent = request.headers.get("user-agent")?.slice(0, 1000) ?? null;
    const countryCode = request.headers.get("x-vercel-ip-country")?.slice(0, 2) ?? null;
    const region = decodeLocationHeader(request.headers.get("x-vercel-ip-country-region"));
    const city = decodeLocationHeader(request.headers.get("x-vercel-ip-city"));

    const { error: clickError } = await supabase.from("short_url_clicks").insert({
      landing_page_id: data.id,
      referrer,
      user_agent: userAgent,
      country_code: countryCode,
      region,
      city,
    });
    if (clickError) console.error("Short URL traffic logging failed", clickError);

    const responseHeaders = new Headers({
      Location: data.original_url,
      "X-Traffic-Recorded": clickError ? "false" : "true",
    });
    if (clickError?.code) responseHeaders.set("X-Traffic-Error-Code", clickError.code);
    return new Response(null, { status: 302, headers: responseHeaders });
  } catch {
    return new Response("짧은 주소 서비스를 사용할 수 없습니다.", { status: 503 });
  }
}
