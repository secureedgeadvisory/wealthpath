// ─── Consequence Engine ───
// The behavioral heart of WealthPath.
// Calculates real compound impact of every completed and skipped task.

import type { DailyTask, WealthPath, JourneySnapshot, Goal } from "@/types";

export interface CompletionResult {
  portfolio_value: number;
  distance_remaining_pct: number;
  eta_date: string;
  daily_growth: number;
}

export interface SkipConsequence {
  missed_future_value: number;
  old_eta: string;
  new_eta: string;
  days_added: number;
  amount_skipped: number;
}

export interface SkipRecord {
  task_id: string;
  date: string;
  description: string;
  amount: number;
  missed_future_value: number;
  days_added: number;
  skipped_at: string;
}

// ─── 1. Task Completion ───
// When a DCA task is completed: add amount + apply daily compound growth
export function calculateTaskCompletion(
  task: DailyTask,
  path: WealthPath,
  currentSnapshot: JourneySnapshot,
  goal: Goal
): CompletionResult {
  const amount = task.amount || 0;
  const dailyReturnRate = path.monthly_return_pct / 100 / 30;

  // New value = (current + deposit) × (1 + daily rate)
  const newValue =
    (currentSnapshot.portfolio_value + amount) * (1 + dailyReturnRate);
  const roundedValue = Math.round(newValue * 100) / 100;

  const distanceRemaining = Math.max(
    0,
    ((goal.target_amount - roundedValue) / goal.target_amount) * 100
  );

  // Recalculate ETA based on remaining amount and daily contributions + growth
  const eta = calculateETA(
    roundedValue,
    goal.target_amount,
    goal.daily_savings,
    path.monthly_return_pct
  );

  return {
    portfolio_value: roundedValue,
    distance_remaining_pct: Math.round(distanceRemaining * 100) / 100,
    eta_date: eta,
    daily_growth: roundedValue - currentSnapshot.portfolio_value,
  };
}

// ─── 2. Skip Consequence ───
// When a DCA task is skipped: calculate the compounded future cost
export function calculateSkipConsequence(
  task: DailyTask,
  path: WealthPath,
  currentSnapshot: JourneySnapshot,
  goal: Goal
): SkipConsequence {
  const amount = task.amount || 0;
  const annualReturn = path.monthly_return_pct * 12;

  // How many days remain until current ETA?
  const currentEta = new Date(currentSnapshot.eta_date);
  const now = new Date();
  const remainingDays = Math.max(
    1,
    Math.ceil((currentEta.getTime() - now.getTime()) / 86400000)
  );

  // Future value of the missed amount compounded over remaining days
  // FV = PV × (1 + r/365) ^ n
  const dailyRate = annualReturn / 100 / 365;
  const missedFutureValue =
    amount * Math.pow(1 + dailyRate, remainingDays);
  const roundedMissed = Math.round(missedFutureValue * 100) / 100;

  const oldEta = currentSnapshot.eta_date;

  // Days added = missed_future_value / daily_contribution_value
  const dailyContributionValue =
    goal.daily_savings * (1 + dailyRate);
  const daysAdded = Math.max(
    1,
    Math.round(missedFutureValue / dailyContributionValue)
  );

  // Shift ETA forward by days_added
  const shiftedEta = new Date(currentEta);
  shiftedEta.setDate(shiftedEta.getDate() + daysAdded);
  const newEta = shiftedEta.toISOString().split("T")[0];

  return {
    missed_future_value: roundedMissed,
    old_eta: oldEta,
    new_eta: newEta,
    days_added: daysAdded,
    amount_skipped: amount,
  };
}

// ─── 3. Full Journey Recalculation ───
// Rebuild snapshot from all task history
export function recalculateJourney(
  goal: Goal,
  path: WealthPath,
  completedTasks: DailyTask[],
  skippedTasks: DailyTask[],
  startingValue = 0
): JourneySnapshot {
  const dailyRate = path.monthly_return_pct / 100 / 30;
  let portfolioValue = startingValue;

  // Sort all completed tasks by date
  const sorted = [...completedTasks]
    .filter((t) => t.task_type === "dca" && t.amount)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Simulate day-by-day growth
  const dates = Array.from(new Set(sorted.map((t) => t.date)));
  dates.forEach((date) => {
    const dayTasks = sorted.filter((t) => t.date === date);
    const dayDeposit = dayTasks.reduce((sum, t) => sum + (t.amount || 0), 0);
    portfolioValue = (portfolioValue + dayDeposit) * (1 + dailyRate);
  });

  portfolioValue = Math.round(portfolioValue * 100) / 100;

  const distanceRemaining = Math.max(
    0,
    ((goal.target_amount - portfolioValue) / goal.target_amount) * 100
  );

  const etaDate = calculateETA(
    portfolioValue,
    goal.target_amount,
    goal.daily_savings,
    path.monthly_return_pct
  );

  const today = new Date().toISOString().split("T")[0];

  return {
    id: `snap-recalc-${Date.now()}`,
    path_id: path.id,
    date: today,
    portfolio_value: portfolioValue,
    distance_remaining_pct: Math.round(distanceRemaining * 100) / 100,
    eta_date: etaDate,
    created_at: new Date().toISOString(),
  };
}

// ─── Helper: Calculate ETA ───
// Uses future value of annuity formula solved for n
function calculateETA(
  currentValue: number,
  targetAmount: number,
  dailySavings: number,
  monthlyReturnPct: number
): string {
  const remaining = targetAmount - currentValue;
  if (remaining <= 0) {
    return new Date().toISOString().split("T")[0];
  }

  const monthlyDeposit = dailySavings * 30;
  const r = monthlyReturnPct / 100;

  let months: number;
  if (r <= 0) {
    months = Math.ceil(remaining / monthlyDeposit);
  } else {
    // FV = PMT × [((1+r)^n - 1) / r]
    // Solve for n: n = log(FV × r / PMT + 1) / log(1 + r)
    months = Math.ceil(
      Math.log((remaining * r) / monthlyDeposit + 1) / Math.log(1 + r)
    );
  }

  const eta = new Date();
  eta.setMonth(eta.getMonth() + months);
  return eta.toISOString().split("T")[0];
}

// ─── Format helpers ───
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
