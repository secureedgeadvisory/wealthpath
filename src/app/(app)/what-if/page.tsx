"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  ArrowRight,
  Minus,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { MOCK_GOAL, MOCK_SELECTED_PATH } from "@/lib/mock-data";

// ─── Compound Interest Calc ───
// FV of annuity: FV = PMT × [((1 + r)^n - 1) / r]
function calcFutureValue(dailyAmount: number, annualReturnPct: number, months: number): number {
  const days = months * 30;
  const r = annualReturnPct / 100 / 365;
  if (r <= 0) return dailyAmount * days;
  return dailyAmount * ((Math.pow(1 + r, days) - 1) / r);
}

// Calculate months needed to reach a target
function calcMonthsToTarget(dailyAmount: number, annualReturnPct: number, target: number): number {
  const r = annualReturnPct / 100 / 365;
  if (r <= 0) return Math.ceil(target / (dailyAmount * 30));
  // Solve: target = PMT × ((1+r)^n - 1) / r => n = log(target*r/PMT + 1) / log(1+r)
  const n = Math.log((target * r) / dailyAmount + 1) / Math.log(1 + r);
  return Math.ceil(n / 30);
}

// Generate growth curve data points
function generateGrowthCurve(
  dailyAmount: number,
  annualReturnPct: number,
  months: number,
  label: string
): { month: number; [key: string]: number | string }[] {
  const points: { month: number; [key: string]: number | string }[] = [];
  const step = Math.max(1, Math.floor(months / 60)); // Max 60 points
  for (let m = 0; m <= months; m += step) {
    points.push({
      month: m,
      [label]: Math.round(calcFutureValue(dailyAmount, annualReturnPct, m)),
    });
  }
  // Ensure final month is included
  if (points[points.length - 1]?.month !== months) {
    points.push({
      month: months,
      [label]: Math.round(calcFutureValue(dailyAmount, annualReturnPct, months)),
    });
  }
  return points;
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatMonths(m: number): string {
  const y = Math.floor(m / 12);
  const rem = m % 12;
  if (y === 0) return `${m}mo`;
  if (rem === 0) return `${y}y`;
  return `${y}y ${rem}mo`;
}

export default function WhatIfPage() {
  // Current plan values
  const currentDaily = MOCK_GOAL.daily_savings;
  const currentAnnualReturn = MOCK_SELECTED_PATH.monthly_return_pct * 12;
  const currentMonths = MOCK_SELECTED_PATH.projected_timeline_months;

  // Slider state
  const [daily, setDaily] = useState(currentDaily);
  const [annualReturn, setAnnualReturn] = useState(Math.round(currentAnnualReturn));
  const [timeframe, setTimeframe] = useState(currentMonths);

  // Calculate values
  const currentFV = useMemo(
    () => calcFutureValue(currentDaily, currentAnnualReturn, currentMonths),
    [currentDaily, currentAnnualReturn, currentMonths]
  );
  const whatIfFV = useMemo(
    () => calcFutureValue(daily, annualReturn, timeframe),
    [daily, annualReturn, timeframe]
  );

  const currentETA = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + currentMonths);
    return d;
  }, [currentMonths]);

  const monthsToGoal = useMemo(
    () => calcMonthsToTarget(daily, annualReturn, MOCK_GOAL.target_amount),
    [daily, annualReturn]
  );

  const monthsDiff = currentMonths - monthsToGoal;
  const fvDiff = whatIfFV - currentFV;
  const isBetter = whatIfFV > currentFV || monthsToGoal < currentMonths;
  const hasChanged = daily !== currentDaily || annualReturn !== Math.round(currentAnnualReturn) || timeframe !== currentMonths;

  // Chart data
  const chartData = useMemo(() => {
    const maxMonths = Math.max(currentMonths, timeframe);
    const currentCurve = generateGrowthCurve(currentDaily, currentAnnualReturn, maxMonths, "current");
    const whatIfCurve = generateGrowthCurve(daily, annualReturn, maxMonths, "whatif");

    // Merge on month
    const merged: Record<number, { month: number; current?: number; whatif?: number }> = {};
    currentCurve.forEach((p) => {
      merged[p.month] = { ...merged[p.month], month: p.month, current: p.current as number };
    });
    whatIfCurve.forEach((p) => {
      merged[p.month] = { ...merged[p.month], month: p.month, whatif: p.whatif as number };
    });

    return Object.values(merged).sort((a, b) => a.month - b.month);
  }, [currentDaily, currentAnnualReturn, currentMonths, daily, annualReturn, timeframe]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl gradient-wealth flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              What-If Scenarios
              <Badge className="bg-wealth-gold/15 text-wealth-gold border-wealth-gold/30 text-[10px]">
                PRO
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground">
              Drag the sliders and see your future change in real-time
            </p>
          </div>
        </div>
      </motion.div>

      {/* Current Plan Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-primary/20">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
              Your current plan
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground">Daily savings</p>
                <p className="text-sm font-bold">${currentDaily}/day</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Annual return</p>
                <p className="text-sm font-bold">{currentAnnualReturn.toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Timeline</p>
                <p className="text-sm font-bold">{formatMonths(currentMonths)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">ETA</p>
                <p className="text-sm font-bold">
                  {currentETA.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sliders */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardContent className="pt-5 pb-4 space-y-6">
            {/* Daily Savings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium">Daily savings</span>
                </div>
                <Badge variant="secondary" className="text-sm font-bold tabular-nums">
                  ${daily}/day
                </Badge>
              </div>
              <Slider
                value={[daily]}
                onValueChange={(v) => setDaily(Array.isArray(v) ? v[0] : v)}
                min={1}
                max={500}
                step={1}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>$1</span>
                <span>$250</span>
                <span>$500</span>
              </div>
            </div>

            {/* Annual Return */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">Expected annual return</span>
                </div>
                <Badge variant="secondary" className="text-sm font-bold tabular-nums">
                  {annualReturn}%
                </Badge>
              </div>
              <Slider
                value={[annualReturn]}
                onValueChange={(v) => setAnnualReturn(Array.isArray(v) ? v[0] : v)}
                min={3}
                max={60}
                step={1}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>3% (savings)</span>
                <span>15% (ETFs)</span>
                <span>60% (crypto)</span>
              </div>
            </div>

            {/* Timeframe */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium">Timeframe</span>
                </div>
                <Badge variant="secondary" className="text-sm font-bold tabular-nums">
                  {formatMonths(timeframe)}
                </Badge>
              </div>
              <Slider
                value={[timeframe]}
                onValueChange={(v) => setTimeframe(Array.isArray(v) ? v[0] : v)}
                min={6}
                max={240}
                step={1}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>6mo</span>
                <span>10y</span>
                <span>20y</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delta Cards */}
      {hasChanged && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <Card className={isBetter ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">End value</p>
              <p className={`text-xl font-bold mt-1 ${isBetter ? "text-emerald-400" : "text-red-400"}`}>
                {formatCurrency(whatIfFV)}
              </p>
              <div className={`flex items-center justify-center gap-1 mt-1 text-xs font-medium ${fvDiff >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {fvDiff >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {fvDiff >= 0 ? "+" : ""}{formatCurrency(fvDiff)} vs current
              </div>
            </CardContent>
          </Card>

          <Card className={monthsToGoal < currentMonths ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Goal in
              </p>
              <p className={`text-xl font-bold mt-1 ${monthsToGoal <= currentMonths ? "text-emerald-400" : "text-red-400"}`}>
                {formatMonths(monthsToGoal)}
              </p>
              <div className={`flex items-center justify-center gap-1 mt-1 text-xs font-medium ${monthsDiff > 0 ? "text-emerald-400" : monthsDiff < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                {monthsDiff > 0 ? <TrendingUp className="w-3 h-3" /> : monthsDiff < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {monthsDiff > 0 ? `${monthsDiff}mo faster` : monthsDiff < 0 ? `${Math.abs(monthsDiff)}mo slower` : "Same pace"}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">New ETA</p>
              <p className="text-xl font-bold mt-1">
                {new Date(Date.now() + monthsToGoal * 30 * 86400000).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                to reach {formatCurrency(MOCK_GOAL.target_amount)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardContent className="pt-5 pb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-4">
              Growth projection
            </p>
            <div className="h-[280px] -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "hsl(220 10% 55%)" }}
                    tickFormatter={(v) => (v === 0 ? "Now" : `${v}mo`)}
                    stroke="hsl(220 15% 25%)"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(220 10% 55%)" }}
                    tickFormatter={(v) => formatCurrency(v)}
                    stroke="hsl(220 15% 25%)"
                    width={55}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220 18% 11%)",
                      border: "1px solid hsl(220 15% 18%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name === "current" ? "Current plan" : "What-if plan",
                    ]}
                    labelFormatter={(label) => `Month ${label}`}
                  />
                  <Legend
                    formatter={(value) =>
                      value === "current" ? "Current plan" : "What-if plan"
                    }
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                  <ReferenceLine
                    y={MOCK_GOAL.target_amount}
                    stroke="hsl(142 60% 40%)"
                    strokeDasharray="8 4"
                    label={{
                      value: `Goal: ${formatCurrency(MOCK_GOAL.target_amount)}`,
                      fill: "hsl(142 60% 50%)",
                      fontSize: 10,
                      position: "right",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke="hsl(220 10% 45%)"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={false}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="whatif"
                    stroke={isBetter ? "hsl(142 60% 45%)" : "hsl(0 72% 50%)"}
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Apply button */}
      {hasChanged && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3"
        >
          <Button className="gradient-wealth text-white px-8 h-11">
            Apply this plan
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => {
              setDaily(currentDaily);
              setAnnualReturn(Math.round(currentAnnualReturn));
              setTimeframe(currentMonths);
            }}
          >
            Reset to current plan
          </Button>
        </motion.div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-xl border border-border bg-card">
        <AlertTriangle className="w-4 h-4 text-wealth-gold shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          These projections are for educational purposes only and use simplified
          compound interest models. Actual returns vary significantly. Past
          performance does not guarantee future results. This is not financial
          advice.
        </p>
      </div>
    </div>
  );
}
