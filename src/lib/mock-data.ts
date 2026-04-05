// ─── Mock Data for Development ───
// Rich 30-day demo scenario for user "Partha"
// All data matches TypeScript interfaces in /types/index.ts

import type {
  Goal,
  WealthPath,
  DailyTask,
  Streak,
  Milestone,
  JourneySnapshot,
  DailyBriefing,
  TaskTemplate,
} from "@/types";

// Fixed reference date for deterministic rendering (no hydration mismatch)
const REF_DATE = new Date("2026-04-05T00:00:00Z");
const DAY_MS = 86400000;

function dateStr(daysFromRef: number): string {
  return new Date(REF_DATE.getTime() + daysFromRef * DAY_MS).toISOString().split("T")[0];
}

const today = dateStr(0);

// ─── Mock User ───
export const MOCK_USER = {
  id: "user-001-mock",
  email: "partha@wealthpath.app",
  name: "Partha",
};

// ─── Goal ───
export const MOCK_GOAL: Goal = {
  id: "goal-001",
  user_id: MOCK_USER.id,
  target_amount: 100000,
  timeframe_months: 60,
  daily_savings: 25,
  risk_profile: "moderate",
  currency: "USD",
  created_at: dateStr(-30) + "T00:00:00Z",
  updated_at: dateStr(0) + "T00:00:00Z",
};

// ─── Wealth Paths ───
const moderateTemplates: TaskTemplate[] = [
  { task_type: "dca", description: "Transfer to high-yield savings", amount_pct: 15, frequency: "daily" },
  { task_type: "dca", description: "Add to gold investment (GLD/IAU)", amount_pct: 15, frequency: "daily" },
  { task_type: "dca", description: "Add to S&P 500 / Total Market ETF", amount_pct: 40, frequency: "daily" },
  { task_type: "dca", description: "Add to BTC + ETH DCA", amount_pct: 30, frequency: "daily" },
  { task_type: "learn", description: "Read today's 2-min financial lesson", frequency: "daily" },
  { task_type: "review", description: "Weekly check-in: review portfolio value", frequency: "weekly" },
];

export const MOCK_PATHS: WealthPath[] = [
  {
    id: "path-conservative",
    goal_id: MOCK_GOAL.id,
    path_type: "conservative",
    vehicle_mix: { savings: 40, gold: 30, etf: 25, crypto: 5 },
    projected_timeline_months: 99,
    monthly_return_pct: 0.6,
    task_templates: [],
    is_selected: false,
    created_at: dateStr(-30) + "T00:00:00Z",
  },
  {
    id: "path-moderate",
    goal_id: MOCK_GOAL.id,
    path_type: "moderate",
    vehicle_mix: { savings: 15, gold: 15, etf: 40, crypto: 30 },
    projected_timeline_months: 54,
    monthly_return_pct: 1.5,
    task_templates: moderateTemplates,
    is_selected: true,
    created_at: dateStr(-30) + "T00:00:00Z",
  },
  {
    id: "path-aggressive",
    goal_id: MOCK_GOAL.id,
    path_type: "aggressive",
    vehicle_mix: { savings: 5, gold: 5, etf: 20, crypto: 70 },
    projected_timeline_months: 30,
    monthly_return_pct: 3.5,
    task_templates: [],
    is_selected: false,
    created_at: dateStr(-30) + "T00:00:00Z",
  },
];

export const MOCK_SELECTED_PATH = MOCK_PATHS[1]; // moderate

// ─── 30-Day Completion Pattern ───
// Days 1-5: all done | Day 6: 1 skip | Days 7-18: all done | Day 19: full skip | Days 20-30: all done
function isDayFullSkip(dayNum: number): boolean {
  return dayNum === 19;
}

function isDayPartialSkip(dayNum: number): boolean {
  return dayNum === 6;
}

// ─── Streak ───
export const MOCK_STREAK: Streak = {
  id: "streak-001",
  user_id: MOCK_USER.id,
  current_streak: 11, // Days 20-30
  longest_streak: 12, // Days 7-18
  last_completed_date: dateStr(-1),
};

