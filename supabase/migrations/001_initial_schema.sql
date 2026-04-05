-- ═══════════════════════════════════════════════════════════════
-- WealthPath — Initial Database Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Goals ───
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
  timeframe_months INTEGER NOT NULL CHECK (timeframe_months > 0),
  daily_savings NUMERIC NOT NULL CHECK (daily_savings > 0),
  risk_profile TEXT NOT NULL CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive')),
  currency TEXT DEFAULT 'USD' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_goals_user_id ON goals(user_id);

-- ─── 2. Wealth Paths ───
CREATE TABLE wealth_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  path_type TEXT NOT NULL CHECK (path_type IN ('conservative', 'moderate', 'aggressive')),
  vehicle_mix JSONB NOT NULL,
  projected_timeline_months INTEGER NOT NULL CHECK (projected_timeline_months > 0),
  monthly_return_pct NUMERIC NOT NULL,
  task_templates JSONB NOT NULL,
  is_selected BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_wealth_paths_goal_id ON wealth_paths(goal_id);

-- ─── 3. Daily Tasks ───
CREATE TABLE daily_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path_id UUID REFERENCES wealth_paths(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('dca', 'learn', 'review', 'check')),
  description TEXT NOT NULL,
  amount NUMERIC,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  completed_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  consequence_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_daily_tasks_path_date ON daily_tasks(path_id, date);

-- ─── 4. Streaks ───
CREATE TABLE streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_completed_date DATE
);

CREATE INDEX idx_streaks_user_id ON streaks(user_id);

-- ─── 5. Milestones ───
CREATE TABLE milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path_id UUID REFERENCES wealth_paths(id) ON DELETE CASCADE NOT NULL,
  target_value NUMERIC NOT NULL CHECK (target_value > 0),
  label TEXT NOT NULL,
  reached_at TIMESTAMPTZ,
  is_celebrated BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE INDEX idx_milestones_path_id ON milestones(path_id);

-- ─── 6. Journey Snapshots ───
CREATE TABLE journey_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path_id UUID REFERENCES wealth_paths(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  portfolio_value NUMERIC NOT NULL,
  distance_remaining_pct NUMERIC NOT NULL CHECK (distance_remaining_pct >= 0 AND distance_remaining_pct <= 100),
  eta_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_journey_snapshots_path_date ON journey_snapshots(path_id, date);

-- ─── 7. Daily Briefings ───
CREATE TABLE daily_briefings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  context_data JSONB
);

CREATE INDEX idx_daily_briefings_user_date ON daily_briefings(user_id, date);

-- ─── 8. Analytics Events ───
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);

-- ═══════════════════════════════════════════════════════════════
-- Row Level Security (RLS) Policies
-- Every table restricted to user's own data
-- ═══════════════════════════════════════════════════════════════

-- ─── Goals RLS ───
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Wealth Paths RLS (via FK chain through goals) ───
ALTER TABLE wealth_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wealth paths"
  ON wealth_paths FOR SELECT
  USING (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));

CREATE POLICY "Users can create wealth paths for own goals"
  ON wealth_paths FOR INSERT
  WITH CHECK (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own wealth paths"
  ON wealth_paths FOR UPDATE
  USING (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own wealth paths"
  ON wealth_paths FOR DELETE
  USING (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));

-- ─── Daily Tasks RLS (via FK chain: daily_tasks → wealth_paths → goals) ───
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily tasks"
  ON daily_tasks FOR SELECT
  USING (path_id IN (
    SELECT wp.id FROM wealth_paths wp
    JOIN goals g ON wp.goal_id = g.id
    WHERE g.user_id = auth.uid()
  ));

CREATE POLICY "Users can create daily tasks for own paths"
  ON daily_tasks FOR INSERT
  WITH CHECK (path_id IN (
    SELECT wp.id FROM wealth_paths wp
    JOIN goals g ON wp.goal_id = g.id
    WHERE g.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own daily tasks"
  ON daily_tasks FOR UPDATE
  USING (path_id IN (
    SELECT wp.id FROM wealth_paths wp
    JOIN goals g ON wp.goal_id = g.id
    WHERE g.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own daily tasks"
  ON daily_tasks FOR DELETE
  USING (path_id IN (
    SELECT wp.id FROM wealth_paths wp
    JOIN goals g ON wp.goal_id = g.id
    WHERE g.user_id = auth.uid()
  ));

-- ─── Streaks RLS ───
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own streaks"
  ON streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── Milestones RLS (via FK chain: milestones → wealth_paths → goals) ───
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON milestones FOR SELECT
  USING (path_id IN (
    SELECT wp.id FROM wealth_paths wp
    JOIN goals g ON wp.goal_id = g.id
    WHERE g.user_id = auth.uid()
  ));

CREATE POLICY "Users can create milestones for own paths"
  ON milestones FOR INSERT
  WITH CHECK (path_id IN (
    SELECT wp.id FROM wealth_paths wp
    JOIN goals g ON wp.goal_id = g.id
    WHERE g.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own milestones"
  ON milestones FOR UPDATE
  USING (path_id IN (
    SELECT wp.id FROM wealth_paths wp
    JOIN goals g ON wp.goal_id = g.id
    WHERE g.user_id = auth.uid()
  ));

-- ─── Journey Snapshots RLS (via FK chain) ───
ALTER TABLE journey_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journey snapshots"
  ON journey_snapshots FOR SELECT
  USING (path_id IN (
    SELECT wp.id FROM wealth_paths wp
    JOIN goals g ON wp.goal_id = g.id
    WHERE g.user_id = auth.uid()
  ));

CREATE POLICY "Users can create journey snapshots for own paths"
  ON journey_snapshots FOR INSERT
  WITH CHECK (path_id IN (
    SELECT wp.id FROM wealth_paths wp
    JOIN goals g ON wp.goal_id = g.id
    WHERE g.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own journey snapshots"
  ON journey_snapshots FOR UPDATE
  USING (path_id IN (
    SELECT wp.id FROM wealth_paths wp
    JOIN goals g ON wp.goal_id = g.id
    WHERE g.user_id = auth.uid()
  ));

-- ─── Daily Briefings RLS ───
ALTER TABLE daily_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily briefings"
  ON daily_briefings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own daily briefings"
  ON daily_briefings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── Analytics Events RLS ───
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- Helper: Auto-update updated_at on goals
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
