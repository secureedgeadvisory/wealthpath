"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Shield, Bike, Rocket, ArrowRight, Calendar, TrendingUp, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { generateWealthPaths } from "@/lib/path-generator";
import { MOCK_GOAL } from "@/lib/mock-data";
import type { WealthPath } from "@/types";

const VEHICLE_COLORS: Record<string, { bg: string; label: string }> = {
  savings: { bg: "bg-blue-500", label: "Savings" },
  gold: { bg: "bg-yellow-500", label: "Gold" },
  etf: { bg: "bg-emerald-500", label: "ETFs" },
  crypto: { bg: "bg-purple-500", label: "Crypto" },
};

const PATH_META = {
  conservative: {
    icon: Shield,
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    riskLabel: "Low Risk",
    riskColor: "bg-blue-500",
    description: "Capital preservation first. Steady, predictable growth with minimal volatility.",
  },
  moderate: {
    icon: Bike,
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    riskLabel: "Medium Risk",
    riskColor: "bg-emerald-500",
    description: "Balanced approach. Growth-oriented with diversified protection.",
  },
  aggressive: {
    icon: Rocket,
    color: "text-purple-400",
    borderColor: "border-purple-500/30",
    riskLabel: "High Risk",
    riskColor: "bg-red-500",
    description: "Maximum growth potential. High volatility — buckle up for the ride.",
  },
};

export default function PathsPage() {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<WealthPath | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const paths = useMemo(() => generateWealthPaths(MOCK_GOAL), []);

  const formatTimeline = (months: number) => {
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (years === 0) return `${months} months`;
    if (rem === 0) return `${years} year${years > 1 ? "s" : ""}`;
    return `${years}y ${rem}m`;
  };

  const getArrivalDate = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => router.push("/launchpad"), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-muted-foreground mb-4">
          <Sparkles className="w-3.5 h-3.5 text-wealth-gold" />
          AI generated 3 paths for you
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Choose your path</h1>
        <p className="text-muted-foreground mt-2">
          {MOCK_GOAL.currency === "USD" ? "$" : MOCK_GOAL.currency}
          {MOCK_GOAL.target_amount.toLocaleString()} goal &middot; ${MOCK_GOAL.daily_savings}/day
        </p>
      </motion.div>

      {/* Path Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {paths.map((path, i) => {
          const meta = PATH_META[path.path_type];
          const Icon = meta.icon;
          const isSelected = selectedPath?.id === path.id;

          return (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={`relative cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/5 ${
                  isSelected
                    ? "border-primary ring-1 ring-primary"
                    : `border-border hover:${meta.borderColor}`
                }`}
                onClick={() => setSelectedPath(path)}
              >
                {/* Recommended badge */}
                {path.path_type === "moderate" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gradient-wealth text-white text-[10px] px-3 shadow-md">
                      Recommended
                    </Badge>
                  </div>
                )}

                <CardContent className="pt-7 pb-5 space-y-5">
                  {/* Title row */}
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-muted flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base capitalize">{path.path_type}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${meta.riskColor}`} />
                        <span className="text-xs text-muted-foreground">{meta.riskLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {meta.description}
                  </p>

                  {/* Vehicle mix bar */}
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                      Allocation
                    </p>
                    <div className="flex h-3 rounded-full overflow-hidden">
                      {Object.entries(path.vehicle_mix).map(([vehicle, pct]) => {
                        if (!pct) return null;
                        const color = VEHICLE_COLORS[vehicle];
                        return (
                          <div
                            key={vehicle}
                            className={`${color.bg} transition-all`}
                            style={{ width: `${pct}%` }}
                            title={`${color.label}: ${pct}%`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {Object.entries(path.vehicle_mix).map(([vehicle, pct]) => {
                        if (!pct) return null;
                        const color = VEHICLE_COLORS[vehicle];
                        return (
                          <div key={vehicle} className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${color.bg}`} />
                            <span className="text-[11px] text-muted-foreground">
                              {color.label} {pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground uppercase">Timeline</span>
                      </div>
                      <p className="text-sm font-bold">{formatTimeline(path.projected_timeline_months)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground uppercase">Returns</span>
                      </div>
                      <p className="text-sm font-bold">{path.monthly_return_pct}%/mo</p>
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="text-center py-2 rounded-lg border border-border">
                    <p className="text-[10px] text-muted-foreground">Estimated arrival</p>
                    <p className="text-sm font-bold text-wealth-green mt-0.5">
                      {getArrivalDate(path.projected_timeline_months)}
                    </p>
                  </div>

                  {/* CTA */}
                  <Button
                    className={`w-full ${
                      isSelected ? "gradient-wealth text-white" : ""
                    }`}
                    variant={isSelected ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPath(path);
                      setConfirming(true);
                    }}
                  >
                    {isSelected ? "Confirm this path" : "Choose this path"}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 mt-8 p-4 rounded-xl border border-border bg-card">
        <AlertTriangle className="w-4 h-4 text-wealth-gold shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          These projections are for educational purposes only. Past performance does not
          guarantee future results. This is not financial advice. Returns shown are
          historical averages and actual results may vary significantly. You execute all
          investment decisions on your own platforms.
        </p>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPath && (() => {
                const Icon = PATH_META[selectedPath.path_type].icon;
                return <Icon className={`w-5 h-5 ${PATH_META[selectedPath.path_type].color}`} />;
              })()}
              <span className="capitalize">{selectedPath?.path_type} Path</span>
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>
                You&apos;re choosing the <strong className="text-foreground">{selectedPath?.path_type}</strong> path.
              </p>
              {selectedPath && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Estimated arrival</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {getArrivalDate(selectedPath.projected_timeline_months)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Timeline</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {formatTimeline(selectedPath.projected_timeline_months)}
                    </p>
                  </div>
                </div>
              )}
              <p className="text-xs">
                You can change your path later in Settings. Ready to start your journey?
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={loading}>
              Let me reconsider
            </Button>
            <Button
              className="gradient-wealth text-white"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-1.5" />
              )}
              {loading ? "Setting up..." : "Let's go!"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
