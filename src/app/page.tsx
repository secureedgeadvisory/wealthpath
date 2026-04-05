"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  TrendingUp,
  Target,
  Flame,
  ArrowRight,
  Map,
  CheckCircle2,
  Zap,
  BarChart3,
  Brain,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Compound Interest Calc ───
function calcFV(daily: number, years: number, annualPct: number) {
  const r = annualPct / 100 / 365;
  const days = years * 365;
  if (r <= 0) return daily * days;
  return daily * ((Math.pow(1 + r, days) - 1) / r);
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${Math.round(n)}`;
}

// ─── Animated Number Counter ───
function AnimatedNumber({ value, prefix = "$" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = display;
    const diff = value - start;
    const steps = 30;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setDisplay(Math.round(start + (diff * step) / steps));
      if (step >= steps) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}{display.toLocaleString()}
    </span>
  );
}

// ─── Scroll-animated Section ───
function FadeInSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  // Interactive demo state
  const [dailySave, setDailySave] = useState(10);
  const [years, setYears] = useState(5);
  const [returnRate, setReturnRate] = useState(15);

  const futureValue = useMemo(() => calcFV(dailySave, years, returnRate), [dailySave, years, returnRate]);
  const totalInvested = dailySave * years * 365;
  const interestEarned = futureValue - totalInvested;

  // Chart data
  const chartData = useMemo(() => {
    const points = [];
    for (let y = 0; y <= years; y++) {
      points.push({
        year: y,
        value: Math.round(calcFV(dailySave, y, returnRate)),
        invested: dailySave * y * 365,
      });
    }
    return points;
  }, [dailySave, years, returnRate]);

  // Skip consequence demo
  const skipCost = useMemo(() => {
    const r = returnRate / 100 / 365;
    const remainingDays = years * 365;
    return dailySave * Math.pow(1 + r, remainingDays);
  }, [dailySave, years, returnRate]);

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/80 backdrop-blur-sm text-sm text-muted-foreground mb-8">
              <Flame className="w-4 h-4 text-orange-400 flame-animate" />
              Your financial journey starts here
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
          >
            Tell me your{" "}
            <span className="text-wealth-green">dream number</span>
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mt-2"
          >
            I&apos;ll show you the{" "}
            <span className="bg-clip-text text-transparent gradient-wealth">path</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed"
          >
            Set your wealth goal, choose your strategy, and get a personalized
            daily action plan. WealthPath walks with you every day until you arrive.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <Link href="/onboarding">
              <Button size="lg" className="gradient-wealth text-white px-8 h-13 text-base min-w-[220px] shadow-lg shadow-emerald-500/20">
                Start Your Journey
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-13 text-base min-w-[140px]">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center pt-2"
          >
            <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ INTERACTIVE DEMO — "See the math of discipline" ═══ */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeInSection className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-xs">Interactive Demo</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Small daily habits.{" "}
              <span className="text-wealth-green">Massive results.</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Drag the sliders and watch compound interest do its magic.
            </p>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-8">
              {/* Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">I can save</span>
                    <Badge variant="secondary" className="text-sm font-bold tabular-nums">${dailySave}/day</Badge>
                  </div>
                  <Slider
                    value={[dailySave]}
                    onValueChange={(v) => setDailySave(Array.isArray(v) ? v[0] : v)}
                    min={5}
                    max={100}
                    step={5}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>$5</span><span>$50</span><span>$100</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">For</span>
                    <Badge variant="secondary" className="text-sm font-bold tabular-nums">{years} year{years > 1 ? "s" : ""}</Badge>
                  </div>
                  <Slider
                    value={[years]}
                    onValueChange={(v) => setYears(Array.isArray(v) ? v[0] : v)}
                    min={1}
                    max={20}
                    step={1}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>1yr</span><span>10yr</span><span>20yr</span>
                  </div>
                </div>
              </div>

              {/* Risk toggle */}
              <div className="flex items-center justify-center gap-2">
                {([
                  { label: "Conservative", rate: 6, color: "text-blue-400" },
                  { label: "Moderate", rate: 15, color: "text-wealth-green" },
                  { label: "Aggressive", rate: 35, color: "text-wealth-gold" },
                ]).map((opt) => (
                  <button
                    key={opt.rate}
                    onClick={() => setReturnRate(opt.rate)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      returnRate === opt.rate
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {opt.label} ({opt.rate}%)
                  </button>
                ))}
              </div>

              {/* Result */}
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Your ${dailySave}/day becomes
                </p>
                <p className="text-4xl sm:text-5xl font-bold text-wealth-green mt-2 tabular-nums">
                  <AnimatedNumber value={Math.round(futureValue)} />
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  in {years} year{years > 1 ? "s" : ""}
                </p>
              </div>

              {/* Chart */}
              <div className="h-[200px] -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(142 64% 38%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(142 64% 38%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fill: "hsl(215 12% 54%)" }}
                      tickFormatter={(v) => `${v}y`}
                      stroke="hsl(215 18% 19%)"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "hsl(215 12% 54%)" }}
                      tickFormatter={(v) => formatCurrency(v)}
                      stroke="hsl(215 18% 19%)"
                      axisLine={false}
                      tickLine={false}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(215 25% 9%)",
                        border: "1px solid hsl(215 18% 19%)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [formatCurrency(Number(value)), "Portfolio"]}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(142 64% 38%)"
                      strokeWidth={2.5}
                      fill="url(#chartGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="invested"
                      stroke="hsl(215 12% 40%)"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total invested</p>
                  <p className="text-lg font-bold tabular-nums mt-0.5">{formatCurrency(totalInvested)}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Earned by compounding</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">{formatCurrency(interestEarned)}</p>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 sm:py-28 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <FadeInSection className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              How it works
            </h2>
            <p className="text-muted-foreground mt-3">Three steps to financial discipline</p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {([
              { icon: Target, title: "Set your dream", desc: "Tell us your number and your daily savings capacity. We handle the math.", color: "text-wealth-blue", delay: 0 },
              { icon: Map, title: "Pick your path", desc: "AI generates conservative, moderate, and aggressive strategies tailored to you.", color: "text-wealth-green", delay: 0.15 },
              { icon: CheckCircle2, title: "Follow the map", desc: "Complete daily tasks, watch your traveler move closer every single day.", color: "text-wealth-gold", delay: 0.3 },
            ]).map((step, i) => (
              <FadeInSection key={i} delay={step.delay}>
                <div className="rounded-2xl border border-border bg-card p-6 text-center card-hover h-full">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{step.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONSEQUENCE ENGINE DEMO ═══ */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-3xl mx-auto">
          <FadeInSection className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              What happens when you{" "}
              <span className="text-red-400">skip</span> a day?
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              WealthPath shows you the real cost of every missed day — and celebrates every win.
            </p>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <div className="rounded-2xl border border-red-500/20 bg-card p-6 sm:p-8">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                  <Zap className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">Skip consequence</span>
                </div>

                <p className="text-lg">
                  1 skipped day at <span className="font-bold">${dailySave}/day</span> =
                </p>
                <p className="text-4xl sm:text-5xl font-bold text-red-400 tabular-nums">
                  <AnimatedNumber value={Math.round(skipCost)} />
                </p>
                <p className="text-sm text-muted-foreground">
                  in lost future growth over {years} years
                </p>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                    That&apos;s not guilt — it&apos;s math. Every day you show up, compound interest rewards you.
                    Every day you skip, it costs more than you think. WealthPath makes this visible.
                  </p>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-20 sm:py-28 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need to{" "}
              <span className="text-wealth-green">stay on track</span>
            </h2>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {([
              { icon: Brain, title: "3 AI Paths", desc: "Conservative, moderate, or aggressive — AI generates strategies tailored to your risk tolerance.", color: "text-purple-400" },
              { icon: Flame, title: "Daily Streaks", desc: "Duolingo-style streaks that reward consistency. Don't break the chain.", color: "text-orange-400" },
              { icon: Map, title: "Live Journey Map", desc: "Watch your animated traveler move closer to your destination every single day.", color: "text-wealth-green" },
              { icon: Zap, title: "Consequence Engine", desc: "See the real compound cost of every skipped day. Factual, not scary.", color: "text-red-400" },
              { icon: BarChart3, title: "What-If Modeler", desc: "Drag sliders to see how changing your plan affects your timeline.", color: "text-wealth-blue" },
              { icon: Sparkles, title: "AI Co-pilot", desc: "Personalized daily briefings that keep you motivated and informed.", color: "text-wealth-gold" },
            ]).map((feature, i) => (
              <FadeInSection key={i} delay={i * 0.08}>
                <div className="rounded-2xl border border-border bg-card p-5 card-hover h-full">
                  <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3 ${feature.color}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{feature.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-20 sm:py-28 px-4">
        <FadeInSection>
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl gradient-wealth flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Your future self is counting on today
            </h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-lg mx-auto">
              Every millionaire started with a single deposit. Start yours now.
            </p>
            <Link href="/onboarding">
              <Button size="lg" className="gradient-wealth text-white px-10 h-14 text-lg mt-8 shadow-lg shadow-emerald-500/20">
                Start Your Journey
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </FadeInSection>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-wealth flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">WealthPath</span>
          </div>
          <p className="text-[11px] text-muted-foreground text-center max-w-lg">
            WealthPath is a financial education and planning tool. It does not provide
            financial advice. Projections are for educational purposes only. Past
            performance does not guarantee future results.
          </p>
        </div>
      </footer>
    </div>
  );
}
