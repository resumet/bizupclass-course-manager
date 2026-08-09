import { cache } from "react";
import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Course, CourseBundle } from "@/types/database";

const getSession = cache(async () => {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return { supabase, user: data.user };
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
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCourseBundle(courseId: string): Promise<CourseBundle | null> {
  const { supabase } = await requireUser();
  const [courseResult, youtubeResult, landingResult, resourcesResult] = await Promise.all([
    supabase.from("courses").select("*").eq("id", courseId).maybeSingle(),
    supabase.from("youtube_appearances").select("*").eq("course_id", courseId).order("sort_order"),
    supabase.from("landing_pages").select("*").eq("course_id", courseId).order("sort_order"),
    supabase.from("shared_resources").select("*").eq("course_id", courseId).order("sort_order"),
  ]);

  const error =
    courseResult.error ?? youtubeResult.error ?? landingResult.error ?? resourcesResult.error;
  if (error) throw error;
  if (!courseResult.data) return null;

  return {
    course: courseResult.data,
    youtube: youtubeResult.data ?? [],
    landingPages: landingResult.data ?? [],
    resources: resourcesResult.data ?? [],
  };
}
