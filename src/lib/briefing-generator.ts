// ─── AI Daily Briefing Generator ───
// Mock Claude API — generates contextual daily briefings
// Swap for real Claude API call later

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

type BriefingTemplate = {
  condition: (ctx: BriefingContext) => boolean;
  generate: (ctx: BriefingContext) => string;
};

const vehicleList = (mix: Record<string, number | undefined>) =>
  Object.entries(mix)
    .filter(([, v]) => v && v > 0)
    .map(([k]) => k)
    .join(", ");

const vehicleCount = (mix: Record<string, number | undefined>) =>
  Object.entries(mix).filter(([, v]) => v && v > 0).length;

const topVehicle = (mix: Record<string, number | undefined>) => {
  const sorted = Object.entries(mix)
    .filter(([, v]) => v && v > 0)
    .sort(([, a], [, b]) => (b || 0) - (a || 0));
  return sorted[0]?.[0] || "investments";
};

const TEMPLATES: BriefingTemplate[] = [
  // Streak milestones
  {
    condition: (ctx) => ctx.streak_days === 7,
    generate: (ctx) =>
      `One week streak! Only 8% of people maintain a daily financial habit past 7 days. Your ${topVehicle(ctx.vehicle_mix)} allocation is quietly compounding. Keep this energy.`,
  },
  {
    condition: (ctx) => ctx.streak_days === 30,
    generate: () =>
      `30-day streak! You've built a real habit now. Research shows it takes 21 days to form a habit — you've crushed that. The compounding is just getting started.`,
  },
  {
    condition: (ctx) => ctx.streak_days === 100,
    generate: (ctx) =>
      `100 days! Triple digits of daily discipline. Your $${ctx.portfolio_value.toLocaleString()} portfolio didn't build itself — you showed up every single day. Legendary.`,
  },
  // Streak broken
  {
    condition: (ctx) => ctx.streak_days === 0 && ctx.recent_skips > 0,
    generate: (ctx) =>
      `Fresh start today. Missing a day doesn't erase your progress — you're still ${ctx.progress_pct.toFixed(1)}% of the way there. One task at a time. Your money from previous days is still compounding.`,
  },
  {
    condition: (ctx) => ctx.streak_days === 1 && ctx.recent_skips > 0,
    generate: () =>
      `Welcome back! Yesterday was day one of your comeback. The best investors aren't the ones who never miss — they're the ones who always come back. You're back.`,
  },
  // High streak
  {
    condition: (ctx) => ctx.streak_days > 14,
    generate: (ctx) =>
      `Day ${ctx.streak_days} of your streak! Consistency like this is rare. Your ${topVehicle(ctx.vehicle_mix)} allocation is quietly compounding while you sleep. That's the beauty of DCA.`,
  },
  {
    condition: (ctx) => ctx.streak_days > 7,
    generate: (ctx) =>
      `${ctx.streak_days} days strong! At $${ctx.daily_savings}/day, you've invested $${(ctx.streak_days * ctx.daily_savings).toLocaleString()} just this streak alone. Small deposits, big future.`,
  },
  // Progress milestones
  {
    condition: (ctx) => ctx.progress_pct >= 50,
    generate: (ctx) =>
      `Halfway point — ${ctx.progress_pct.toFixed(1)}%! The second half goes faster because your money is doing more of the work now. Compound interest is your silent partner.`,
  },
  {
    condition: (ctx) => ctx.progress_pct >= 25,
    generate: (ctx) =>
      `Quarter of the way! $${ctx.portfolio_value.toLocaleString()} and climbing. Your ${ctx.path_type} path is performing as expected. Stay the course — the magic is in the consistency.`,
  },
  {
    condition: (ctx) => ctx.progress_pct >= 10,
    generate: (ctx) =>
      `Double digits — ${ctx.progress_pct.toFixed(1)}% complete! At this pace, your goal is looking very achievable. Every day you show up, you're proving the math right.`,
  },
  // Day of week variations
  {
    condition: () => new Date().getDay() === 1, // Monday
    generate: (ctx) =>
      `New week, new momentum. Your ${ctx.path_type} path has you investing $${ctx.daily_savings} today across ${vehicleCount(ctx.vehicle_mix)} vehicles. Small moves, big results. Let's make it a perfect week.`,
  },
  {
    condition: () => new Date().getDay() === 5, // Friday
    generate: (ctx) =>
      `Friday focus! One more day of investing before the weekend. Your portfolio at $${ctx.portfolio_value.toLocaleString()} has grown while the market worked for you all week. Finish strong.`,
  },
  {
    condition: () => new Date().getDay() === 0, // Sunday
    generate: () =>
      `Sunday reflection. Today's your weekly review — check your accounts, update your portfolio value, and see how far you've come. The numbers tell the real story.`,
  },
  // Market context (random flavor)
  {
    condition: () => new Date().getMinutes() % 3 === 0,
    generate: (ctx) =>
      `Markets move daily — your strategy doesn't have to. DCA means you buy more when prices dip and less when they peak. Your ${topVehicle(ctx.vehicle_mix)} position benefits from this automatically.`,
  },
  // Default / catch-all
  {
    condition: () => true,
    generate: (ctx) =>
      `Day ${ctx.streak_days > 0 ? ctx.streak_days : "1"} — you're ${ctx.progress_pct.toFixed(1)}% of the way to $${ctx.goal_amount.toLocaleString()}. Today's $${ctx.daily_savings} splits across ${vehicleList(ctx.vehicle_mix)}. Discipline is the bridge between goals and results.`,
  },
];

export function generateBriefing(ctx: BriefingContext): string {
  // Find first matching template
  const template = TEMPLATES.find((t) => t.condition(ctx));
  return template ? template.generate(ctx) : TEMPLATES[TEMPLATES.length - 1].generate(ctx);
}

export function generateRandomBriefing(ctx: BriefingContext): string {
  // Get all matching templates and pick a random one
  const matching = TEMPLATES.filter((t) => t.condition(ctx));
  if (matching.length === 0) return TEMPLATES[TEMPLATES.length - 1].generate(ctx);
  const idx = Math.floor(Math.random() * matching.length);
  return matching[idx].generate(ctx);
}
