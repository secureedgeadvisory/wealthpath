"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, X, Download, Share2, TrendingUp } from "lucide-react";
import confetti from "canvas-confetti";
import { toPng } from "html-to-image";
import type { Milestone, Goal } from "@/types";

interface MilestoneCelebrationProps {
  milestone: Milestone | null;
  goal: Goal;
  streak: number;
  open: boolean;
  onClose: () => void;
}

export function MilestoneCelebration({
  milestone,
  goal,
  streak,
  open,
  onClose,
}: MilestoneCelebrationProps) {
  const [count, setCount] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const progressPct = milestone
    ? Math.round((milestone.target_value / goal.target_amount) * 100)
    : 0;
  const currSym = goal.currency === "USD" ? "$" : goal.currency;

  // Counting animation
  useEffect(() => {
    if (!open || !milestone) return;
    setCount(0);
    setShowShare(false);

    // Fire confetti
    const timer1 = setTimeout(() => {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, colors: ["#22c55e", "#3b82f6", "#f59e0b", "#a855f7", "#ffffff"] });
    }, 300);

    // Count up
    const target = milestone.target_value;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
        // Second confetti burst
        setTimeout(() => {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
          setShowShare(true);
        }, 300);
      } else {
        setCount(Math.round(current));
      }
    }, duration / steps);

    return () => {
      clearTimeout(timer1);
      clearInterval(interval);
    };
  }, [open, milestone]);

  const handleDownload = async () => {
    if (!shareRef.current) return;
    try {
      const dataUrl = await toPng(shareRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `wealthpath-milestone-${currSym}${milestone?.target_value}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    }
  };

  const handleShare = async () => {
    if (!shareRef.current) return;
    try {
      const dataUrl = await toPng(shareRef.current, { pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "wealthpath-milestone.png", { type: "image/png" });
      if (navigator.share) {
        await navigator.share({ files: [file], title: "WealthPath Milestone" });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  if (!milestone) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 22 }}
            className="relative bg-card border border-border rounded-2xl max-w-md mx-4 overflow-hidden shadow-2xl"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 p-0 text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Main celebration */}
            <div className="p-8 text-center">
              {/* Trophy */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                <div className="w-20 h-20 rounded-full gradient-wealth flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-muted-foreground uppercase tracking-widest mt-4"
              >
                Milestone reached
              </motion.p>

              {/* Counting number */}
              <p className="text-5xl font-black text-wealth-green mt-2">
                {currSym}{count.toLocaleString()}
              </p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-xl font-bold mt-3"
              >
                {milestone.label}
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-sm text-muted-foreground mt-2"
              >
                {progressPct}% of your journey to {currSym}{goal.target_amount.toLocaleString()} complete
              </motion.p>
            </div>

            {/* Share card (hidden for capture, shown on demand) */}
            <AnimatePresence>
              {showShare && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 0.2 }}
                  className="border-t border-border"
                >
                  {/* Share card preview */}
                  <div className="p-4">
                    <div
                      ref={shareRef}
                      className="rounded-xl overflow-hidden"
                      style={{ background: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)" }}
                    >
                      <div className="p-6 text-center">
                        {/* Logo */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a7f37, #58a6ff)" }}>
                            <TrendingUp className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-white font-bold text-sm">WealthPath</span>
                        </div>

                        <p className="text-gray-400 text-xs uppercase tracking-widest">I just reached</p>
                        <p className="text-4xl font-black mt-1" style={{ color: "#22c55e" }}>
                          {currSym}{milestone.target_value.toLocaleString()}
                        </p>

                        {/* Progress bar */}
                        <div className="mt-4 mx-auto max-w-[200px]">
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #1a7f37, #22c55e)" }}
                            />
                          </div>
                          <p className="text-gray-400 text-xs mt-1.5">
                            {progressPct}% of my journey to {currSym}{goal.target_amount.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-1 mt-3">
                          <span style={{ color: "#f97316" }}>🔥</span>
                          <p className="text-gray-300 text-xs">
                            Day {streak} of my WealthPath journey
                          </p>
                        </div>

                        <p className="text-gray-600 text-[9px] mt-4">
                          Built with WealthPath
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 px-4 pb-4">
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="flex-1 gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      Save PNG
                    </Button>
                    <Button
                      onClick={handleShare}
                      className="flex-1 gap-1.5 gradient-wealth text-white"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
