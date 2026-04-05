"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Zap } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getEvents, getEventCounts, getDailyEventCounts, ensureSeeded } from "@/lib/analytics";

export default function AnalyticsPage() {
  const events = useMemo(() => { ensureSeeded(); return getEvents(); }, []);
  const counts = useMemo(() => getEventCounts(), []);
  const daily = useMemo(() => getDailyEventCounts(), []);

  // Event type chart data
  const eventTypeData = useMemo(() => {
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12)
      .map(([name, count]) => ({
        name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        count,
      }));
  }, [counts]);

  // Funnel data
  const funnel = useMemo(() => {
    const steps = [
      { name: "Onboarding Started", key: "onboarding_started" },
      { name: "Onboarding Completed", key: "onboarding_completed" },
      { name: "Path Selected", key: "path_selected" },
      { name: "Launchpad Done", key: "launchpad_completed" },
      { name: "First Task", key: "task_completed" },
    ];
    return steps.map((s) => ({
      name: s.name,
      count: counts[s.key] || 0,
    }));
  }, [counts]);

  // Pro upgrade sources
  const proSources = useMemo(() => {
    const proEvents = events.filter((e) => e.event_name === "pro_upgrade_clicked");
    const sources: Record<string, number> = {};
    proEvents.forEach((e) => {
      const src = (e.event_data.source as string) || "unknown";
      sources[src] = (sources[src] || 0) + 1;
    });
    return Object.entries(sources)
      .sort(([, a], [, b]) => b - a)
      .map(([source, count]) => ({ source, count }));
  }, [events]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Analytics
              <Badge variant="outline" className="text-[10px]">Internal</Badge>
            </h1>
            <p className="text-sm text-muted-foreground">{events.length} total events tracked</p>
          </div>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard icon={<Zap className="w-4 h-4" />} label="Total Events" value={events.length.toLocaleString()} />
        <SummaryCard icon={<Users className="w-4 h-4" />} label="Event Types" value={Object.keys(counts).length.toString()} />
        <SummaryCard icon={<TrendingUp className="w-4 h-4" />} label="Today" value={(counts[new Date().toISOString().split("T")[0]] || daily[daily.length - 1]?.count || 0).toString()} />
        <SummaryCard icon={<BarChart3 className="w-4 h-4" />} label="Avg/Day" value={daily.length > 0 ? Math.round(events.length / daily.length).toString() : "0"} />
      </div>

      {/* Daily activity */}
      <Card>
        <CardContent className="pt-5 pb-3">
          <h3 className="text-sm font-semibold mb-4">Daily Active Usage</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 18% 19%)" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(v) => v.slice(5)} stroke="hsl(215 18% 25%)" />
                <YAxis tick={{ fontSize: 9 }} stroke="hsl(215 18% 25%)" width={30} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(215 25% 9%)", border: "1px solid hsl(215 18% 19%)", borderRadius: "8px", fontSize: "11px" }} />
                <Line type="monotone" dataKey="count" stroke="hsl(142 64% 38%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by type */}
        <Card>
          <CardContent className="pt-5 pb-3">
            <h3 className="text-sm font-semibold mb-4">Events by Type (Top 12)</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 18% 19%)" />
                  <XAxis type="number" tick={{ fontSize: 9 }} stroke="hsl(215 18% 25%)" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} stroke="hsl(215 18% 25%)" width={130} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(215 25% 9%)", border: "1px solid hsl(215 18% 19%)", borderRadius: "8px", fontSize: "11px" }} />
                  <Bar dataKey="count" fill="hsl(211 80% 55%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Funnel */}
        <Card>
          <CardContent className="pt-5 pb-3">
            <h3 className="text-sm font-semibold mb-4">Conversion Funnel</h3>
            <div className="space-y-2">
              {funnel.map((step, i) => {
                const pct = funnel[0].count > 0 ? Math.round((step.count / funnel[0].count) * 100) : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>{step.name}</span>
                      <span className="text-muted-foreground tabular-nums">{step.count} ({pct}%)</span>
                    </div>
                    <div className="h-6 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg gradient-wealth transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pro upgrade sources */}
            <h3 className="text-sm font-semibold mt-6 mb-3">Pro Upgrade Sources</h3>
            <div className="space-y-2">
              {proSources.map((s) => (
                <div key={s.source} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                  <span className="capitalize">{s.source}</span>
                  <Badge variant="secondary" className="text-[10px] tabular-nums">{s.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="card-hover">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
        </div>
        <p className="text-xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
