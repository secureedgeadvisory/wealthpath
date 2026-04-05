// ─── Real Supabase Client (Ready to Swap) ───
// Replace mock imports with these when connecting real Supabase.
// Each function mirrors the mock version — one-line import change.

import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Goal, WealthPath, DailyTask, Streak, Milestone, JourneySnapshot, DailyBriefing } from "@/types";

// ─── Browser Client (Client Components) ───
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── Server Client (Server Components + API Routes) ───
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch { /* Server Component — ignored */ }
        },
      },
    }
  );
}

// ─── Helper Functions (Mirror mock versions) ───

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserGoal(userId: string): Promise<Goal | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function getSelectedPath(goalId: string): Promise<WealthPath | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("wealth_paths")
    .select("*")
    .eq("goal_id", goalId)
    .eq("is_selected", true)
    .single();
  return data;
}

export async function getTodaysTasks(pathId: string): Promise<DailyTask[]> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("path_id", pathId)
    .eq("date", today)
    .order("created_at");
  return data || [];
}

export async function getTaskHistory(pathId: string, days = 60): Promise<DailyTask[]> {
  const supabase = createClient();
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
  const { data } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("path_id", pathId)
    .gte("date", startDate)
    .order("date", { ascending: false });
  return data || [];
}

export async function getLatestSnapshot(pathId: string): Promise<JourneySnapshot | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("journey_snapshots")
    .select("*")
    .eq("path_id", pathId)
    .order("date", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function getStreak(userId: string): Promise<Streak | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data;
}

export async function getMilestones(pathId: string): Promise<Milestone[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("milestones")
    .select("*")
    .eq("path_id", pathId)
    .order("target_value");
  return data || [];
}

export async function updateTaskStatus(
  taskId: string,
  status: { is_completed?: boolean; completed_at?: string; skipped_at?: string; consequence_days?: number }
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("daily_tasks")
    .update(status)
    .eq("id", taskId);
  if (error) throw error;
}

export async function saveJourneySnapshot(snapshot: Omit<JourneySnapshot, "id" | "created_at">) {
  const supabase = createClient();
  const { error } = await supabase
    .from("journey_snapshots")
    .insert(snapshot);
  if (error) throw error;
}

export async function updateStreak(userId: string, updates: Partial<Streak>) {
  const supabase = createClient();
  const { error } = await supabase
    .from("streaks")
    .upsert({ user_id: userId, ...updates })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function saveBriefing(briefing: Omit<DailyBriefing, "id">) {
  const supabase = createClient();
  const { error } = await supabase
    .from("daily_briefings")
    .insert(briefing);
  if (error) throw error;
}

export async function saveGoal(goal: Omit<Goal, "id" | "created_at" | "updated_at">) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("goals")
    .insert(goal)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function savePaths(paths: Omit<WealthPath, "id" | "created_at">[]) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("wealth_paths")
    .insert(paths)
    .select();
  if (error) throw error;
  return data;
}
