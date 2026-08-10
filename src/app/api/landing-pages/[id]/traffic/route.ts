import { apiError, getAuthenticatedClient, unauthorized } from "@/lib/api/response";
import { getTrafficPeriodStarts } from "@/lib/traffic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const auth = await getAuthenticatedClient();
    if (!auth) return unauthorized();

    const { id } = await params;
    const { today, thisWeek } = getTrafficPeriodStarts();
    const baseCount = () =>
      auth.supabase
        .from("short_url_clicks")
        .select("id", { count: "exact", head: true })
        .eq("landing_page_id", id);

    const [totalResult, todayResult, weekResult, recentResult] = await Promise.all([
      baseCount(),
      baseCount().gte("clicked_at", today),
      baseCount().gte("clicked_at", thisWeek),
      auth.supabase
        .from("short_url_clicks")
        .select("*")
        .eq("landing_page_id", id)
        .order("clicked_at", { ascending: false })
        .limit(100),
    ]);

    const error =
      totalResult.error ?? todayResult.error ?? weekResult.error ?? recentResult.error;
    if (error) throw error;

    return Response.json({
      total: totalResult.count ?? 0,
      today: todayResult.count ?? 0,
      thisWeek: weekResult.count ?? 0,
      recent: recentResult.data ?? [],
    });
  } catch (error) {
    return apiError(error, "유입 통계를 불러오지 못했습니다.");
  }
}
