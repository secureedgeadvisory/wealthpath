// ─── Path Generator ───
// Generates 3 wealth paths from a Goal using compound interest math
// Currently mock — swap for Claude API call later

import type { Goal, WealthPath, VehicleMix, TaskTemplate } from "@/types";

interface PathConfig {
  path_type: "conservative" | "moderate" | "aggressive";
  vehicle_mix: VehicleMix;
  monthly_return_pct: number;
  task_templates: TaskTemplate[];
}

const PATH_CONFIGS: PathConfig[] = [
  {
    path_type: "conservative",
    vehicle_mix: { savings: 40, gold: 30, etf: 25, crypto: 5 },
    monthly_return_pct: 0.6,
    task_templates: [
      { task_type: "dca", description: "Transfer to high-yield savings account", amount_pct: 40, frequency: "daily" },
      { task_type: "dca", description: "Add to gold ETF (GLD/IAU)", amount_pct: 30, frequency: "daily" },
      { task_type: "dca", description: "Add to S&P 500 index fund (VOO/SPY)", amount_pct: 25, frequency: "daily" },
      { task_type: "dca", description: "Add to BTC (small allocation)", amount_pct: 5, frequency: "daily" },
      { task_type: "learn", description: "Read today's 2-min financial literacy lesson", frequency: "daily" },
      { task_type: "review", description: "Review portfolio allocation and rebalance if needed", frequency: "weekly" },
    ],
  },
  {
    path_type: "moderate",
    vehicle_mix: { savings: 15, gold: 15, etf: 40, crypto: 30 },
    monthly_return_pct: 1.5,
    task_templates: [
      { task_type: "dca", description: "Transfer to high-yield savings", amount_pct: 15, frequency: "daily" },
      { task_type: "dca", description: "Add to gold ETF", amount_pct: 15, frequency: "daily" },
      { task_type: "dca", description: "Add to Total Market / S&P 500 ETF", amount_pct: 40, frequency: "daily" },
      { task_type: "dca", description: "Add to BTC + ETH (60/40 split)", amount_pct: 30, frequency: "daily" },
      { task_type: "learn", description: "Read today's 2-min lesson on diversified investing", frequency: "daily" },
      { task_type: "review", description: "Check portfolio balance and crypto positions", frequency: "weekly" },
    ],
  },
  {
    path_type: "aggressive",
    vehicle_mix: { savings: 5, gold: 5, etf: 20, crypto: 70 },
    monthly_return_pct: 3.5,
    task_templates: [
      { task_type: "dca", description: "Keep emergency buffer in savings", amount_pct: 5, frequency: "daily" },
      { task_type: "dca", description: "Small gold hedge", amount_pct: 5, frequency: "daily" },
      { task_type: "dca", description: "Add to growth ETFs (QQQ/VGT)", amount_pct: 20, frequency: "daily" },
      { task_type: "dca", description: "Add to BTC + ETH + SOL basket", amount_pct: 70, frequency: "daily" },
      { task_type: "learn", description: "Read today's 2-min crypto market insight", frequency: "daily" },
      { task_type: "check", description: "Verify exchange security, 2FA, and withdrawal limits", frequency: "weekly" },
      { task_type: "review", description: "Review positions, set take-profit and stop-loss levels", frequency: "weekly" },
    ],
  },
];

// Calculate months to reach target using compound interest:
// FV = PMT × [((1+r)^n - 1) / r]
// Solve for n: n = log(FV × r / PMT + 1) / log(1 + r)
function calculateTimelineMonths(
  targetAmount: number,
  dailySavings: number,
  monthlyReturnPct: number
): number {
  const monthlyDeposit = dailySavings * 30;
  const r = monthlyReturnPct / 100;

  if (r <= 0) {
    // No returns — pure savings
    return Math.ceil(targetAmount / monthlyDeposit);
  }

  // Solve for n months
  const n = Math.log((targetAmount * r) / monthlyDeposit + 1) / Math.log(1 + r);
  return Math.ceil(n);
}

export function generateMilestones(targetAmount: number) {
  const pcts = [0.1, 0.25, 0.5, 0.75, 1.0];
  const labels = ["First 10%", "Quarter Way!", "HALFWAY!", "Final Stretch", "DESTINATION!"];

  return pcts.map((pct, i) => ({
    value: Math.round(targetAmount * pct),
    label: labels[i],
  }));
}

export function generateWealthPaths(goal: Goal): WealthPath[] {
  return PATH_CONFIGS.map((config, i) => {
    const timelineMonths = calculateTimelineMonths(
      goal.target_amount,
      goal.daily_savings,
      config.monthly_return_pct
    );

    // Add dollar amounts to task descriptions
    const tasksWithAmounts = config.task_templates.map((t) => {
      if (t.task_type === "dca" && t.amount_pct) {
        const amount = ((goal.daily_savings * t.amount_pct) / 100).toFixed(2);
        return { ...t, description: `$${amount}/day — ${t.description}` };
      }
      return t;
    });

    return {
      id: `path-${config.path_type}-${Date.now()}-${i}`,
      goal_id: goal.id,
      path_type: config.path_type,
      vehicle_mix: config.vehicle_mix,
      projected_timeline_months: timelineMonths,
      monthly_return_pct: config.monthly_return_pct,
      task_templates: tasksWithAmounts,
      is_selected: false,
      created_at: new Date().toISOString(),
    };
  });
}
