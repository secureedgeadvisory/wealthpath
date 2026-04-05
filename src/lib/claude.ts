// ─── Claude API Wrapper ───
// Set USE_MOCK to false when ready to use real Claude API

import type { Goal, GeneratedPath } from "@/types";
import { generateWealthPaths as mockGeneratePaths } from "./path-generator";
import { generateBriefing as mockGenerateBriefing } from "./briefing-generator";

const USE_MOCK = true; // ← Flip to false for real Claude API
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export const SYSTEM_PROMPTS = {
  pathGeneration: `You are WealthPath AI, a financial education planning assistant.
You help users visualize different wealth-building strategies.
You NEVER give financial advice. You show EDUCATIONAL projections based on historical averages.

Return assumptions (annual):
- High-yield savings: 4-5% (low risk)
- Gold/commodities: 8-12% (medium risk)
- ETF/Index funds: 10-15% (medium risk, long-term)
- Crypto DCA (BTC+ETH+alts): 30-80% (high risk, very volatile)

Given the user's goal, generate exactly 3 paths as JSON array.
Each path object must have:
- path_type: "conservative" | "moderate" | "aggressive"
- vehicle_mix: object with percentage allocations (must sum to 100)
- projected_timeline_months: integer
- monthly_return_pct: number
- task_templates: array of recurring task objects {task_type, description, amount_pct, frequency}
- milestones: array of {value: number, label: string}

Conservative: heavy savings + gold, minimal/no crypto
Moderate: balanced ETF + some crypto
Aggressive: crypto-heavy DCA strategy

Respond with ONLY the JSON array, no markdown, no explanation.`,

  dailyBriefing: `You are WealthPath Co-pilot, a friendly wealth companion.
Generate a 2-3 sentence daily briefing for the user.
Be warm, personal, specific to their journey.
Reference their streak, progress %, and vehicle mix.
If they missed tasks recently, be encouraging not guilt-tripping.
End with ONE actionable micro-tip for today.
Keep under 50 words. Never recommend specific investments.
Never say "buy" or "sell". Use "consider" or "explore".`,

  consequence: `Generate a single motivating sentence about the consequence of a skipped task.
Be factual, not scary. Include the specific dollar impact of the missed compounding.
End with encouragement: "Tomorrow is a new day to get back on track."
Keep to 1-2 sentences.`,
};

// ─── Low-level Claude API call ───
async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY.startsWith("your_") || ANTHROPIC_API_KEY.startsWith("sk-ant-your")) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Claude API error: ${res.status} ${error}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

// ─── 1. Generate Wealth Paths ───
export async function generateWealthPaths(goal: Goal): Promise<GeneratedPath[]> {
  if (USE_MOCK) {
    // Return mock-generated paths
    const paths = mockGeneratePaths(goal);
    return paths.map((p) => ({
      path_type: p.path_type,
      vehicle_mix: p.vehicle_mix,
      projected_timeline_months: p.projected_timeline_months,
      monthly_return_pct: p.monthly_return_pct,
      task_templates: p.task_templates,
      milestones: [],
    }));
  }

  try {
    const prompt = `Goal: $${goal.target_amount.toLocaleString()} in ${goal.timeframe_months} months.
Daily savings capacity: $${goal.daily_savings}/day.
Risk tolerance: ${goal.risk_profile}.
Currency: ${goal.currency}.`;

    const response = await callClaude(SYSTEM_PROMPTS.pathGeneration, prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Failed to parse paths JSON");
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("[Claude] Path generation failed, using mock:", err);
    const paths = mockGeneratePaths(goal);
    return paths.map((p) => ({
      path_type: p.path_type,
      vehicle_mix: p.vehicle_mix,
      projected_timeline_months: p.projected_timeline_months,
      monthly_return_pct: p.monthly_return_pct,
      task_templates: p.task_templates,
      milestones: [],
    }));
  }
}

// ─── 2. Generate Daily Briefing ───
interface BriefingContext {
  goal_amount: number;
  daily_savings: number;
  vehicle_mix: Record<string, number | undefined>;
  progress_pct: number;
  streak_days: number;
  recent_skips: number;
  path_type: string;
  portfolio_value: number;
}

export async function generateDailyBriefing(ctx: BriefingContext): Promise<string> {
  if (USE_MOCK) {
    return mockGenerateBriefing(ctx);
  }

  try {
    const prompt = `User context:
- Goal: $${ctx.goal_amount.toLocaleString()}
- Daily savings: $${ctx.daily_savings}
- Progress: ${ctx.progress_pct.toFixed(1)}%
- Portfolio: $${ctx.portfolio_value.toLocaleString()}
- Current streak: ${ctx.streak_days} days
- Recent skips: ${ctx.recent_skips}
- Path type: ${ctx.path_type}
- Vehicles: ${Object.entries(ctx.vehicle_mix).filter(([,v]) => v && v > 0).map(([k,v]) => `${k} ${v}%`).join(", ")}`;

    return await callClaude(SYSTEM_PROMPTS.dailyBriefing, prompt);
  } catch (err) {
    console.error("[Claude] Briefing generation failed, using mock:", err);
    return mockGenerateBriefing(ctx);
  }
}

// ─── 3. Generate Consequence Narration ───
export async function generateConsequenceNarration(skipData: {
  amount: number;
  missed_future_value: number;
  days_added: number;
  old_eta: string;
  new_eta: string;
}): Promise<string> {
  if (USE_MOCK) {
    return `Skipping today's $${skipData.amount.toFixed(2)} means $${skipData.missed_future_value.toFixed(2)} in lost future growth. Your arrival moved ${skipData.days_added} days further. Tomorrow is a new day to get back on track.`;
  }

  try {
    const prompt = `The user skipped a $${skipData.amount.toFixed(2)} investment task today.
This will cost them $${skipData.missed_future_value.toFixed(2)} in future compound growth.
Their ETA moved from ${skipData.old_eta} to ${skipData.new_eta} (${skipData.days_added} more days).
Generate the consequence narration.`;

    return await callClaude(SYSTEM_PROMPTS.consequence, prompt);
  } catch (err) {
    console.error("[Claude] Consequence narration failed, using mock:", err);
    return `Skipping today's $${skipData.amount.toFixed(2)} means $${skipData.missed_future_value.toFixed(2)} in lost future growth. Tomorrow is a new day to get back on track.`;
  }
}
