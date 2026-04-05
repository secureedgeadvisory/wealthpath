// ─── Analytics Tracking ───
// Mock store — will connect to Supabase later

export interface AnalyticsEvent {
  id: string;
  event_name: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

// In-memory store
const events: AnalyticsEvent[] = [];

export function trackEvent(eventName: string, eventData: Record<string, unknown> = {}) {
  const event: AnalyticsEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    event_name: eventName,
    event_data: eventData,
    created_at: new Date().toISOString(),
  };
  events.push(event);

  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${eventName}`, eventData);
  }

  // Fire-and-forget to API
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  }).catch(() => {
    // Queue for retry — offline support
  });
}

export function getEvents(): AnalyticsEvent[] {
  return [...events];
}

export function getEventsByName(name: string): AnalyticsEvent[] {
  return events.filter((e) => e.event_name === name);
}

export function getEventCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  events.forEach((e) => {
    counts[e.event_name] = (counts[e.event_name] || 0) + 1;
  });
  return counts;
}

export function getDailyEventCounts(): { date: string; count: number }[] {
  const daily: Record<string, number> = {};
  events.forEach((e) => {
    const date = e.created_at.split("T")[0];
    daily[date] = (daily[date] || 0) + 1;
  });
  return Object.entries(daily)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Seed mock events — only on client to avoid hydration mismatch
let seeded = false;
export function ensureSeeded() {
  if (seeded) return;
  seeded = true;

  const refDate = new Date("2026-04-05T00:00:00Z");
  const eventTypes = [
    "onboarding_started", "onboarding_completed", "path_selected",
    "launchpad_completed", "task_completed", "task_skipped",
    "all_tasks_completed", "journey_map_viewed", "what_if_used",
    "pro_upgrade_clicked", "pro_cta_viewed", "skip_history_viewed",
    "theme_toggled", "settings_changed", "streak_milestone",
  ];

  for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
    const d = new Date(refDate.getTime() - daysAgo * 86400000);
    const dateStr = d.toISOString();
    const dailyCount = 3 + ((daysAgo * 7 + 3) % 8);

    for (let i = 0; i < dailyCount; i++) {
      const type = eventTypes[(daysAgo * 3 + i * 7) % eventTypes.length];
      events.push({
        id: `seed-${daysAgo}-${i}`,
        event_name: type,
        event_data: { source: "mock" },
        created_at: dateStr,
      });
    }
  }

  const ts = refDate.toISOString();
  for (let i = 0; i < 100; i++) events.push({ id: `f1-${i}`, event_name: "onboarding_started", event_data: {}, created_at: ts });
  for (let i = 0; i < 72; i++) events.push({ id: `f2-${i}`, event_name: "onboarding_completed", event_data: {}, created_at: ts });
  for (let i = 0; i < 65; i++) events.push({ id: `f3-${i}`, event_name: "path_selected", event_data: {}, created_at: ts });
  for (let i = 0; i < 48; i++) events.push({ id: `f4-${i}`, event_name: "launchpad_completed", event_data: {}, created_at: ts });
  for (let i = 0; i < 40; i++) events.push({ id: `f5-${i}`, event_name: "task_completed", event_data: { first: true }, created_at: ts });
  for (let i = 0; i < 15; i++) events.push({ id: `pro-${i}`, event_name: "pro_upgrade_clicked", event_data: { source: "dashboard" }, created_at: ts });
  for (let i = 0; i < 8; i++) events.push({ id: `pro2-${i}`, event_name: "pro_upgrade_clicked", event_data: { source: "what-if" }, created_at: ts });
  for (let i = 0; i < 5; i++) events.push({ id: `pro3-${i}`, event_name: "pro_upgrade_clicked", event_data: { source: "briefing" }, created_at: ts });
}
