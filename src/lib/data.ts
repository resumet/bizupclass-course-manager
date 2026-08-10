import { cache } from "react";
import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Course, GlobalCourseLink } from "@/types/database";

const getSession = cache(async () => {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return { supabase, claims: data.claims };
});

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect(hasSupabaseEnv() ? "/login" : "/login?setup=1");
  return session;
}

export async function getCourses(): Promise<Course[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("webinar_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getCurrentUserEmail(): Promise<string> {
  const { claims } = await requireUser();
  return typeof claims.email === "string" ? claims.email : "로그인 계정";
}

export async function getGlobalCourseLinks(): Promise<GlobalCourseLink[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("global_course_links")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getCourse(courseId: string): Promise<Course | null> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
