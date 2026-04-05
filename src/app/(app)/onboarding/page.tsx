"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Bike,
  Rocket,
  TrendingUp,
} from "lucide-react";

type RiskProfile = "conservative" | "moderate" | "aggressive";

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "AED", symbol: "د.إ" },
  { code: "INR", symbol: "₹" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
];

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [currency, setCurrency] = useState("USD");
  const [targetAmount, setTargetAmount] = useState(100000);
  const [targetInput, setTargetInput] = useState("100,000");
  const [timeframeMonths, setTimeframeMonths] = useState(60);

  // Step 2
  const [dailySavings, setDailySavings] = useState(25);

  // Step 3
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);

  const sym = CURRENCIES.find((c) => c.code === currency)!.symbol;

  const fmt = useCallback((n: number) => n.toLocaleString("en-US"), []);

  const handleAmountChange = (value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, "")) || 0;
    const clamped = Math.min(num, 10000000);
    setTargetAmount(clamped);
    setTargetInput(clamped > 0 ? fmt(clamped) : "");
  };

  const tfLabel = (m: number) => {
    if (m < 12) return `${m} months`;
    const y = Math.floor(m / 12);
    const r = m % 12;
    return r === 0 ? `${y} year${y > 1 ? "s" : ""}` : `${y}y ${r}m`;
  };

  const canProceed =
    step === 1
      ? targetAmount >= 1000 && timeframeMonths >= 6
      : step === 2
      ? dailySavings >= 1
      : riskProfile !== null;

  const goNext = () => {
    if (!canProceed) return;
    if (step === 3) {
      setLoading(true);
      setTimeout(() => router.push("/paths"), 2500);
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  // ─── Loading Screen ───
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-20 h-20 rounded-2xl gradient-wealth flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h2 className="text-xl font-bold">Mapping your journey...</h2>
          <p className="text-sm text-muted-foreground mt-2">
            AI is generating 3 wealth-building paths tailored to you
          </p>
        </motion.div>
        <div className="flex gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* ─── Progress Bar ─── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          {(["Your dream", "Your fuel", "Your speed"] as const).map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i + 1 <= step ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-wealth rounded-full"
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* ─── Steps ─── */}
      <AnimatePresence mode="wait" custom={direction}>
        {step === 1 && (
          <motion.div
            key="step1"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight">What&apos;s your number?</h1>
              <p className="text-muted-foreground mt-2">Set the wealth target you want to reach</p>
            </div>

            {/* Currency pills */}
            <div className="flex gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currency === c.code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {c.code}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">{sym}</span>
              <Input
                type="text"
                value={targetInput}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pl-12 h-16 text-3xl font-bold bg-card border-border"
                placeholder="100,000"
              />
            </div>
            {targetAmount > 0 && targetAmount < 1000 && (
              <p className="text-xs text-destructive">Minimum: {sym}1,000</p>
            )}

            {/* Timeframe */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Timeframe</span>
                <Badge variant="secondary" className="text-sm font-medium">{tfLabel(timeframeMonths)}</Badge>
              </div>
              <Slider value={[timeframeMonths]} onValueChange={(v) => setTimeframeMonths(Array.isArray(v) ? v[0] : v)} min={6} max={240} step={6} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>6 months</span>
                <span>10 years</span>
                <span>20 years</span>
              </div>
            </div>

            {/* Live summary */}
            {targetAmount >= 1000 && (
              <motion.div
                key={`${targetAmount}-${timeframeMonths}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-5 rounded-xl bg-card border border-border"
              >
                <p className="text-sm text-muted-foreground">You want to build</p>
                <p className="text-2xl font-bold text-wealth-green mt-1">{sym}{fmt(targetAmount)}</p>
                <p className="text-sm text-muted-foreground mt-1">in {tfLabel(timeframeMonths)}</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight">How much can you set aside daily?</h1>
              <p className="text-muted-foreground mt-2">This is the fuel for your journey</p>
            </div>

            {/* Daily amount hero */}
            <div className="text-center py-6 rounded-xl bg-card border border-border">
              <motion.p
                key={dailySavings}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold text-wealth-green"
              >
                {sym}{dailySavings}
              </motion.p>
              <p className="text-sm text-muted-foreground mt-1">per day</p>
            </div>

            <div className="space-y-4">
              <Slider value={[dailySavings]} onValueChange={(v) => setDailySavings(Array.isArray(v) ? v[0] : v)} min={1} max={500} step={1} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{sym}1</span>
                <span>{sym}250</span>
                <span>{sym}500</span>
              </div>
            </div>

            {/* Monthly / Yearly */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-card border border-border p-4 text-center">
                <p className="text-xs text-muted-foreground">Monthly</p>
                <p className="text-lg font-bold mt-1">{sym}{fmt(dailySavings * 30)}</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-4 text-center">
                <p className="text-xs text-muted-foreground">Yearly</p>
                <p className="text-lg font-bold mt-1">{sym}{fmt(dailySavings * 365)}</p>
              </div>
            </div>

            {/* Coffee line */}
            <motion.p key={dailySavings} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-muted-foreground">
              That&apos;s like skipping{" "}
              <span className="text-foreground font-medium">
                {Math.round((dailySavings / 5) * 10) / 10} coffee{dailySavings >= 10 ? "s" : ""}
              </span>{" "}
              per day
            </motion.p>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Pick your speed</h1>
              <p className="text-muted-foreground mt-2">Higher speed = higher risk. Choose your comfort zone.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {([
                {
                  type: "conservative" as const,
                  icon: <Shield className="w-8 h-8" />,
                  title: "Steady",
                  desc: "Slow and steady, minimal risk. Mostly savings & gold.",
                  returns: "4-8% / year",
                  color: "text-wealth-blue",
                },
                {
                  type: "moderate" as const,
                  icon: <Bike className="w-8 h-8" />,
                  title: "Balanced",
                  desc: "Mix of ETFs, some crypto. Growth with guardrails.",
                  returns: "10-18% / year",
                  color: "text-wealth-green",
                },
                {
                  type: "aggressive" as const,
                  icon: <Rocket className="w-8 h-8" />,
                  title: "Full Speed",
                  desc: "Crypto-heavy DCA strategy. Maximum growth, buckle up.",
                  returns: "30-80% / year",
                  color: "text-wealth-gold",
                },
              ]).map((card) => {
                const selected = riskProfile === card.type;
                return (
                  <motion.button
                    key={card.type}
                    onClick={() => setRiskProfile(card.type)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative rounded-xl border-2 p-5 text-left transition-all ${
                      selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-muted-foreground/30"
                    }`}
                  >
                    {selected && (
                      <motion.div
                        layoutId="risk-check"
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <span className="text-[10px] text-primary-foreground font-bold">✓</span>
                      </motion.div>
                    )}
                    <div className={`${card.color} mb-3`}>{card.icon}</div>
                    <h3 className="font-bold text-base">{card.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{card.desc}</p>
                    <Badge variant="outline" className={`mt-3 text-[10px] ${selected ? "border-primary text-primary" : ""}`}>
                      {card.returns}
                    </Badge>
                  </motion.button>
                );
              })}
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              These projections are for educational purposes only. Past performance does not guarantee future results.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Nav Buttons ─── */}
      <div className="flex items-center justify-between mt-10">
        {step > 1 ? (
          <Button variant="ghost" onClick={goBack}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
        ) : (
          <div />
        )}
        <Button onClick={goNext} disabled={!canProceed} className={step === 3 ? "gradient-wealth text-white px-8" : "px-8"}>
          {step === 3 ? "Generate My Paths" : "Next"}
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
