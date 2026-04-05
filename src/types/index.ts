// ─── WealthPath Type Definitions ───
// Matches Supabase PostgreSQL schema exactly

export interface Goal {
  id: string;
  user_id: string;
  target_amount: number;
  timeframe_months: number;
  daily_savings: number;
  risk_profile: "conservative" | "moderate" | "aggressive";
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleMix {
  savings?: number;
  gold?: number;
  etf?: number;
  crypto?: number;
  [key: string]: number | undefined;
}

export interface TaskTemplate {
  task_type: "dca" | "learn" | "review" | "check";
  description: string;
  amount_pct?: number;
  frequency: "daily" | "weekly" | "monthly";
}

export interface MilestoneTemplate {
  value: number;
  label: string;
}

export interface WealthPath {
  id: string;
  goal_id: string;
  path_type: "conservative" | "moderate" | "aggressive";
  vehicle_mix: VehicleMix;
  projected_timeline_months: number;
  monthly_return_pct: number;
  task_templates: TaskTemplate[];
  is_selected: boolean;
  created_at: string;
}

export interface DailyTask {
  id: string;
  path_id: string;
  date: string;
  task_type: "dca" | "learn" | "review" | "check";
  description: string;
  amount: number | null;
  is_completed: boolean;
  completed_at: string | null;
  skipped_at: string | null;
  consequence_days: number | null;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
}

export interface Milestone {
  id: string;
  path_id: string;
  target_value: number;
  label: string;
  reached_at: string | null;
  is_celebrated: boolean;
}

export interface JourneySnapshot {
  id: string;
  path_id: string;
  date: string;
  portfolio_value: number;
  distance_remaining_pct: number;
  eta_date: string;
  created_at: string;
}

export interface DailyBriefing {
  id: string;
  user_id: string;
  date: string;
  content: string;
  context_data: Record<string, unknown> | null;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_name: string;
  event_data: Record<string, unknown> | null;
  created_at: string;
}

// ─── UI Types ───

export interface PathGenerationRequest {
  target_amount: number;
  timeframe_months: number;
  daily_savings: number;
  risk_profile: string;
  currency: string;
}

export interface GeneratedPath {
  path_type: "conservative" | "moderate" | "aggressive";
  vehicle_mix: VehicleMix;
  projected_timeline_months: number;
  monthly_return_pct: number;
  task_templates: TaskTemplate[];
  milestones: MilestoneTemplate[];
}

export type UserTier = "free" | "pro";
