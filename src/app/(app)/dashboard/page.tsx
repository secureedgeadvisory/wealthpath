"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JourneyMap } from "@/components/journey-map";
import { ConsequenceToast } from "@/components/consequence-toast";
import { SkipHistory } from "@/components/skip-history";
import { StreakCelebration, STREAK_MILESTONES } from "@/components/streak-celebration";
import { MilestoneCelebration } from "@/components/milestone-celebration";
import {
  calculateTaskCompletion,
  calculateSkipConsequence,
  type SkipConsequence,
  type SkipRecord,
} from "@/lib/consequence-engine";
import { generateDailyTasks } from "@/lib/task-generator";
import {
  MOCK_GOAL,
  MOCK_MILESTONES,
  MOCK_LATEST_SNAPSHOT,
  MOCK_STREAK,
  MOCK_SELECTED_PATH,
  MOCK_USER,
  MOCK_SKIP_RECORDS,
} from "@/lib/mock-data";
import { generateBriefing, generateRandomBriefing } from "@/lib/briefing-generator";
import {
  Flame,
  DollarSign,
  BookOpen,
  Eye,
  CheckCircle2,
  Check,
  TrendingUp,
  TrendingDown,
  Calendar,
  Hourglass,
  Sparkles,
  Lock,
  AlertTriangle,
  CheckCheck,
  SkipForward,
  History,
} from "lucide-react";
import confetti from "canvas-confetti";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import type { DailyTask, JourneySnapshot, Milestone } from "@/types";

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

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getToday(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<DailyTask[]>(() =>
    generateDailyTasks(MOCK_SELECTED_PATH, MOCK_GOAL, new Date().toISOString().split("T")[0])
  );
  const [streak, setStreak] = useState(MOCK_STREAK.current_streak);
  const [allDoneTriggered, setAllDoneTriggered] = useState(false);
  const [snapshot, setSnapshot] = useState<JourneySnapshot>(MOCK_LATEST_SNAPSHOT);
  const [dailyChange, setDailyChange] = useState(0);

  // Consequence state
  const [activeConsequence, setActiveConsequence] = useState<SkipConsequence | null>(null);
  const [skipRecords, setSkipRecords] = useState<SkipRecord[]>(MOCK_SKIP_RECORDS);
  const [showSkipHistory, setShowSkipHistory] = useState(false);
  const [etaShake, setEtaShake] = useState(false);
  const consequenceTimer = useRef<ReturnType<typeof setTimeout>>();

  // Celebration state
  const [streakCelebration, setStreakCelebration] = useState<number | null>(null);
  const [milestoneCelebration, setMilestoneCelebration] = useState<Milestone | null>(null);
  const [milestones, setMilestones] = useState(MOCK_MILESTONES);

  // Briefing
  const [briefingText, setBriefingText] = useState(() =>
    generateBriefing({
      goal_amount: MOCK_GOAL.target_amount,
      daily_savings: MOCK_GOAL.daily_savings,
      vehicle_mix: MOCK_SELECTED_PATH.vehicle_mix,
      progress_pct: 100 - MOCK_LATEST_SNAPSHOT.distance_remaining_pct,
      streak_days: MOCK_STREAK.current_streak,
      recent_skips: 1,
      path_type: MOCK_SELECTED_PATH.path_type,
      portfolio_value: MOCK_LATEST_SNAPSHOT.portfolio_value,
    })
  );
  const [isPro] = useState(true); // TODO: flip to false for Free users

  const refreshBriefing = () => {
    setBriefingText(
      generateRandomBriefing({
        goal_amount: MOCK_GOAL.target_amount,
        daily_savings: MOCK_GOAL.daily_savings,
        vehicle_mix: MOCK_SELECTED_PATH.vehicle_mix,
        progress_pct: 100 - snapshot.distance_remaining_pct,
        streak_days: streak,
        recent_skips: skipRecords.length,
        path_type: MOCK_SELECTED_PATH.path_type,
        portfolio_value: snapshot.portfolio_value,
      })
    );
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const totalCount = tasks.length;
  const allDone = completedCount === totalCount;

  // Yesterday's skipped
  const skippedYesterday = 1;
  const consequenceDays = 8;

  const monthlyTarget = Math.round(MOCK_GOAL.daily_savings * 30);
  const daysToGoal = Math.max(
    0,
    Math.ceil((new Date(snapshot.eta_date).getTime() - Date.now()) / 86400000)
  );

  // Check if a milestone was crossed
  const checkMilestones = useCallback((newValue: number) => {
    setMilestones((prev) => {
      const unreached = prev.filter((m) => !m.reached_at && m.target_value <= newValue);
      if (unreached.length === 0) return prev;

      // Celebrate the highest crossed milestone
      const highest = unreached.reduce((a, b) => (a.target_value > b.target_value ? a : b));
      setTimeout(() => setMilestoneCelebration(highest), 500);

      return prev.map((m) =>
        unreached.find((u) => u.id === m.id)
          ? { ...m, reached_at: new Date().toISOString(), is_celebrated: true }
          : m
      );
    });
  }, []);

  // Check if streak hit a celebration milestone
  const checkStreakCelebration = useCallback((newStreak: number) => {
    if (STREAK_MILESTONES.includes(newStreak)) {
      setTimeout(() => setStreakCelebration(newStreak), 800);
    }
  }, []);

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#22c55e", "#3b82f6", "#f59e0b", "#a855f7"],
    });
  }, []);

  // ─── Task Complete Handler ───
  const handleTaskComplete = useCallback(
    (taskId: string) => {
      setTasks((prev) => {
        const task = prev.find((t) => t.id === taskId);
        if (!task || task.is_completed) return prev;

        // Calculate new snapshot
        if (task.task_type === "dca" && task.amount) {
          const result = calculateTaskCompletion(task, MOCK_SELECTED_PATH, snapshot, MOCK_GOAL);
          setDailyChange((d) => d + result.daily_growth);
          setSnapshot((s) => ({
            ...s,
            portfolio_value: result.portfolio_value,
            distance_remaining_pct: result.distance_remaining_pct,
            eta_date: result.eta_date,
          }));
          // Check if portfolio crossed a milestone
          checkMilestones(result.portfolio_value);
          trackEvent("task_completed", { task_type: task.task_type, amount: task.amount });
        }

        const updated = prev.map((t) =>
          t.id === taskId
            ? { ...t, is_completed: true, completed_at: new Date().toISOString() }
            : t
        );

        const nowAllDone = updated.every((t) => t.is_completed);
        if (nowAllDone && !allDoneTriggered) {
          setAllDoneTriggered(true);
          const newStreak = streak + 1;
          setStreak(newStreak);
          setTimeout(() => {
            fireConfetti();
            toast.success("All done! Your traveler moved forward today.", { icon: "🎉" });
            trackEvent("all_tasks_completed", { date: new Date().toISOString().split("T")[0], task_count: updated.length });
          }, 300);
          checkStreakCelebration(newStreak);
        }

        return updated;
      });
    },
    [snapshot, streak, allDoneTriggered, fireConfetti, checkMilestones, checkStreakCelebration]
  );

  // ─── Task Skip Handler ───
  const handleTaskSkip = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.is_completed || !task.amount) return;

      // Calculate consequence
      const consequence = calculateSkipConsequence(task, MOCK_SELECTED_PATH, snapshot, MOCK_GOAL);

      // Update task as skipped
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                skipped_at: new Date().toISOString(),
                is_completed: true, // Mark done so it's no longer actionable
                consequence_days: consequence.days_added,
              }
            : t
        )
      );

      // Update snapshot ETA
      setSnapshot((s) => ({ ...s, eta_date: consequence.new_eta }));

      // Shake the ETA card
      setEtaShake(true);
      setTimeout(() => setEtaShake(false), 600);

      // Record the skip
      setSkipRecords((prev) => [
        {
          task_id: task.id,
          date: task.date,
          description: task.description,
          amount: task.amount!,
          missed_future_value: consequence.missed_future_value,
          days_added: consequence.days_added,
          skipped_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      // Track skip
      trackEvent("task_skipped", { task_type: task.task_type, amount: task.amount, consequence_days: consequence.days_added });

      // Show consequence toast
      setActiveConsequence(consequence);
      if (consequenceTimer.current) clearTimeout(consequenceTimer.current);
      consequenceTimer.current = setTimeout(() => setActiveConsequence(null), 5000);
    },
    [tasks, snapshot]
  );

  // ─── Complete All ───
  const handleCompleteAll = useCallback(() => {
    tasks.forEach((t) => {
      if (!t.is_completed) handleTaskComplete(t.id);
    });
  }, [tasks, handleTaskComplete]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 pb-24 sm:pb-6">
      {/* ─── 1. Greeting Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {getGreeting()}, {MOCK_USER.name}
            {streak > 0 && (
              <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30 gap-1 text-xs">
                <Flame className={`w-3.5 h-3.5 ${streak >= 100 ? "flame-legendary" : streak >= 30 ? "flame-intense" : streak >= 7 ? "flame-medium" : "flame-animate"}`} />
                {streak}
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{getToday()}</p>
        </div>
        {skipRecords.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSkipHistory(true)}
            className="text-xs text-muted-foreground gap-1"
          >
            <History className="w-3.5 h-3.5" />
            Skip history
          </Button>
        )}
      </motion.div>

      {/* ─── Skipped Warning ─── */}
      {skippedYesterday > 0 && !allDone && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 border-l-amber-500 border border-amber-500/20 bg-[#FFF8E1] dark:bg-[#3D2800]">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm text-[#7A4100] dark:text-[#FCD34D]">
              You missed{" "}
              <span className="font-bold">
                {skippedYesterday} task{skippedYesterday > 1 ? "s" : ""}
              </span>{" "}
              yesterday. Your ETA moved by{" "}
              <span className="font-bold">{consequenceDays} days</span>.
              <button
                className="underline ml-1 font-bold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
                onClick={() => setShowSkipHistory(true)}
              >
                View impact
              </button>
            </p>
          </div>
        </motion.div>
      )}

      {/* ─── 2. Journey Map (compact) ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="cursor-pointer"
        onClick={() => router.push("/journey")}
      >
        <JourneyMap
          goal={MOCK_GOAL}
          snapshot={snapshot}
          milestones={MOCK_MILESTONES}
          streak={streak}
          variant="compact"
        />
      </motion.div>

      {/* ─── 3. Today's Tasks ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold">Today&apos;s Tasks</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {completedCount}/{totalCount} completed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {Math.round((completedCount / totalCount) * 100)}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {tasks.map((task, i) => {
                  const isSkipped = !!task.skipped_at;
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.05 }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                        isSkipped
                          ? "border-red-500/15 bg-red-500/5"
                          : task.is_completed
                          ? "border-emerald-500/15 bg-emerald-500/5"
                          : "border-border bg-card hover:bg-accent/50"
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
                            task.is_completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {task.description}
                        </p>
                        {task.amount && !isSkipped && (
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

                      {/* Actions */}
                      {!task.is_completed && !isSkipped ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Skip button (DCA tasks only) */}
                          {task.task_type === "dca" && task.amount && (
                            <button
                              onClick={() => handleTaskSkip(task.id)}
                              className="text-[11px] text-muted-foreground hover:text-red-400 transition-colors px-1.5 py-0.5 rounded"
                            >
                              <SkipForward className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* Complete checkbox */}
                          <button
                            onClick={() => handleTaskComplete(task.id)}
                            className="w-7 h-7 rounded-full border-2 border-muted-foreground/30 hover:border-primary flex items-center justify-center transition-all"
                          >
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            isSkipped
                              ? "border-2 border-red-500/30 bg-red-500/10"
                              : "border-2 border-emerald-500 bg-emerald-500"
                          }`}
                        >
                          {isSkipped ? (
                            <SkipForward className="w-3 h-3 text-red-400" />
                          ) : (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            >
                              <Check className="w-3.5 h-3.5 text-white" />
                            </motion.div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {allDone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 text-center py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shine-effect"
              >
                <p className="text-sm font-semibold text-emerald-400 dark:text-emerald-300">
                  All tasks complete! Your traveler moved forward today.
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── 4. Metrics Row ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <MetricCard
          icon={<DollarSign className="w-3.5 h-3.5" />}
          label="Portfolio value"
          value={`$${snapshot.portfolio_value.toLocaleString()}`}
          change={dailyChange}
          accentColor="border-t-emerald-500"
        />
        <MetricCard
          icon={<Calendar className="w-3.5 h-3.5" />}
          label="Monthly target"
          value={`$${monthlyTarget.toLocaleString()}`}
          accentColor="border-t-blue-500"
        />
        <motion.div animate={etaShake ? { x: [-4, 4, -4, 4, 0] } : {}} transition={{ duration: 0.4 }}>
          <MetricCard
            icon={<Hourglass className="w-3.5 h-3.5" />}
            label="Days to goal"
            accentColor="border-t-amber-500"
            value={daysToGoal.toLocaleString()}
            sub="days"
          />
        </motion.div>
      </motion.div>

      {/* ─── 5. AI Briefing ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="relative overflow-hidden border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 pointer-events-none" />
          <CardContent className="pt-5 pb-4 relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg gradient-wealth flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="text-sm font-semibold">AI Co-pilot</h3>
              {!isPro && (
                <Badge className="bg-wealth-gold/15 text-wealth-gold border-wealth-gold/30 text-[10px] ml-auto">
                  PRO
                </Badge>
              )}
              {isPro && (
                <button
                  onClick={refreshBriefing}
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Refresh insight
                </button>
              )}
            </div>
            <div className="relative">
              <p className={`text-sm leading-relaxed ${isPro ? "text-foreground" : "text-muted-foreground blur-[6px] select-none pointer-events-none"}`}>
                {briefingText}
              </p>
              {!isPro && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/40 backdrop-blur-[1px] rounded-lg">
                  <Lock className="w-5 h-5 text-muted-foreground mb-2" />
                  <Button size="sm" className="gradient-wealth text-white text-xs px-4 h-8">
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    Unlock AI Co-pilot — Go Pro
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── FAB: Complete All (mobile) ─── */}
      {!allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-24 right-5 lg:hidden z-50"
        >
          <Button
            onClick={handleCompleteAll}
            className="w-14 h-14 rounded-full gradient-wealth text-white shadow-lg shadow-emerald-500/25 p-0"
          >
            <CheckCheck className="w-6 h-6" />
          </Button>
        </motion.div>
      )}

      {/* ─── Consequence Toast ─── */}
      <AnimatePresence>
        {activeConsequence && (
          <ConsequenceToast
            consequence={activeConsequence}
            onDismiss={() => setActiveConsequence(null)}
          />
        )}
      </AnimatePresence>

      {/* ─── Skip History Modal ─── */}
      <SkipHistory
        open={showSkipHistory}
        onClose={() => setShowSkipHistory(false)}
        records={skipRecords}
      />

      {/* ─── Streak Celebration ─── */}
      <StreakCelebration
        streak={streakCelebration || 0}
        open={streakCelebration !== null}
        onClose={() => setStreakCelebration(null)}
      />

      {/* ─── Milestone Celebration ─── */}
      <MilestoneCelebration
        milestone={milestoneCelebration}
        goal={MOCK_GOAL}
        streak={streak}
        open={milestoneCelebration !== null}
        onClose={() => setMilestoneCelebration(null)}
      />

      {/* ─── Dev: Simulate Milestone (dev only) ─── */}
      {process.env.NODE_ENV === "development" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-6 left-6 z-40"
        >
          <Button
            variant="outline"
            size="sm"
            className="text-[10px] opacity-50 hover:opacity-100"
            onClick={() => {
              const ms = milestones.find((m) => m.target_value === 1000) || milestones[0];
              setMilestoneCelebration(ms);
            }}
          >
            🧪 Simulate $1K milestone
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  change,
  sub,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: number;
  sub?: string;
  accentColor?: string;
}) {
  return (
    <Card className={`h-full card-hover ${accentColor ? `border-t-2 ${accentColor}` : ""}`}>
      <CardContent className="pt-4 pb-3 h-full flex flex-col">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
            {label}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-lg font-bold tabular-nums">{value}</p>
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        </div>
        <div className="mt-auto pt-1 min-h-[18px]">
        {change !== undefined && change !== 0 && (
          <div
            className={`flex items-center gap-0.5 mt-1 text-[11px] font-medium ${
              change >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {change >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change >= 0 ? "+" : ""}${Math.abs(change).toFixed(2)} today
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  );
}
