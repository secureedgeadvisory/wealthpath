"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronUp,
  Check,
  ExternalLink,
  Rocket,
  AlertTriangle,
  Shield,
  Info,
  Lightbulb,
  Loader2,
  Banknote,
  Gem,
  BarChart3,
  Bitcoin,
} from "lucide-react";
import { MOCK_SELECTED_PATH } from "@/lib/mock-data";
import { generateSetupSections, type SetupSection } from "@/lib/launchpad-data";

const VEHICLE_ICONS: Record<string, React.ReactNode> = {
  savings: <Banknote className="w-5 h-5" />,
  gold: <Gem className="w-5 h-5" />,
  etf: <BarChart3 className="w-5 h-5" />,
  crypto: <Bitcoin className="w-5 h-5" />,
};

const VEHICLE_COLORS: Record<string, string> = {
  savings: "text-blue-400 bg-blue-400/10",
  gold: "text-yellow-400 bg-yellow-400/10",
  etf: "text-emerald-400 bg-emerald-400/10",
  crypto: "text-purple-400 bg-purple-400/10",
};

export default function LaunchpadPage() {
  const router = useRouter();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);

  const sections = useMemo(
    () => generateSetupSections(MOCK_SELECTED_PATH.vehicle_mix),
    []
  );

  const completedCount = completed.size;
  const totalCount = sections.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const canLaunch = completedCount >= 1;

  const toggleComplete = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const handleLaunch = () => {
    setLaunching(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-14 h-14 rounded-2xl gradient-wealth flex items-center justify-center mx-auto mb-4">
          <Rocket className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Before we start — let&apos;s set up your toolkit
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          These are one-time setup steps. Once done, your daily tasks will take
          less than 5 minutes.
        </p>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Setup progress</span>
          <span className="font-medium">
            {completedCount} of {totalCount} accounts ready
          </span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </motion.div>

      {/* Setup Sections */}
      <div className="space-y-3">
        {sections.map((section, i) => (
          <SetupCard
            key={section.id}
            section={section}
            index={i}
            isCompleted={completed.has(section.id)}
            isExpanded={expanded === section.id}
            onToggleComplete={() => toggleComplete(section.id)}
            onToggleExpand={() => toggleExpand(section.id)}
          />
        ))}
      </div>

      {/* Disclaimers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-2"
      >
        <div className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-card">
          <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              WealthPath does not endorse any specific platform. These are
              popular options for reference only.
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Do your own research before opening any financial account.
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              WealthPath never accesses your accounts. You manage all
              investments independently.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center gap-3 pt-2"
      >
        <Button
          onClick={handleLaunch}
          disabled={!canLaunch || launching}
          className="w-full sm:w-auto gradient-wealth text-white px-8 h-12 text-base"
        >
          {launching ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Rocket className="w-4 h-4 mr-2" />
          )}
          {launching ? "Launching..." : "I'm ready — Start my journey"}
        </Button>
        {!canLaunch && (
          <p className="text-xs text-muted-foreground">
            Check off at least 1 setup step to continue
          </p>
        )}
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Skip for now — I&apos;ll set up later
        </button>
      </motion.div>
    </div>
  );
}

function SetupCard({
  section,
  index,
  isCompleted,
  isExpanded,
  onToggleComplete,
  onToggleExpand,
}: {
  section: SetupSection;
  index: number;
  isCompleted: boolean;
  isExpanded: boolean;
  onToggleComplete: () => void;
  onToggleExpand: () => void;
}) {
  const colors = VEHICLE_COLORS[section.vehicle] || "text-muted-foreground bg-muted";
  const icon = VEHICLE_ICONS[section.vehicle];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.08 }}
    >
      <Card
        className={`transition-all ${
          isCompleted
            ? "border-emerald-500/20 bg-emerald-500/5"
            : "border-border"
        }`}
      >
        <CardContent className="pt-4 pb-3">
          {/* Header row */}
          <div className="flex items-center gap-3">
            {/* Checkbox */}
            <button
              onClick={onToggleComplete}
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                isCompleted
                  ? "border-emerald-500 bg-emerald-500"
                  : "border-muted-foreground/30 hover:border-primary"
              }`}
            >
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                </motion.div>
              )}
            </button>

            {/* Icon */}
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors}`}>
              {icon}
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                {section.title}
              </p>
              <Badge variant="outline" className="text-[10px] mt-0.5">
                {section.allocation}% of your path
              </Badge>
            </div>

            {/* Expand toggle */}
            <button
              onClick={onToggleExpand}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Expanded content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 ml-10 space-y-4">
                  {/* Explanation */}
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {section.explanation}
                    </p>
                  </div>

                  {/* Platforms */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      Popular platforms
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {section.platforms.map((p) => (
                        <div
                          key={p.name}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div>
                            <p className="text-xs font-medium">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.region}</p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Starter tips */}
                  {section.starterTips.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                        Getting started
                      </p>
                      <div className="space-y-1.5">
                        {section.starterTips.map((tip) => (
                          <div
                            key={tip.label}
                            className="flex items-start gap-2 p-2 rounded-lg"
                          >
                            <Lightbulb className="w-3 h-3 text-wealth-gold shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium">{tip.label}</p>
                              <p className="text-[10px] text-muted-foreground">{tip.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warning (crypto) */}
                  {section.warning && (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-300/90 leading-relaxed">
                        {section.warning}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
