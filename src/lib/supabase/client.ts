import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase 연결 정보가 설정되지 않았습니다.");
  }

  browserClient ??= createBrowserClient<Database>(url, anonKey);
  return browserClient;
}
