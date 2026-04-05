// ─── Task Generator ───
// Generates daily tasks based on selected path's vehicle_mix and task_templates

import type { WealthPath, DailyTask, Goal } from "@/types";

// ─── Learn Topics (30+ rotating) ───
const LEARN_TOPICS = [
  // Basics
  "What is compound interest and why Einstein called it the 8th wonder",
  "How DCA reduces risk — buying the average, not the peak",
  "The Rule of 72: quickly estimate how fast your money doubles",
  "What is inflation and why your savings lose value sitting still",
  "Emergency fund: why 3-6 months of expenses comes first",
  "Good debt vs bad debt — not all borrowing is equal",
  "The difference between saving and investing",
  // ETF/Stocks
  "What is an index fund and why Warren Buffett recommends them",
  "ETF expense ratios: the silent fee eating your returns",
  "Dollar-cost averaging vs lump sum — the data might surprise you",
  "What is market capitalization and why it matters",
  "Dividend reinvestment: the snowball that builds itself",
  "Why time in the market beats timing the market",
  "S&P 500 history: it's crashed many times and always recovered",
  // Crypto
  "Bitcoin basics: why digital scarcity matters",
  "What is blockchain — explained without the jargon",
  "Cold wallet vs hot wallet: protecting your crypto",
  "Why DCA works especially well in volatile crypto markets",
  "Understanding crypto volatility — 50% drops are normal",
  "Stablecoins explained: the bridge between fiat and crypto",
  // Psychology
  "Why most investors lose money — and how to be different",
  "The power of doing nothing when markets crash",
  "Fear and greed: your two biggest enemies as an investor",
  "Patience is literally a wealth strategy — the math proves it",
  "Comparing yourself to others kills your returns",
  "Loss aversion: why $10 lost hurts more than $10 gained",
  "The latte factor is overblown — focus on big wins",
  // Advanced
  "What are bonds and do you need them?",
  "Real estate vs stocks vs crypto: a realistic comparison",
  "Tax-efficient investing basics for beginners",
  "Rebalancing your portfolio: when and why",
  "The magic of compounding over decades — year 20 is where it explodes",
  "What is a Sharpe ratio and why risk-adjusted returns matter",
];

const VEHICLE_LABELS: Record<string, string> = {
  savings: "high-yield savings",
  gold: "gold investment (GLD/IAU)",
  etf: "S&P 500 / Total Market ETF",
  crypto: "BTC + ETH DCA",
};

// ─── Generate tasks for a specific date ───
export function generateDailyTasks(
  path: WealthPath,
  goal: Goal,
  date: string
): DailyTask[] {
  const tasks: DailyTask[] = [];
  const dayOfWeek = new Date(date + "T12:00:00").getDay(); // 0=Sun, 1=Mon...
  const dayOfYear = getDayOfYear(date);

  // 1. DCA Tasks (daily) — split by vehicle mix
  Object.entries(path.vehicle_mix).forEach(([vehicle, pct]) => {
    if (!pct || pct <= 0) return;
    const amount = Math.round((goal.daily_savings * pct) / 100 * 100) / 100;
    const label = VEHICLE_LABELS[vehicle] || vehicle;

    tasks.push({
      id: `task-${date}-dca-${vehicle}`,
      path_id: path.id,
      date,
      task_type: "dca",
      description: `Add $${amount.toFixed(2)} to ${label}`,
      amount,
      is_completed: false,
      completed_at: null,
      skipped_at: null,
      consequence_days: null,
      created_at: date + "T00:00:00Z",
    });
  });

  // 2. Learn Task (Mon=1, Wed=3, Fri=5)
  if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
    const topicIndex = dayOfYear % LEARN_TOPICS.length;
    tasks.push({
      id: `task-${date}-learn`,
      path_id: path.id,
      date,
      task_type: "learn",
      description: `Read today's 2-min lesson: ${LEARN_TOPICS[topicIndex]}`,
      amount: null,
      is_completed: false,
      completed_at: null,
      skipped_at: null,
      consequence_days: null,
      created_at: date + "T00:00:00Z",
    });
  }

  // 3. Review Task (Sunday = 0)
  if (dayOfWeek === 0) {
    tasks.push({
      id: `task-${date}-review`,
      path_id: path.id,
      date,
      task_type: "review",
      description: "Weekly check-in: review your portfolio and update your current value",
      amount: null,
      is_completed: false,
      completed_at: null,
      skipped_at: null,
      consequence_days: null,
      created_at: date + "T00:00:00Z",
    });
  }

  return tasks;
}

// ─── Generate tasks for a date range (for history) ───
export function generateTasksForRange(
  path: WealthPath,
  goal: Goal,
  startDate: string,
  endDate: string
): DailyTask[] {
  const tasks: DailyTask[] = [];
  const start = new Date(startDate + "T12:00:00");
  const end = new Date(endDate + "T12:00:00");

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    tasks.push(...generateDailyTasks(path, goal, dateStr));
  }

  return tasks;
}

// ─── Generate mock historical tasks with completion patterns ───
export function generateMockHistory(
  path: WealthPath,
  goal: Goal,
  daysBack: number
): DailyTask[] {
  const allTasks: DailyTask[] = [];
  const today = new Date();

  for (let i = daysBack; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayTasks = generateDailyTasks(path, goal, dateStr);

    if (i === 0) {
      // Today — leave as uncompleted
      allTasks.push(...dayTasks);
      continue;
    }

    // Historical — simulate completion patterns
    // ~80% completion rate, with some full skips
    const isFullSkip = i % 7 === 4; // Every ~week, one bad day
    const isPartial = i % 5 === 0; // Occasional partial days

    dayTasks.forEach((task, idx) => {
      if (isFullSkip) {
        task.skipped_at = dateStr + "T23:59:00Z";
        task.is_completed = false;
        if (task.task_type === "dca") task.consequence_days = (i % 5) + 1;
      } else if (isPartial && idx === dayTasks.length - 1) {
        // Skip last task of the day
        task.skipped_at = dateStr + "T23:59:00Z";
        task.is_completed = false;
      } else {
        task.is_completed = true;
        task.completed_at = dateStr + `T0${8 + idx}:${15 + idx * 10}:00Z`;
      }
    });

    allTasks.push(...dayTasks);
  }

  return allTasks;
}

// ─── Helpers ───
function getDayOfYear(dateStr: string): number {
  const d = new Date(dateStr + "T12:00:00");
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export type DayStatus = "perfect" | "partial" | "missed" | "future" | "empty";

export function getDayStatus(tasks: DailyTask[]): DayStatus {
  if (tasks.length === 0) return "empty";
  const completed = tasks.filter((t) => t.is_completed).length;
  const skipped = tasks.filter((t) => t.skipped_at).length;
  if (completed === tasks.length) return "perfect";
  if (completed > 0) return "partial";
  if (skipped > 0) return "missed";
  return "future";
}
