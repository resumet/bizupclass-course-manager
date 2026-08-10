import { createClient } from "@/lib/supabase/server";

export function apiError(error: unknown, fallback = "요청을 처리하지 못했습니다.") {
  const message = error instanceof Error ? error.message : fallback;
  return Response.json({ error: message }, { status: 500 });
}

export async function getAuthenticatedClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return { supabase, claims: data.claims };
}

export function unauthorized() {
  return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
}