// ─── Generate 30 days of tasks ───
function buildTaskHistory(): DailyTask[] {
  const tasks: DailyTask[] = [];
  const vehicles = [
    { key: "savings", pct: 15, label: "Transfer $3.75 to high-yield savings" },
    { key: "gold", pct: 15, label: "Add $3.75 to gold investment (GLD/IAU)" },
    { key: "etf", pct: 40, label: "Add $10.00 to S&P 500 / Total Market ETF" },
    { key: "crypto", pct: 30, label: "Add $7.50 to BTC + ETH DCA" },
  ];

  for (let dayNum = 1; dayNum <= 31; dayNum++) {
    const date = dateStr(dayNum - 31); // day 1 = 30 days ago, day 31 = today
    const isToday = dayNum === 31;
    const fullSkip = isDayFullSkip(dayNum);
    const partialSkip = isDayPartialSkip(dayNum);

    // DCA tasks
    vehicles.forEach((v, vi) => {
      const amount = Math.round((MOCK_GOAL.daily_savings * v.pct) / 100 * 100) / 100;
      const isSkipped = fullSkip || (partialSkip && vi === 0); // Day 6: skip savings only

      tasks.push({
        id: `task-d${dayNum}-${v.key}`,
        path_id: MOCK_SELECTED_PATH.id,
        date,
        task_type: "dca",
        description: v.label,
        amount,
        is_completed: isToday ? false : !isSkipped,
        completed_at: !isToday && !isSkipped ? date + `T0${8 + vi}:${10 + vi * 5}:00Z` : null,
        skipped_at: !isToday && isSkipped ? date + "T23:59:00Z" : null,
        consequence_days: isSkipped ? (fullSkip ? 5 : 3) : null,
        created_at: date + "T00:00:00Z",
      });
    });

    // Learn task (Mon/Wed/Fri)
    const dow = new Date(date + "T12:00:00").getDay();
    if (dow === 1 || dow === 3 || dow === 5) {
      tasks.push({
        id: `task-d${dayNum}-learn`,
        path_id: MOCK_SELECTED_PATH.id,
        date,
        task_type: "learn",
        description: `Read today's 2-min lesson: Topic ${dayNum}`,
        amount: null,
        is_completed: isToday ? false : !fullSkip,
        completed_at: !isToday && !fullSkip ? date + "T12:00:00Z" : null,
        skipped_at: !isToday && fullSkip ? date + "T23:59:00Z" : null,
        consequence_days: null,
        created_at: date + "T00:00:00Z",
      });
    }

    // Review task (Sunday)
    if (dow === 0) {
      tasks.push({
        id: `task-d${dayNum}-review`,
        path_id: MOCK_SELECTED_PATH.id,
        date,
        task_type: "review",
        description: "Weekly check-in: review your portfolio and update your current value",
        amount: null,
        is_completed: isToday ? false : !fullSkip,
        completed_at: !isToday && !fullSkip ? date + "T18:00:00Z" : null,
        skipped_at: null,
        consequence_days: null,
        created_at: date + "T00:00:00Z",
      });
    }
  }

  return tasks;
}

export const MOCK_TASKS_HISTORY = buildTaskHistory();
export const MOCK_TASKS_TODAY = MOCK_TASKS_HISTORY.filter((t) => t.date === today);

// ─── Journey Snapshots (30 days) ───
function buildSnapshots(): JourneySnapshot[] {
  const dailyRate = MOCK_SELECTED_PATH.monthly_return_pct / 100 / 30;
  let value = 0;
  const snaps: JourneySnapshot[] = [];

  for (let dayNum = 1; dayNum <= 30; dayNum++) {
    const date = dateStr(dayNum - 31);
    const fullSkip = isDayFullSkip(dayNum);
    const partialSkip = isDayPartialSkip(dayNum);

    // Calculate deposit for the day
    let deposit = MOCK_GOAL.daily_savings;
    if (fullSkip) deposit = 0;
    else if (partialSkip) deposit = MOCK_GOAL.daily_savings - 3.75; // minus savings skip

    value = (value + deposit) * (1 + dailyRate);
    value = Math.round(value * 100) / 100;

    const distRemaining = Math.max(0, ((MOCK_GOAL.target_amount - value) / MOCK_GOAL.target_amount) * 100);
    const monthsLeft = value > 0
      ? Math.ceil(Math.log((MOCK_GOAL.target_amount * (MOCK_SELECTED_PATH.monthly_return_pct / 100) / (MOCK_GOAL.daily_savings * 30)) + 1) / Math.log(1 + MOCK_SELECTED_PATH.monthly_return_pct / 100))
      : MOCK_SELECTED_PATH.projected_timeline_months;
    const etaDate = new Date(REF_DATE.getTime() + monthsLeft * 30 * DAY_MS).toISOString().split("T")[0];

    snaps.push({
      id: `snap-d${dayNum}`,
      path_id: MOCK_SELECTED_PATH.id,
      date,
      portfolio_value: value,
      distance_remaining_pct: Math.round(distRemaining * 100) / 100,
      eta_date: etaDate,
      created_at: date + "T23:59:00Z",
    });
  }

  return snaps;
}

export const MOCK_JOURNEY_SNAPSHOTS = buildSnapshots();
export const MOCK_LATEST_SNAPSHOT = MOCK_JOURNEY_SNAPSHOTS[MOCK_JOURNEY_SNAPSHOTS.length - 1];

