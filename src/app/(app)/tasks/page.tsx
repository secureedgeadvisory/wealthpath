"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  BookOpen,
  Eye,
  CheckCircle2,
  Check,
  SkipForward,
  Calendar,
} from "lucide-react";
import { MOCK_GOAL, MOCK_SELECTED_PATH } from "@/lib/mock-data";
import { generateMockHistory, getDayStatus, type DayStatus } from "@/lib/task-generator";
import type { DailyTask } from "@/types";

const TASK_ICONS: Record<string, React.ReactNode> = {
  dca: <DollarSign className="w-4 h-4" />,
  learn: <BookOpen className="w-4 h-4" />,
  review: <Eye className="w-4 h-4" />,
  check: <CheckCircle2 className="w-4 h-4" />,
};

const TASK_COLORS: Record<string, string> = {
  dca: "text-emerald-400 bg-emerald-400/10",
  learn: "text-blue-400 bg-blue-400/10",
  review: "text-purple-400 bg-purple-400/10",
  check: "text-amber-400 bg-amber-400/10",
};

const STATUS_COLORS: Record<DayStatus, string> = {
  perfect: "bg-emerald-500",
  partial: "bg-amber-500",
  missed: "bg-red-500",
  future: "bg-muted",
  empty: "bg-transparent",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function TasksPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );

  // Generate 60 days of mock history
  const allTasks = useMemo(
    () => generateMockHistory(MOCK_SELECTED_PATH, MOCK_GOAL, 60),
    []
  );

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const map: Record<string, DailyTask[]> = {};
    allTasks.forEach((t) => {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return map;
  }, [allTasks]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentMonth.year, currentMonth.month, 1);
    const lastDay = new Date(currentMonth.year, currentMonth.month + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const today = new Date().toISOString().split("T")[0];

    const days: {
      date: string;
      day: number;
      status: DayStatus;
      isToday: boolean;
      isCurrentMonth: boolean;
    }[] = [];

    // Padding days from previous month
    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(currentMonth.year, currentMonth.month, -i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        day: d.getDate(),
        status: getDayStatus(tasksByDate[dateStr] || []),
        isToday: dateStr === today,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(currentMonth.year, currentMonth.month, day);
      const dateStr = d.toISOString().split("T")[0];
      const isFuture = d > new Date();
      const tasks = tasksByDate[dateStr] || [];
      const status = isFuture ? "future" : getDayStatus(tasks);

      days.push({
        date: dateStr,
        day,
        status,
        isToday: dateStr === today,
        isCurrentMonth: true,
      });
    }

    return days;
  }, [currentMonth, tasksByDate]);

  // Month stats
  const monthStats = useMemo(() => {
    const monthDays = calendarDays.filter((d) => d.isCurrentMonth && d.status !== "future");
    const perfect = monthDays.filter((d) => d.status === "perfect").length;
    const partial = monthDays.filter((d) => d.status === "partial").length;
    const missed = monthDays.filter((d) => d.status === "missed").length;
    const total = monthDays.filter((d) => d.status !== "empty").length;
    const rate = total > 0 ? Math.round((perfect / total) * 100) : 0;
    return { perfect, partial, missed, total, rate };
  }, [calendarDays]);

  const selectedTasks = tasksByDate[selectedDate] || [];

  const prevMonth = () =>
    setCurrentMonth((p) => {
      const d = new Date(p.year, p.month - 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const nextMonth = () =>
    setCurrentMonth((p) => {
      const d = new Date(p.year, p.month + 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-wealth flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Task History</h1>
            <p className="text-sm text-muted-foreground">Your daily discipline, visualized</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatPill label="Perfect days" value={monthStats.perfect} color="text-emerald-400" dot="bg-emerald-500" />
          <StatPill label="Partial" value={monthStats.partial} color="text-amber-400" dot="bg-amber-500" />
          <StatPill label="Missed" value={monthStats.missed} color="text-red-400" dot="bg-red-500" />
          <StatPill label="Completion" value={`${monthStats.rate}%`} color="text-foreground" />
        </div>
      </motion.div>

      {/* Calendar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardContent className="pt-5 pb-4">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" onClick={prevMonth} className="w-8 h-8 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-sm font-semibold">
                {MONTHS[currentMonth.month]} {currentMonth.year}
              </h2>
              <Button variant="ghost" size="sm" onClick={nextMonth} className="w-8 h-8 p-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">
                  <span className="sm:hidden">{d[0]}</span>
                  <span className="hidden sm:inline">{d}</span>
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const isSelected = day.date === selectedDate;
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all ${
                      !day.isCurrentMonth
                        ? "opacity-30"
                        : isSelected
                        ? "ring-2 ring-primary bg-accent"
                        : day.isToday
                        ? "ring-2 ring-primary/50"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <span className={`font-medium ${day.isToday ? "text-primary" : ""}`}>
                      {day.day}
                    </span>
                    {day.status !== "future" && day.status !== "empty" && day.isCurrentMonth && (
                      <span
                        className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${STATUS_COLORS[day.status]}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border">
              {(["perfect", "partial", "missed"] as const).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[s]}`} />
                  <span className="text-[10px] text-muted-foreground capitalize">{s}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Selected Day Tasks */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              {selectedDate === new Date().toISOString().split("T")[0] && (
                <Badge variant="outline" className="text-[10px]">Today</Badge>
              )}
            </div>

            {selectedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No tasks for this date.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedTasks.map((task) => {
                  const isSkipped = !!task.skipped_at;
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                        isSkipped
                          ? "border-red-500/15 bg-red-500/5"
                          : task.is_completed
                          ? "border-emerald-500/15 bg-emerald-500/5"
                          : "border-border bg-card"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          TASK_COLORS[task.task_type]
                        }`}
                      >
                        {TASK_ICONS[task.task_type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            task.is_completed ? "text-muted-foreground line-through" : ""
                          }`}
                        >
                          {task.description}
                        </p>
                        {task.amount && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            ${task.amount.toFixed(2)}
                          </p>
                        )}
                        {isSkipped && task.consequence_days && (
                          <p className="text-[11px] text-red-400 mt-0.5">
                            Skipped — +{task.consequence_days} days added
                          </p>
                        )}
                      </div>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          isSkipped
                            ? "border-2 border-red-500/30 bg-red-500/10"
                            : task.is_completed
                            ? "border-2 border-emerald-500 bg-emerald-500"
                            : "border-2 border-muted-foreground/20"
                        }`}
                      >
                        {isSkipped ? (
                          <SkipForward className="w-3 h-3 text-red-400" />
                        ) : task.is_completed ? (
                          <Check className="w-3.5 h-3.5 text-white" />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatPill({
  label,
  value,
  color,
  dot,
}: {
  label: string;
  value: number | string;
  color: string;
  dot?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-3 pb-2 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
          <span className="text-[10px] text-muted-foreground">{label}</span>
        </div>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