// ─── Milestones ───
export const MOCK_MILESTONES: Milestone[] = [
  {
    id: "ms-1",
    path_id: MOCK_SELECTED_PATH.id,
    target_value: 1000,
    label: "First $1K!",
    // Reached around day 25 based on ~$25/day + growth
    reached_at: MOCK_JOURNEY_SNAPSHOTS.find((s) => s.portfolio_value >= 1000)
      ? MOCK_JOURNEY_SNAPSHOTS.find((s) => s.portfolio_value >= 1000)!.date + "T12:00:00Z"
      : null,
    is_celebrated: true,
  },
  { id: "ms-2", path_id: MOCK_SELECTED_PATH.id, target_value: 5000, label: "$5K Club", reached_at: null, is_celebrated: false },
  { id: "ms-3", path_id: MOCK_SELECTED_PATH.id, target_value: 10000, label: "Five Figures!", reached_at: null, is_celebrated: false },
  { id: "ms-4", path_id: MOCK_SELECTED_PATH.id, target_value: 25000, label: "Quarter Way", reached_at: null, is_celebrated: false },
  { id: "ms-5", path_id: MOCK_SELECTED_PATH.id, target_value: 50000, label: "Halfway There!", reached_at: null, is_celebrated: false },
  { id: "ms-6", path_id: MOCK_SELECTED_PATH.id, target_value: 75000, label: "Final Stretch", reached_at: null, is_celebrated: false },
  { id: "ms-7", path_id: MOCK_SELECTED_PATH.id, target_value: 100000, label: "DESTINATION!", reached_at: null, is_celebrated: false },
];

// ─── Skip Records ───
export const MOCK_SKIP_RECORDS = [
  {
    task_id: "task-d6-savings",
    date: dateStr(-25),
    description: "Transfer $3.75 to high-yield savings",
    amount: 3.75,
    missed_future_value: 47.23,
    days_added: 3,
    skipped_at: dateStr(-25) + "T23:59:00Z",
  },
  {
    task_id: "task-d19-savings",
    date: dateStr(-12),
    description: "Transfer $3.75 to high-yield savings",
    amount: 3.75,
    missed_future_value: 28.15,
    days_added: 2,
    skipped_at: dateStr(-12) + "T23:59:00Z",
  },
  {
    task_id: "task-d19-gold",
    date: dateStr(-12),
    description: "Add $3.75 to gold investment (GLD/IAU)",
    amount: 3.75,
    missed_future_value: 28.15,
    days_added: 2,
    skipped_at: dateStr(-12) + "T23:59:00Z",
  },
  {
    task_id: "task-d19-etf",
    date: dateStr(-12),
    description: "Add $10.00 to S&P 500 / Total Market ETF",
    amount: 10.0,
    missed_future_value: 63.21,
    days_added: 4,
    skipped_at: dateStr(-12) + "T23:59:00Z",
  },
  {
    task_id: "task-d19-crypto",
    date: dateStr(-12),
    description: "Add $7.50 to BTC + ETH DCA",
    amount: 7.5,
    missed_future_value: 47.42,
    days_added: 3,
    skipped_at: dateStr(-12) + "T23:59:00Z",
  },
];

// ─── Daily Briefings (5 recent) ───
export const MOCK_BRIEFINGS: DailyBriefing[] = [
  {
    id: "brief-1",
    user_id: MOCK_USER.id,
    date: dateStr(0),
    content: "Day 11 of your streak! At $25/day, you've invested $275 just this streak alone. Your ETF allocation is quietly compounding while you sleep. That's the beauty of DCA.",
    context_data: { streak: 11, progress_pct: 1.75 },
  },
  {
    id: "brief-2",
    user_id: MOCK_USER.id,
    date: dateStr(-1),
    content: "New week, new momentum. Your moderate path has you investing $25 today across 4 vehicles. Small moves, big results. Let's make it a perfect week.",
    context_data: { streak: 10, progress_pct: 1.72 },
  },
  {
    id: "brief-3",
    user_id: MOCK_USER.id,
    date: dateStr(-2),
    content: "Your portfolio just crossed $700! At this pace, your $100,000 goal is looking very achievable. Every day you show up, you're proving the math right.",
    context_data: { streak: 9, progress_pct: 1.68 },
  },
  {
    id: "brief-4",
    user_id: MOCK_USER.id,
    date: dateStr(-12),
    content: "Fresh start today. Missing a day doesn't erase your progress — you're still on the path. One task at a time. Your money from previous days is still compounding.",
    context_data: { streak: 0, progress_pct: 1.2 },
  },
  {
    id: "brief-5",
    user_id: MOCK_USER.id,
    date: dateStr(-7),
    content: "Markets move daily — your strategy doesn't have to. DCA means you buy more when prices dip and less when they peak. Your ETF position benefits from this automatically.",
    context_data: { streak: 5, progress_pct: 1.45 },
  },
];

export const MOCK_BRIEFING = MOCK_BRIEFINGS[0];

// ─── Launchpad ───
export let MOCK_LAUNCHPAD_COMPLETE = false;
export function setLaunchpadComplete(val: boolean) {
  MOCK_LAUNCHPAD_COMPLETE = val;
}

// ─── Helper: Get data like Supabase would ───
export const mockDb = {
  getGoal: () => MOCK_GOAL,
  getPaths: () => MOCK_PATHS,
  getSelectedPath: () => MOCK_SELECTED_PATH,
  getStreak: () => MOCK_STREAK,
  getTodayTasks: () => MOCK_TASKS_TODAY,
  getTaskHistory: () => MOCK_TASKS_HISTORY,
  getMilestones: () => MOCK_MILESTONES,
  getJourneySnapshots: () => MOCK_JOURNEY_SNAPSHOTS,
  getLatestSnapshot: () => MOCK_LATEST_SNAPSHOT,
  getBriefing: () => MOCK_BRIEFING,
  getUser: () => MOCK_USER,
};
